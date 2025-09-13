from fastapi import APIRouter, HTTPException
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
async def get_user_gifs(user_id: str):
    # Here you would implement the logic to retrieve all GIFs for a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "gifs": []}