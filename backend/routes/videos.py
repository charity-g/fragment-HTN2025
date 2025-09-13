from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import boto3

router = APIRouter()

s3_client = boto3.client("s3")
VIDEO_BUCKET = "fragment-webm"
GIF_BUCKET = "fragment-gifs"

def get_presigned_url(bucket, key, expires_in=3600):
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
    return {"status": "success", "task_id": video_id, "video_url": url}

@router.get("/gif/{video_id}")
async def get_gif(video_id: str):
    "get gif"
    key = f"gifs/{video_id}.gif"
    url = get_presigned_url(GIF_BUCKET, key)
    return {"status": "success", "task_id": video_id, "video_url": url}

@router.get("/mp4/{video_id}")
async def get_mp4(video_id: str):
    "get mp4"
    key = f"uploads/{video_id}.mp4"
    url = get_presigned_url(VIDEO_BUCKET, key)
    return {"status": "success", "task_id": video_id, "video_url": url}

@router.put("/{video_id}/tags")
async def update_video_tags(video_id: str, tags: list[str]):
    "update video tags"
    key = f"uploads/{video_id}.webm"
    url = get_presigned_url(VIDEO_BUCKET, key)
    # //TODO MUST BE USING DYNAMODB not s3
    return {"status": "success", "task_id": video_id, "video_url": url}