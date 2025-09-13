import json
import boto3
import requests
from requests_aws4auth import AWS4Auth

region = 'us-east-1'
service = 'es'
host = 'https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'

credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] in ['INSERT', 'MODIFY']:
            new_image = record['dynamodb']['NewImage']
            print(f"Processing record: {new_image}")
            doc_id = new_image['video_id']['S']

            # Convert DynamoDB format to regular dict
            document = {
                "video_id": new_image['video_id']['S'],
                "title": new_image.get('title', {}).get('S', ''),
                "content": new_image.get('content', {}).get('S', ''),
                "timestamp": new_image.get('created_at', {}).get('S', '')
            }

            # Index to OpenSearch
            url = f"{host}/fragments/_doc/{doc_id}"
            response = requests.put(url, auth=awsauth, json=document, headers={"Content-Type": "application/json"})
            print(f"Indexed {doc_id}: {response.status_code}")

