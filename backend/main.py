from fastapi import FastAPI
from app.routes import video

app = FastAPI()

app.include_router(video.router, prefix="/video", tags=["video"])
