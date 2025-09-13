from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import boto3

router = APIRouter()

s3_client = boto3.client("s3")
dynamodb = boto3.resource('dynamodb')
VIDEO_BUCKET = "fragment-webm"
GIF_BUCKET = "fragment-gifs"
MP4_BUCKET = "fragment-mp4"

table = dynamodb.Table('fragments')

def get_presigned_url(bucket, key, expires_in=3600):
    if "%20" in key:
        key = key.replace("%20", "+")
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_in
    )

@router.get("/{video_id}")
async def get_video(video_id: str):
    "get webm"
    key = f"uploads/{video_id}.webm"
    url = get_presigned_url(VIDEO_BUCKET, key)
    return JSONResponse(
        status_code=200,
        content={"status": "success", "task_id": video_id, "video_url": url}
    )

@router.get("/gif/{video_id}")
async def get_gif(video_id: str):
    "get gif"
    key = f"{video_id}_gif.gif"
    url = get_presigned_url(GIF_BUCKET, key)
    return JSONResponse(
        status_code=200,
        content={"status": "success", "task_id": video_id, "video_url": url}
    )

# STRETCH ENDPOINT
# @router.get("/mp4/{video_id}")
# async def get_mp4(video_id: str):
#     "get mp4"
#     key = f"uploads/{video_id}.mp4"
#     url = get_presigned_url(MP4_BUCKET, key)
#     return {"status": "success", "task_id": video_id, "video_url": url}

@router.put("/{video_id}/tags")
async def update_video_tags(video_id: str, tags: list[str]):
    "update video tags"
    # Update tags in DynamoDB
    table.update_item(
        Key={'video_id': video_id},
        UpdateExpression="SET tags = :t",
        ExpressionAttributeValues={':t': tags}
    )
    key = f"uploads/{video_id}.webm"
    url = get_presigned_url(VIDEO_BUCKET, key)
    return JSONResponse(
        status_code=200,
        content={"status": "success", "video_id": video_id, "video_url": url, "tags": tags}
    )


@router.put("/{video_id}/visibility")
async def update_video_visibility(video_id: str, visibility: bool):
    "update video visibility"
    try:
        table.update_item(
            Key={'video_id': video_id},
            UpdateExpression="SET is_public = :v",
            ExpressionAttributeValues={':v': visibility}
        )
        return JSONResponse(
            status_code=200,
            content={"status": "success", "video_id": video_id, "is_public": visibility}
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})