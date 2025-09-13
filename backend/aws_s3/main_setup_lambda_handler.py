import json
import urllib.parse
import boto3
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('fragments')

def lambda_handler(event, context):
    print("=== LAMBDA TRIGGERED ===")
    print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    try:    
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        response = s3.get_object(Bucket=bucket, Key=key)
        print("CONTENT TYPE: " + response['ContentType'])
        
        # Write to DynamoDB - Full video record
        video_id = key.split('/')[-1].split('.')[0]  # Remove file extension
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        dynamo_item = {
            'video_id': video_id,
            'tags': ['tag1', 'tag2'],  # random for now
            'notes': f'Video uploaded from S3: {key}',
            'is_public': False,  # default to private
            'gif_link': f's3://fragment-webm/gifs/{video_id}.gif',  # Placeholder!
            'webm_link': f's3://{bucket}/{key}',
            'user_id': 'system',  # Default user!
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        table.put_item(Item=dynamo_item)
        print(f"Saved to DynamoDB: {video_id}")
        
        return {
            'statusCode': 200,
            'body': {'message': f'Successfully processed {key} from {bucket} and saved to DynamoDB.', 'video_id': video_id  }
        }
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(
            key if 'key' in locals() else 'unknown',
            bucket if 'bucket' in locals() else 'unknown'
        ))  
        return {
            'statusCode': 400,
            'body': str(e)
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