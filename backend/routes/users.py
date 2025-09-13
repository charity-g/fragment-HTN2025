from fastapi import APIRouter, Query
from pydantic import BaseModel
import uuid
import boto3

router = APIRouter()

class User(BaseModel):
    name: str


@router.post("/create")
async def create_user(user: User):
    # Here you would implement the logic to create a new user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": str(uuid.uuid4()), "name": user.name}

@router.post("/login")
async def login_user(user: User):
    # Here you would implement the logic to log in a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": str(uuid.uuid4()), "name": user.name}


@router.get("/{user_id}")
async def get_user(user_id: str):
    # Here you would implement the logic to retrieve user details
    # TODO: not needed since only uuid right now
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "name": ""}

@router.post("/{user_id}/follow/")
async def follow_user(user_id: str):
    # Here you would implement the logic to follow a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "action": "followed"}

@router.get("/{user_id}/gifs")
async def get_user_gifs(user_id: str, tags: list[str] = Query(None)):
    # If tags are provided, search by tags using DynamoDB (example query)
    if tags:
        get_user_gifs_by_tag(user_id, tags)
    return {"status": "success", "user_id": user_id, "gifs": []}

def get_user_gifs_by_tag(user_id: str, tags: list[str]):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('fragments')
    # Example: Scan for items where tags attribute contains any of the provided tags
    # Note: For production, use OpenSearch for more advanced queries
    response = table.scan(
        FilterExpression="user_id = :uid AND (contains(tags, :tag0)" +
        "".join([f" OR contains(tags, :tag{i})" for i in range(1, len(tags))]) + ")",
        ExpressionAttributeValues={
            **{f":tag{i}": tag for i, tag in enumerate(tags)},
            ":uid": user_id
        }
    )
    gifs = response.get("Items", [])
    return {"status": "success", "user_id": user_id, "gifs": gifs}


@router.get("/{user_id}/tags")
async def get_user_tags(user_id: str):
    # Here you would implement the logic to retrieve user details
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "tags": []}