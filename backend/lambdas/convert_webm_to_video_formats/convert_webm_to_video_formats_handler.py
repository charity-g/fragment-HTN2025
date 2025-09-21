import json
import urllib.parse
import boto3
from datetime import datetime
import os
import time
import subprocess
import shlex

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('fragments')
aws_s3_bucket = 'fragment-gifs'

def create_gif(input_s3_uri: str, temp_webm: str, video_id: str, width: int, height: int):
    gif_link = f'{video_id}_gif.gif'
    temp_gif = f'/tmp/{gif_link}'

    # Parse bucket and key from input_s3_uri
    s3_source_bucket = "fragment-webm"
    s3_source_key = "/".join(input_s3_uri.replace("s3://", "").split("/")[1:])
    SIGNED_URL_TIMEOUT = 3600

    # Generate presigned URL for source video
    s3_source_signed_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': s3_source_bucket, 'Key': s3_source_key},
        ExpiresIn=SIGNED_URL_TIMEOUT
    )

    # Find ffmpeg binary path from Lambda layer
    ffmpeg_bin = "/opt/bin/ffmpeg"
    if not os.path.isfile(ffmpeg_bin):
        ffmpeg_bin = "/opt/bin/ffmpeg.exe"
    if not os.path.isfile(ffmpeg_bin):
        raise FileNotFoundError("ffmpeg binary not found at /opt/bin/ffmpeg or /opt/bin/ffmpeg.exe")

    # Run ffmpeg to convert to GIF
    # Use local file instead of presigned URL for input
    ffmpeg_cmd = f"{ffmpeg_bin} -y -i {temp_webm} -vf scale={width}:{height} {temp_gif}"
    command1 = shlex.split(ffmpeg_cmd)

    try:
        p1 = subprocess.run(command1, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"ffmpeg command: {ffmpeg_cmd}")
        print(f"ffmpeg stderr: {p1.stderr.decode()}")
        if p1.returncode != 0:
            error_lines = [line for line in p1.stderr.decode().split('\n') if "Error" in line or "No such file" in line or "Invalid" in line or "Segmentation fault" in line]
            print("ffmpeg error details:", "\n".join(error_lines))
            raise Exception("ffmpeg conversion failed")
        else:
            print(f"ffmpeg output: {p1.stdout.decode()}")
    except Exception as e:
        print(f"ffmpeg conversion failed: {e}")
        raise Exception("ffmpeg conversion failed") 

    # Upload to AWS S3 bucket
    s3.upload_file(temp_gif, aws_s3_bucket, gif_link)
    print(f"Uploaded GIF to S3: s3://{aws_s3_bucket}/{gif_link}")

    # Clean up temp files
    try:
        os.remove(temp_gif)
    except Exception:
        pass

    return gif_link

def lambda_handler(event, context):
    print("=== LAMBDA TRIGGERED ===")
    print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    try:    
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        response = s3.get_object(Bucket=bucket, Key=key)
        print("CONTENT TYPE: " + response['ContentType'])
        
        video_id = key.split('/')[-1].split('.')[0]  # Remove file extension
        timestamp = datetime.utcnow().isoformat() + 'Z'
        width = int(response['Metadata'].get('width', 720))
        height = int(response['Metadata'].get('height', 480))

        temp_webm = f'/tmp/{video_id}.webm'

        s3.download_file(bucket, key, temp_webm)
        print(f"Downloaded WebM: {temp_webm}")
        
        # Convert to GIF using MediaConvert
        input_s3_uri = f's3://{bucket}/{key}'
        gif_link = f'{video_id}_gif.gif'


        try:
            print("Trying to create GIF for video", video_id)
            job_id = create_gif(input_s3_uri, temp_webm, video_id, width=width, height=height)
            print(f"GIF Job created: {job_id} for video {video_id}")

        except Exception as e:
            print(f"GIF Conversion job failed: {e}")
            gif_link = None
    
        try:
            os.remove(temp_webm)
        except Exception:
            pass

        print("Metadata", response['Metadata'])
        # Write to DynamoDB - Full video record
        dynamo_item = {
            'video_id': video_id,
            'tags': [],
            'notes': response['Metadata'].get('notes', ''),
            'user_id': response['Metadata'].get('user_id', 'system'),
            'privacy': response['Metadata'].get('privacy', 'private'),
            'gif_link': gif_link,
            'webm_link': f's3://{bucket}/{key}',
            'sourceURL': response['Metadata'].get('sourceurl', ''),
            'created_at': timestamp,
            'updated_at': timestamp,
            'editingInstructions': response['Metadata'].get('editinginstructions', ''),
            'videoSummary': response['Metadata'].get('videosummary', '')
        }
        try:
            initial_tags = response['Metadata'].get('initial_tags', '')
            dynamo_item['tags'] = initial_tags.split(',') if initial_tags else []
        except Exception:
            dynamo_item['tags'] = []

        for key in ['title', 'description', 'source_link']:
            if key in response['Metadata']:
                dynamo_item[key] = response['Metadata'].get(key, None)

        table.put_item(Item=dynamo_item)
        print(f"Saved to DynamoDB: {video_id}")

        return {
            "status": "success",
            "video_id": video_id,
            "message": "Saved to DynamoDB!"
        }
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(
            key if 'key' in locals() else 'unknown',
            bucket if 'bucket' in locals() else 'unknown'
        ))
        return {
            "status": "error",
            "error": str(e)
        }

# To invoke this Lambda function manually using AWS CLI:
# 1. Create a file called event.json with the following content:
# {
#   "Records": [
#     {
#       "s3": {
#         "bucket": { "name": "fragment-webm" },
#         "object": { "key": "uploads/example.webm" }
#       }
#     }
#   ]
# }
#
# 2. Run this command in your terminal (note the --cli-binary-format flag):
# aws lambda invoke --function-name ConvertWebMToVideoFormats --payload file://event.json output.json --cli-binary-format raw-in-base64-out
#
# Replace 'ConvertWebMToVideoFormats' with your actual Lambda function name if different.
# The result will be saved in output.json.