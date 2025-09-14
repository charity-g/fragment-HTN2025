from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import boto3
from datetime import datetime
import os

router = APIRouter()

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('users')

class User(BaseModel):
    user_id: str  # Auth0 sub
    email: str
    name: str
    picture: str = None
    username: str = None

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str = None
    username: str = None
    created_at: str
    updated_at: str

@router.post("/create", response_model=UserResponse)
async def create_user(user: User):
    try:
        # Check if user already exists
        existing_user = users_table.get_item(Key={'user_id': user.user_id})
        
        if 'Item' in existing_user:
            # User exists, update their info
            users_table.update_item(
                Key={'user_id': user.user_id},
                UpdateExpression='SET email = :email, #name = :name, picture = :picture, username = :username, updated_at = :updated_at',
                ExpressionAttributeNames={
                    '#name': 'name'
                },
                ExpressionAttributeValues={
                    ':email': user.email,
                    ':name': user.name,
                    ':picture': user.picture,
                    ':username': user.username,
                    ':updated_at': datetime.utcnow().isoformat()
                }
            )
            return UserResponse(
                user_id=user.user_id,
                email=user.email,
                name=user.name,
                picture=user.picture,
                username=user.username,
                created_at=existing_user['Item'].get('created_at', datetime.utcnow().isoformat()),
                updated_at=datetime.utcnow().isoformat()
            )
        else:
            # New user, create them
            user_item = {
                'user_id': user.user_id,
                'email': user.email,
                'name': user.name,
                'picture': user.picture,
                'username': user.username,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            users_table.put_item(Item=user_item)
            
            return UserResponse(**user_item)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating/updating user: {str(e)}")

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    try:
        response = users_table.get_item(Key={'user_id': user_id})
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found")
            
        return UserResponse(**response['Item'])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user: {str(e)}")

@router.post("/{user_id}/follow/")
async def follow_user(user_id: str):
    # Here you would implement the logic to follow a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "action": "followed"}

@router.get("/{user_id}/gifs")
async def get_user_gifs(user_id: str, tags: list[str] = Query(None)):
    # If tags is not None and not empty, search by tags using DynamoDB (example query)
    if tags and len(tags) > 0:
        print("Searching gifs for user", user_id, "by tags:", tags)
        return get_user_gifs_by_tag(user_id, tags)
    
    # get dynamo db items where user_id matches
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('fragments')
    response = table.scan(
        FilterExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id}
    )

    s3 = boto3.client('s3')
    bucket = "fragment-gifs"
    gif_urls = []

    video_items =  response.get("Items", [])
    filtered_video_items = []
    for item in video_items:
        gif_name = item['gif_link']
        try:
            s3.head_object(Bucket=bucket, Key=gif_name)
            presigned_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': gif_name},
                ExpiresIn=10000
            )
            item['gif_url'] = presigned_url
            item['s3_url'] = f"https://{bucket}.s3.amazonaws.com/{gif_name}"
            filtered_video_items.append(item)
        except Exception as e:
            print(f"Error generating presigned URL for {gif_name}: {e}")
            continue

    return {"status": "success", "user_id": user_id, "gifs": filtered_video_items}

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
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('fragments')
    response = table.scan(
        FilterExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id}
    )

    tag_set = set()
    for item in response.get("Items", []):
        tags = item.get("tags", [])
        for tag in tags:
            if not tag:  # guard against empty tag
                continue
            tag_set.add(tag)

    return {"status": "success", "user_id": user_id, "tags": list(tag_set)}



@router.get("/{user_id}/collections")
async def get_user_collections(user_id: str):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('fragments')
    response = table.scan(
        FilterExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id}
    )

    GIF_BUCKET = "fragment-gifs"
    collections_set = {}
    for item in response.get("Items", []):
        tags = item.get("tags", [])
        for tag in tags:
            if tag in collections_set:
                collections_set[tag]["count"] += 1
            else:
                collections_set[tag] = {
                    "count": 1,
                    "gif_url": f"https://{GIF_BUCKET}.s3.amazonaws.com/{item.get('gif_link', '')}",
                    "title": tag,
                    "privacy": item.get("privacy", "private")
                }
    return {"status": "success", "user_id": user_id, "collections": list(collections_set.values())}


