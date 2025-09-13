# app.py
from fastapi import FastAPI, File, UploadFile
import uvicorn
import os
from fastapi.responses import JSONResponse
from app.models.video import VideoTaskRequest, VideoTaskStatus, VideoTaskResult
import uuid

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
    
    # TOOD
    return {"status": "success", "task_id": task_id}




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
