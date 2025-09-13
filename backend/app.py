# app.py
from fastapi import FastAPI, File, UploadFile, Form
from typing import List, Optional
import uvicorn
import os
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models.video import VideoTaskRequest, VideoTaskStatus, VideoTaskResult
import uuid
import sys

from s3_utils import upload_file_to_s3

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    tags: Optional[List[str]] = Form(None)
):
    task_id = str(uuid.uuid4())
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    payload = VideoTaskRequest(task_id=task_id, input_path=file_path, operation="transcode")
    
    # Upload to Amazon S3 using the utility function
    s3_bucket = "fragment-webm"
    s3_key = f"uploads/{file.filename}"
    metadata = {}
    if tags:
        # S3 metadata values must be strings
        metadata['initial_tags'] = ','.join(tags)
    upload_file_to_s3(file_path, s3_bucket, s3_key, ExtraArgs={"Metadata": metadata} if metadata else {})

    return {"status": "success", "task_id": task_id, "s3_key": s3_key}


@app.get("/videos/{id}")
async def get_video(id: str):
    # Here you would implement the logic to retrieve the video processing status
    # For now, we'll just return a dummy response
    return {"status": "success", "task_id": task_id, "video_url": f"http://localhost:8000/videos/{task_id}.mp4"}

@app.get("/users/{user_id}/videos")
async def get_user_videos(user_id: str):
    # Here you would implement the logic to retrieve all videos for a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "videos": []}


if __name__ == "__main__":
    if len(sys.argv) >= 1 and sys.argv[0] == "dev":
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)














