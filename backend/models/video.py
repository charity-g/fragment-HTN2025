from pydantic import BaseModel
from typing import Optional

class VideoTaskRequest(BaseModel):
    task_id: str
    input_path: str
    operation: str  # e.g., 'transcode', 'thumbnail', 'metadata'
    options: Optional[dict] = None

class VideoTaskStatus(BaseModel):
    task_id: str
    status: str

class VideoTaskResult(BaseModel):
    task_id: str
    output_path: Optional[str] = None
    metadata: Optional[dict] = None
    error: Optional[str] = None
