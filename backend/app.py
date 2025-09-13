# app.py
from fastapi import FastAPI, File, UploadFile, Form
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
    title: str = Form(...),
    description: str = Form(""),
    tags: str = Form("")
):
    task_id = str(uuid.uuid4())

    # Save file locally
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Upload to S3
    # s3_bucket = "fragment-webm"
    # s3_key = f"uploads/{file.filename}"
    # upload_file_to_s3(file_path, s3_bucket, s3_key)

    print(title)
    print(description)
    print(tags)
    
    return {
        "status": "success",
        "task_id": task_id,
        # "s3_key": s3_key,
        "title": title,
        "description": description,
        "tags": tags.split(",") if tags else []
    }


if __name__ == "__main__":
    if len(sys.argv) >= 1 and sys.argv[0] == "dev":
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)
