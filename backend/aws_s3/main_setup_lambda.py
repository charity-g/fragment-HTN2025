import boto3
import dotenv
import urllib.parse

s3 = boto3.resource('s3')

AWS_ID = dotenv.get_key("AWS_ID")
AWS_SECRET = dotenv.get_key("AWS_SECRET")
REGION_NAME = 'us-east-1'
DEFAULT_OUTPUT_FORMAT = 'json'

# TODO: aws create policy

# TODO aws create role

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        print("CONTENT TYPE: " + response['ContentType'])
        return response['ContentType']
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e

      
# TODO: create lambda function in aws console

# TODO: add s3 trigger to lambda function in aws console