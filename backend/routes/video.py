from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from app.models.video import VideoTaskRequest, VideoTaskStatus, VideoTaskResult
import uuid

router = APIRouter()


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    task_id = str(uuid.uuid4())
    # Save file to disk
    file_path = f"/tmp/{task_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    payload = VideoTaskRequest(task_id=task_id, input_path=file_path, operation="transcode")
    
    # TOOD
    return {"task_id": task_id}

@router.get("/status/{task_id}")
def get_status(task_id: str):

    # TODO
    return {"task_id": task_id, "status": status}

@router.get("/result/{task_id}")
def get_result(task_id: str):
    # TODO
    # if not result:
        # return JSONResponse(status_code=404, content={"detail": "Result not found"})
    # return result
