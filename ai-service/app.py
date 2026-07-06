from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import shutil
import uuid
import os

app = FastAPI(title="Transcribe-AI Service", version="1.0.0")

# =====================
# CORS — allow all origins (Render + frontend)
# =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CPU model (Render compatible)
model = WhisperModel("base", compute_type="int8")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "transcribe-ai-service",
        "timestamp": __import__("datetime").datetime.now().isoformat()
    }


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    # Preserve original extension
    ext = os.path.splitext(file.filename)[1] if file.filename else ".mp3"
    file_path = f"{UPLOAD_DIR}/{file_id}{ext}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    segments, info = model.transcribe(file_path)

    text = ""
    for segment in segments:
        text += segment.text + " "

    # Cleanup uploaded file after transcription
    try:
        os.remove(file_path)
    except Exception:
        pass

    return {
        "text": text.strip(),
        "language": info.language,
        "duration_seconds": info.duration if hasattr(info, "duration") else None
    }