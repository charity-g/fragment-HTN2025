import requests
from fastapi import APIRouter
import json
import boto3
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

opensearch_url = "https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com/fragments/_search"

router = APIRouter()

host = 'https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'
index_name = "tag_fragment_index"

@router.get("/test/{user_id}")
async def test_opensearch(user_id: str):
    query = {
        "query": {
            "term": {
                "tags": "mixed-"
            }
        }
    }
    # Make the actual HTTP request to OpenSearch
    response = requests.get(
        opensearch_url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(query)
    )
    result = response.json()
    hits = result.get("hits", {}).get("hits", [])
    return {"status": "success", "hits": hits}


@router.get("/count")
def get_index_document_count():
    url = f"{host}/{index_name}/_count"
    response = requests.get(url, auth=awsauth, headers={"Content-Type": "application/json"})
    if response.status_code == 200:
        count = response.json().get("count", 0)
        print(f"Total documents in {index_name}: {count}")
        return count
    else:
        print(f"Failed to get document count: {response.status_code} {response.text}")
        return None


@router.get("/all_docs")
def get_all_documents():
    url = f"{host}/{index_name}/_search"
    query = {
        "query": {
            "match_all": {}
        },
        "size": 1000  # Adjust size as needed
    }
    response = requests.get(url, auth=awsauth, headers={"Content-Type": "application/json"}, json=query)
    if response.status_code == 200:
        hits = response.json().get("hits", {}).get("hits", [])
        print(f"Retrieved {len(hits)} documents from {index_name}")
        return hits
    else:
        print(f"Failed to retrieve documents: {response.status_code} {response.text}")
        return []

@router.get("/search")
def search_by_user_and_tags(user_id: str = 'system', tags: list[str] = ["motion"]):
    url = f"{host}/{index_name}/_search"
    query = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"user_id": user_id}},
                    {"terms": {"tags": tags}}
                ]
            }
        }
    }
    response = requests.get(url, auth=awsauth, headers={"Content-Type": "application/json"}, json=query)
    if response.status_code == 200:
        hits = response.json().get("hits", {}).get("hits", [])
        print(f"Search results for user_id={user_id} and tags={tags}: {len(hits)} hits")
        return hits
    else:
        print(f"Search failed: {response.status_code} {response.text}")
        return []

# Example usage:
# search_by_user_and_tags("system", ["motion", "tag2"])

# - Check CloudWatch logs for errors (import errors, timeout, etc).
# - Make sure your Lambda memory and timeout settings are sufficient.