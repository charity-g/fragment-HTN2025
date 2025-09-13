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


from routes import videos, users


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
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    source_link: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    task_id = str(uuid.uuid4())
    
    file_path = os.path.join(UPLOAD_DIR, title if title else task_id)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Prepare S3 metadata
    metadata = {}
    if title:
        metadata['title'] = title
    if description:
        metadata['description'] = description
    if tags:
        # tags can be a comma-separated string or array, store as string
        metadata['initial_tags'] = tags if isinstance(tags, str) else ','.join(tags)
    if source_link:
        metadata['source_link'] = source_link
    if user_id:
        metadata['user_id'] = user_id

    s3_bucket = "fragment-webm"
    s3_key = f"uploads/{title if title else task_id}"
    upload_file_to_s3(file_path, s3_bucket, s3_key, metadata=metadata if metadata else None)

    return {
        "status": "success",
        "task_id": task_id,
        "s3_key": s3_key,
        "title": title,
        "description": description,
        "tags": tags,
        "user_id": user_id
    }


app.include_router(videos.router, prefix="/videos", tags=["videos"])
app.include_router(users.router, prefix="/users", tags=["users"])

if __name__ == "__main__":
    if len(sys.argv) >= 1 and sys.argv[0] == "dev":
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)














