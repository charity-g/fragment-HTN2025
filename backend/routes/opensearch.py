import requests
from fastapi import APIRouter
import json
import boto3
from requests_aws4auth import AWS4Auth

router = APIRouter()

# OpenSearch configuration
region = 'us-east-1'
service = 'es'
host = 'https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'
index_name = "tag_fragment_index"

# Set up AWS authentication
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

@router.get("/health")
async def opensearch_health():
    """Check if OpenSearch is accessible"""
    try:
        url = f"{host}/_cluster/health"
        response = requests.get(url, auth=awsauth)
        return {"status": "success", "health": response.json()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/indices")
async def list_indices():
    """List all indices in OpenSearch"""
    try:
        url = f"{host}/_cat/indices?format=json"
        response = requests.get(url, auth=awsauth)
        return {"status": "success", "indices": response.json()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/test/{user_id}")
async def test_opensearch(user_id: str):
    """Search for documents by user_id"""
    try:
        query = {
            "query": {
                "bool": {
                    "must": [
                        { "match": { "user_id": user_id } }
                    ]
                }
            }
        }
        url = f"{host}/{index_name}/_search"
        response = requests.get(url, auth=awsauth, json=query)
        result = response.json()
        hits = result.get("hits", {}).get("hits", [])
        return {"status": "success", "hits": hits}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/video/{video_id}")
async def get_video_by_id(video_id: str):
    """Get a specific document by video_id"""
    try:
        url = f"{host}/{index_name}/_doc/{video_id}"
        response = requests.get(url, auth=awsauth)
        if response.status_code == 200:
            return {"status": "success", "document": response.json()}
        elif response.status_code == 404:
            return {"status": "not_found", "message": f"Video {video_id} not found"}
        else:
            return {"status": "error", "message": f"OpenSearch error: {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/all")
async def get_all_documents():
    """Get all documents from the index"""
    try:
        query = {
            "query": {
                "match_all": {}
            },
            "size": 100  # Limit to 100 documents
        }
        url = f"{host}/{index_name}/_search"
        response = requests.get(url, auth=awsauth, json=query)
        result = response.json()
        hits = result.get("hits", {}).get("hits", [])
        total = result.get("hits", {}).get("total", {}).get("value", 0)
        
        # Extract just the source documents for cleaner output
        documents = [hit["_source"] for hit in hits]
        
        return {
            "status": "success", 
            "total_documents": total,
            "returned_documents": len(documents),
            "documents": documents
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}