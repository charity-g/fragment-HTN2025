# app.py
from fastapi import FastAPI, File, UploadFile
import uvicorn
import os
from fastapi.responses import JSONResponse
from models.video import VideoTaskRequest, VideoTaskStatus, VideoTaskResult
import uuid

import boto3

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    task_id = str(uuid.uuid4())
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    payload = VideoTaskRequest(task_id=task_id, input_path=file_path, operation="transcode")
    
    # Upload to Amazon S3
    s3_bucket = "fragment_webm"  
    s3_key = f"uploads/{file.filename}"
    s3_client = boto3.client("s3")
    s3_client.upload_file(file_path, s3_bucket, s3_key)
    
    return {"status": "success", "task_id": task_id, "s3_key": s3_key}




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
