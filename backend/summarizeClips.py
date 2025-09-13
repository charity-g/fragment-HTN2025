import cv2
import os
import base64
import cohere
import json
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Read from .env
CO_API_KEY = os.getenv("CO_API_KEY")


co = cohere.ClientV2(CO_API_KEY)
model = "c4ai-aya-vision-32b"
out_dir = "frames"

def extract_frames(video_path, out_dir, step=60):
    os.makedirs(out_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0

    frame_num, saved = 0, []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_num % step == 0:
            frame_path = os.path.join(out_dir, f"frame_{frame_num}.jpg")
            cv2.imwrite(frame_path, frame)
            saved.append(frame_path)
        frame_num += 1

    cap.release()
    return fps, duration, saved

def analyze_frames(frames, duration, fps, motion_desc=""):
    # Build single prompt
    prompt = f"""
        You are a creative director helping video editors recreate content.

        Here is a video breakdown:

        - Duration: {duration:.2f} seconds
        - FPS: {fps}
        - Timeline of motion effects or transitions:
        {motion_desc}

        Please respond ONLY with strict JSON using this exact schema and no extra text:

        {{
        "editingInstructions": "A step-by-step guide to recreate the video (transitions, animations, keyframes, timing, overlays, effects, LUTs, audio cues). Write for an editor in Adobe/Final Cut/Resolve/CapCut terms. Suggest video editing tools.",
        "videoSummary": "1–3 paragraph high-level description of what happens in the clip as if explaining to a video creator.",
        "tags": [3-5 concise tags, lowercase, 1–3 words each, no punctuation except hyphens, e.g of tags. ["stop motion", "animation", "mixed media", "zoom", "floating ui", "l-cut", "match cut", "dolly zoom", "whip pan", "parallax", "masking"]
        }}

        Rules:
        - The JSON must be valid and parseable. Do NOT wrap in code fences.
        - Use the frames and the motion timeline to infer transitions and camera moves.
        - If uncertain, make the best reasonable inference to be practically helpful to an editor.
    """

    # Attach multiple frames
    content = [{"type": "text", "text": prompt}]
    for f in frames:
        with open(f, "rb") as img_file:
            b64 = base64.b64encode(img_file.read()).decode("utf-8")
            content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})

    response = co.chat(
        model=model,
        messages=[{"role": "user", "content": content}],
    )

    # Parse response into JSON
    txt = response.message.content[0].text.strip()
    try:
        result = json.loads(txt)
    except:
        print("Model did not return clean JSON. Raw output:\n", txt)
        result = {"editingInstructions": "", "videoSummary": "", "tags": []}
    return result

def processClip(video_path):
    fps, duration, frames = extract_frames(video_path, out_dir, step=120)
    print(f"Extracted {len(frames)} frames at {fps:.2f} fps, duration {duration:.2f} seconds")

    result = analyze_frames(frames[:5], duration, fps)  # send a subset of frames
    print(json.dumps(result, indent=2))

    return result

if __name__ == "__main__":
    processClip("uploads/07f1ecd0-5f2d-4ff3-9ae1-9d2b3ddca244.webm"
)
