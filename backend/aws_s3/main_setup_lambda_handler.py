import json
import urllib.parse
import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    print("=== LAMBDA TRIGGERED ===")
    print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        response = s3.get_object(Bucket=bucket, Key=key)
        print("CONTENT TYPE: " + response['ContentType'])
        return {
            "status": "success",
            "content_type": response['ContentType'],
            "bucket": bucket,
            "key": key
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