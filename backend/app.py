# app.py
from fastapi import FastAPI, File, UploadFile, Form, Depends, Query
from typing import List, Optional
import uvicorn
import os
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models.video import VideoTaskRequest, VideoTaskStatus, VideoTaskResult
import uuid
import sys
import secure
import uvicorn
from config import settings
from dependencies import PermissionsValidator, validate_token
from starlette.exceptions import HTTPException as StarletteHTTPException
from s3_utils import upload_file_to_s3
from routes import videos, users
from summarizeClips import processClip
import json

app = FastAPI()

csp = secure.ContentSecurityPolicy().default_src("'self'").frame_ancestors("'none'")
hsts = secure.StrictTransportSecurity().max_age(31536000).include_subdomains()
referrer = secure.ReferrerPolicy().no_referrer()
cache_value = secure.CacheControl().no_cache().no_store().max_age(0).must_revalidate()
x_frame_options = secure.XFrameOptions().deny()

secure_headers = secure.Secure(
    csp=csp,
    hsts=hsts,
    referrer=referrer,
    cache=cache_value,
    xfo=x_frame_options,
)


@app.middleware("http")
async def set_secure_headers(request, call_next):
    response = await call_next(request)
    secure_headers.framework.fastapi(response)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_origin_url, "*"],  # TODO allow all for development
    allow_methods=["GET", "PUT", "POST", "OPTIONS"],  # <-- add POST and OPTIONS
    allow_headers=["Authorization", "Content-Type"],
    max_age=86400,
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    message = str(exc.detail)

    return JSONResponse({"message": message}, status_code=exc.status_code)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    sourceURL: Optional[str] = Form(None),
    privacy: Optional[str] = Form(None),
    collection: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    video_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, video_id + ".webm")
    with open(file_path, "wb") as f:
        f.write(await file.read())

    metadata = {}
    if notes:
        metadata["notes"] = notes
    if tags:
        initial_tags = []
        if isinstance(tags, str):
            raw_tags = [tag.strip() for tag in tags.split(",")]
        else:
            raw_tags = [tag.strip() for tag in tags]
        for tag in raw_tags:
            initial_tags.extend([t for t in tag.split() if t])
        metadata["initial_tags"] = ",".join(initial_tags)
    if sourceURL:
        metadata["sourceURL"] = sourceURL
    if user_id:
        metadata["user_id"] = user_id
    if privacy:
        print(privacy)
        metadata["privacy"] = privacy
    if collection:
        metadata["collection"] = collection

    genAIData = processClip(file_path)
    if genAIData:
        # ✅ Convert dict → JSON string
        metadata["genAIData"] = json.dumps(genAIData)

    s3_bucket = "fragment-webm"
    s3_key = f"uploads/{video_id}.webm"

    # ✅ Pass metadata as strings only
    upload_file_to_s3(file_path, s3_bucket, s3_key, metadata=metadata if metadata else None)

    os.remove(file_path)

    return {
        "status": "success",
        "video_id": video_id,
        "s3_key": s3_key,
        "notes": notes,
        "tags": tags,
        "user_id": user_id,
    }

app.include_router(videos.router, prefix="/videos", tags=["videos"])
app.include_router(users.router, prefix="/users", tags=["users"])

if __name__ == "__main__":
    if len(sys.argv) >= 1 and sys.argv[0] == "dev":
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)


# if __name__ == "__main__":
#     uvicorn.run(
#         app,
#         host="0.0.0.0",
#         port=settings.port,
#         reload=settings.reload,
#         server_header=False,
#     )





