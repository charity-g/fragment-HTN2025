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
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save file to disk
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    return {"status": "success", "filename": file.filename}




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
