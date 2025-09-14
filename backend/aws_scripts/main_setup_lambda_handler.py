import json
import urllib.parse
import boto3
from datetime import datetime
import os
import time

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
mediaconvert = boto3.client('mediaconvert')
table = dynamodb.Table('fragments')

def create_gif_with_mediaconvert(input_s3_uri: str, video_id: str, width: int, height: int, loop: bool = True):
    # Get MediaConvert endpoint
    response = mediaconvert.describe_endpoints()
    endpoint = response['Endpoints'][0]['Url']
    
    # Create MediaConvert client with endpoint
    mc_client = boto3.client('mediaconvert', endpoint_url=endpoint)
    
    gif_settings = {
        'FramerateControl': 'INITIALIZE_FROM_SOURCE',
        'FramerateConversionAlgorithm': 'DUPLICATE_DROP'
    }
    if loop:
        # Loop GIF infinitely
        gif_settings['LoopCount'] = 0  # 0 means infinite loop in MediaConvert

    # Job settings for GIF conversion
    job_settings = {
        'Role': 'arn:aws:iam::348076083335:role/MediaConvertRole',
        'Settings': {
            'Inputs': [{
                'FileInput': input_s3_uri,
                'TimecodeSource': 'ZEROBASED'
            }],
            'OutputGroups': [{
                'Name': 'File Group',
                'OutputGroupSettings': {
                    'Type': 'FILE_GROUP_SETTINGS',
                    'FileGroupSettings': {
                        'Destination': f's3://fragment-gifs/{video_id}'
                    }
                },
                'Outputs': [{
                    'NameModifier': '_gif',
                    'ContainerSettings': {
                        'Container': 'GIF'
                    },
                    'VideoDescription': {
                        'CodecSettings': {
                            'Codec': 'GIF',
                            'GifSettings': gif_settings
                        },
                        'Width': width,
                        'Height': height,
                        'TimecodeInsertion': 'DISABLED'
                    }
                }]
            }]
        }
    }
    job = mc_client.create_job(**job_settings)
    return job['Job']['Id']

def check_job_status(job_id: str):
    # Get MediaConvert endpoint
    response = mediaconvert.describe_endpoints()
    endpoint = response['Endpoints'][0]['Url']
    
    # Create MediaConvert client with endpoint
    mc_client = boto3.client('mediaconvert', endpoint_url=endpoint)
    
    # Get job status
    job = mc_client.get_job(Id=job_id)
    return job['Job']['Status']  # 'SUBMITTED', 'PROGRESSING', 'COMPLETE', 'ERROR'

def wait_for_job_completion(job_id: str, max_wait_seconds: int = 300):
    """Wait for MediaConvert job to complete, with timeout"""
    start_time = time.time()
    
    while time.time() - start_time < max_wait_seconds:
        status = check_job_status(job_id)
        print(f"Job {job_id} status: {status}")
        
        if status == 'COMPLETE':
            return True
        elif status == 'ERROR':
            return False
        
        # Wait 10 seconds before checking again
        time.sleep(10)
    
    print(f"Job {job_id} timed out after {max_wait_seconds} seconds")
    return False

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
            job_id = create_gif_with_mediaconvert(input_s3_uri, video_id, width=width, height=height)
            print(f"MediaConvert job created: {job_id} for video {video_id}")

            if wait_for_job_completion(job_id, max_wait_seconds=300):
                print("GIF conversion completed successfully!")
            else:
                print("GIF conversion failed or timed out")
                gif_link = None
        except Exception as e:
            print(f"MediaConvert job failed: {e}")
            gif_link = None

        try:
            os.remove(temp_webm)
        except Exception:
            pass

        # Write to DynamoDB - Full video record
        dynamo_item = {
            'video_id': video_id,
            'tags': [],
            'user_id': response['Metadata'].get('user_id', 'system'),
            'is_public': False,
            'gif_link': gif_link,
            'webm_link': f's3://{bucket}/{key}',
            'created_at': timestamp,
            'updated_at': timestamp
        }
        try:
            initial_tags = response['Metadata'].get('initial_tags', '')
            dynamo_item['tags'] = initial_tags.split(',') if initial_tags else []
            dynamo_item['editingInstructions'] = response['Metadata'].get('editingInstructions', '')
            dynamo_item['videoSummary'] = response['Metadata'].get('videoSummary', '')
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