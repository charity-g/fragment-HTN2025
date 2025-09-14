import requests
from fastapi import APIRouter
import json

opensearch_url = "https://search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com/fragments/_search"

router = APIRouter()

@router.get("/test/{user_id}")
async def test_opensearch(user_id: str):
    query = {
        "query": {
            "bool": {
                "must": [
                    { "match": { "user_id": user_id } },
                    # { "match": { "tags": "motion" } }
                ]
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