import json
import boto3

amazon_db = "fragment-tags"

def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] in ['INSERT', 'MODIFY', 'REMOVE']:
            new_image = record['dynamodb']['NewImage']
            print(f"Processing record: {new_image}")
            
            # check tags

            