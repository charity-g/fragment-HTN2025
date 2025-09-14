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

@router.get("/search")
async def fuzzy_search(
    q: str = None,
    user_id: str = None,
    size: int = 20,
    from_: int = 0
):
    """Fuzzy search across tags and description fields for a specific user"""
    try:
        print(f"🔍 Search Debug - Query: '{q}', User ID: '{user_id}'")
        
        # First, let's check what documents exist for this user
        debug_query = {
            "query": {
                "term": {"user_id": user_id}
            },
            "size": 5
        }
        debug_url = f"{host}/{index_name}/_search"
        debug_response = requests.get(debug_url, auth=awsauth, json=debug_query)
        debug_result = debug_response.json()
        debug_hits = debug_result.get("hits", {}).get("hits", [])
        print(f"🔍 Documents for user '{user_id}': {len(debug_hits)} found")
        for hit in debug_hits:
            doc = hit.get("_source", {})
            print(f"🔍   - Video ID: {doc.get('video_id')}, Tags: {doc.get('tags')}, Description: '{doc.get('description')}'")
        
        # Build the query with user filter
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": ["tags^2", "description"],  # Boost tags field
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                                "prefix_length": 1,
                                "max_expansions": 50
                            }
                        }
                    ],
                    "filter": [
                        {"term": {"user_id": user_id}}
                    ]
                }
            },
            "size": size,
            "from": from_,
            "sort": [
                {"_score": {"order": "desc"}}
            ],
            "highlight": {
                "fields": {
                    "tags": {},
                    "description": {}
                }
            }
        }
        
        print(f"🔍 OpenSearch Query: {json.dumps(query, indent=2)}")
        
        url = f"{host}/{index_name}/_search"
        print(f"🔍 Request URL: {url}")
        
        response = requests.get(url, auth=awsauth, json=query)
        print(f"🔍 Response Status: {response.status_code}")
        
        result = response.json()
        print(f"🔍 OpenSearch Response: {json.dumps(result, indent=2)}")
        
        hits = result.get("hits", {}).get("hits", []) # the individual items
        total = result.get("hits", {}).get("total", {}).get("value", 0)
        
        # Extract documents with highlights
        documents = []
        for hit in hits:
            doc = hit["_source"].copy()
            doc["_score"] = hit["_score"]
            if "highlight" in hit: # hit will have the matched term highlighted like "tags": ["digital interface", "<em>calendar</em>", "masking"],
                # this enables frontend to highlight the matched term
                doc["highlight"] = hit["highlight"]
            documents.append(doc)
        
        return {
            "status": "success",
            "query": q,
            "total_hits": total,
            "returned_documents": len(documents),
            "documents": documents
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/search-system")
async def search_system_videos(q: str):
    """Test search for system user videos"""
    try:
        print(f"🔍 System Search Debug - Query: '{q}'")
        
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": ["tags^2", "description"],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                                "prefix_length": 1,
                                "max_expansions": 50
                            }
                        }
                    ],
                    "filter": [
                        {"term": {"user_id": "system"}}
                    ]
                }
            },
            "size": 20,
            "sort": [
                {"_score": {"order": "desc"}}
            ],
            "highlight": {
                "fields": {
                    "tags": {},
                    "description": {}
                }
            }
        }
        
        url = f"{host}/{index_name}/_search"
        response = requests.get(url, auth=awsauth, json=query)
        result = response.json()
        
        hits = result.get("hits", {}).get("hits", [])
        total = result.get("hits", {}).get("total", {}).get("value", 0)
        
        documents = []
        for hit in hits:
            doc = hit["_source"].copy()
            doc["_score"] = hit["_score"]
            if "highlight" in hit:
                doc["highlight"] = hit["highlight"]
            documents.append(doc)
        
        return {
            "status": "success",
            "query": q,
            "total_hits": total,
            "returned_documents": len(documents),
            "documents": documents
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}



@router.post("/non-matching-user")
async def search_non_matching_user(user_id: str):
    """Search for documents with a user_id that does not match any documents, gif_link is not empty, and tags has at least one element"""
    try:
        print(f"🔍 Non-Matching User Search Debug - User ID: '{user_id}'")
        
        query = {
            "query": {
                "bool": {
                    "must_not": [
                        {"term": {"user_id": user_id}},
                        # {"term": {"gif_link": ""}},
                        # {"term": {"gif_link": None}},
                    ],
                    "filter": [
                        # {"exists": {"field": "gif_link"}},
                        # {"exists": {"field": "tags"}},
                    ]
                }
            },
            "size": 20,
            "sort": [
                {"_score": {"order": "desc"}}
            ],
            "highlight": {
                "fields": {
                    "tags": {},
                    "description": {}
                }
            }
        }
        
        url = f"{host}/{index_name}/_search"
        response = requests.get(url, auth=awsauth, json=query)
        result = response.json()
        
        hits = result.get("hits", {}).get("hits", [])
        total = result.get("hits", {}).get("total", {}).get("value", 0)
        
        documents = []
        for hit in hits:
            doc = hit["_source"].copy()
            doc["_score"] = hit["_score"]
            if "highlight" in hit:
                doc["highlight"] = hit["highlight"]
            documents.append(doc)
        
        return {
            "status": "success",
            "total_hits": total,
            "returned_documents": len(documents),
            "documents": documents
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
