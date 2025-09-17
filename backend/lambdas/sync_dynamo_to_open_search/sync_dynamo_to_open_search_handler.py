import json
import boto3
import requests
from requests_aws4auth import AWS4Auth

region = 'us-east-1'
service = 'es'
host = 'https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'
domain = 'fragment-opensearch'
index_name = "tag_fragment_index"

# Get credentials (uses aws configure)
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

def ensure_index_exists():
    # Check if index exists, if not create an empty index.
    url = f"{host}/{index_name}"
    response = requests.head(url, auth=awsauth)
    if response.status_code != 200:
        # Create index with basic settings and mappings for tags as keyword array
        index_settings = {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 1
            },
            "mappings": {
                "properties": {
                    "user_id": {"type": "keyword"},
                    "video_id": {"type": "keyword"},
                    "title": {"type": "text"},
                    "description": {"type": "text"},
                    "tags": {"type": "keyword"},
                    "notes": {"type": "text"},
                    "sourceURL": {"type": "keyword"},
                    "created_at": {"type": "date", "format": "strict_date_optional_time||epoch_millis"},
                    "editingInstructions": {"type": "text"},
                    "videoSummary": {"type": "text"},
                    "updated_at": {"type": "date", "format": "strict_date_optional_time||epoch_millis"}
                }
            }
        }
        create_resp = requests.put(url, auth=awsauth, headers={"Content-Type": "application/json"}, json=index_settings)
        print(f"Created index {index_name}: {create_resp.status_code} {create_resp.text}")

# convert raw dynamodb record to JSON for opensearch
def transform_dynamodb_record(dynamodb_image):
    """Convert DynamoDB format to regular Python dict"""
    item = {}
    for k, v in dynamodb_image.items():
        if 'S' in v:  # String
            item[k] = v['S']
        elif 'N' in v:  # Number
            item[k] = v['N']
        elif 'BOOL' in v:  # Boolean
            item[k] = v['BOOL']
        elif 'L' in v:  # List
            item[k] = [transform_dynamodb_record([elem])[0] if 'M' in elem else elem.get('S', '') for elem in v['L']]
        elif 'M' in v:  # Map
            item[k] = transform_dynamodb_record(v['M'])
        elif 'NULL' in v:  # Null
            item[k] = None
        else:
            item[k] = v
    return item

def index_dynamo_item_to_opensearch(item):
    ensure_index_exists()
    doc_id = item['video_id']
    document = {
        "user_id": item.get('user_id', ''),
        "video_id": item.get('video_id', ''),
        "description": item.get('description', ''),
        "tags": item.get('tags', []),
        "notes": item.get('notes', ''),
        "sourceURL": item.get('sourceURL', ''),
        "created_at": item.get('created_at', ''),
        "updated_at": item.get('updated_at', ''),
        "editingInstructions": item.get('editingInstructions', ''),
        "videoSummary": item.get('videoSummary', ''),
        "gif_link": item.get('gif_link', ''),
        "webm_link": item.get('webm_link', ''),
        "is_public": item.get('is_public', False)
    }
    url = f"{host}/{index_name}/_doc/{doc_id}"
    response = requests.put(url, auth=awsauth, json=document, headers={"Content-Type": "application/json"})
    print(f"Indexed {doc_id} into {index_name}: {response.status_code} {response.text}")

def lambda_handler(event, context):
    print("OPENSEARCH Lambda handler started")
    for record in event['Records']:
        event_name = record['eventName']
        
        # decide what to do based on data update
        if event_name in ['INSERT', 'MODIFY']:
            # Handle new or modified records
            # new image is new version of data
            new_image = record['dynamodb']['NewImage'] 
            item = transform_dynamodb_record(new_image)
            index_dynamo_item_to_opensearch(item) # is a PUT
            
        elif event_name == 'REMOVE':
            old_image = record['dynamodb']['OldImage'] # the old data
            item = transform_dynamodb_record(old_image)
            doc_id = item.get('video_id')
            if doc_id:
                url = f"{host}/{index_name}/_doc/{doc_id}"
                response = requests.delete(url, auth=awsauth) # is a DELETE!
                print(f"Deleted {doc_id} from {index_name}: {response.status_code} {response.text}")


