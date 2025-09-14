import json
import boto3
import requests
from requests_aws4auth import AWS4Auth

region = 'us-east-1'
service = 'es'
host = 'https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'
domain = 'fragment-opensearch'
index_name = "tag_fragment_index"

credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

def ensure_index_exists():
    # Check if index exists, create if not
    url = f"{host}/{index_name}"
    response = requests.head(url, auth=awsauth)
    if response.status_code == 404:
        # Create index with default settings
        create_resp = requests.put(url, auth=awsauth, headers={"Content-Type": "application/json"}, json={})
        print(f"Created index {index_name}: {create_resp.status_code} {create_resp.text}")

def index_dynamo_item_to_opensearch(item):
    ensure_index_exists()
    doc_id = item['video_id']
    document = {
        "user_id": item.get('user_id', ''),
        "video_id": item.get('video_id', ''),
        "title": item.get('title', ''),
        "description": item.get('description', ''),
        "tags": item.get('tags', []),
        "created_at": item.get('created_at', ''),
        "editingInstructions": item.get('editingInstructions', ''),
        "videoSummary": item.get('videoSummary', ''),
        "updated_at": item.get('updated_at', '')
    }
    url = f"{host}/{index_name}/_doc/{doc_id}"
    response = requests.put(url, auth=awsauth, json=document, headers={"Content-Type": "application/json"})
    print(f"Indexed {doc_id} into {index_name}: {response.status_code} {response.text}")

def lambda_handler(event, context):
    print("OPENSEARCH Lambda handler started")  # Add this line for debugging
    for record in event['Records']:
        if record['eventName'] in ['INSERT', 'MODIFY']:
            new_image = record['dynamodb']['NewImage']
            # Convert DynamoDB format to regular dict
            item = {}
            for k, v in new_image.items():
                # Handle string, number, and list types
                if 'S' in v:
                    item[k] = v['S']
                elif 'N' in v:
                    item[k] = v['N']
                elif 'L' in v:
                    item[k] = [elem.get('S', '') for elem in v['L']]
                else:
                    item[k] = v
            index_dynamo_item_to_opensearch(item)

# - Check CloudWatch logs for errors (import errors, timeout, etc).
# - Make sure your Lambda memory and timeout settings are sufficient.

