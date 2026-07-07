import os
import uuid
import asyncio
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel as PydanticBaseModel

import database
import video_processor as vp
from ai_analyzer import GeminiAnalyzer
from models import (
    UploadResponse, ProcessingStatus, Clip, SearchRequest,
    SearchResponse, JobStatus, PlayCategory
)

# ── Auth config ───────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("SECRET_KEY", "clutchcut-secret-key-change-in-production-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


class RegisterRequest(PydanticBaseModel):
    name: str
    email: str
    password: str


class LoginRequest(PydanticBaseModel):
    email: str
    password: str


class AuthResponse(PydanticBaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> Optional[dict]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        return database.get_user_by_id(user_id)
    except (JWTError, Exception):
        return None


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    user = get_current_user(credentials)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


UPLOADS_DIR = Path(__file__).parent / "uploads"
CLIPS_DIR = Path(__file__).parent / "clips"
THUMBNAILS_DIR = Path(__file__).parent / "thumbnails"
FRAMES_DIR = Path(__file__).parent / "frames"



@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield


app = FastAPI(
    title="Clutch Cut API",
    description="Basketball highlight finder powered by Gemini Vision",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/clips", StaticFiles(directory=str(CLIPS_DIR)), name="clips")
app.mount("/thumbnails", StaticFiles(directory=str(THUMBNAILS_DIR)), name="thumbnails")


def _process_video_sync(job_id: str, video_path: str):
    """Full video processing pipeline (runs in background thread)."""
    print(f"[clutch-cut] Starting processing for job {job_id}")
    try:
        analyzer = GeminiAnalyzer()

        database.update_job_status(
            job_id, JobStatus.PROCESSING, progress=5, message="Detecting scenes..."
        )
        print(f"[clutch-cut] Detecting scenes in {video_path}")

        scenes = vp.detect_scenes(video_path, min_scene_duration=2.0)
        total = len(scenes)

        database.update_job_status(
            job_id, JobStatus.PROCESSING, progress=10,
            total_clips=total, message=f"Found {total} scenes. Analyzing..."
        )
        print(f"[clutch-cut] Found {total} scenes, starting AI analysis...")

        # ── Phase 1: extract all clips + frames (fast, no API calls) ──────────
        clip_meta = []
        all_frame_paths = []
        for idx, (start, end) in enumerate(scenes):
            clip_name = f"{job_id}_clip_{idx:04d}.mp4"
            thumb_name = f"{job_id}_thumb_{idx:04d}.jpg"
            clip_path = str(CLIPS_DIR / clip_name)
            thumb_path = str(THUMBNAILS_DIR / thumb_name)
            frames_dir = str(FRAMES_DIR / f"{job_id}_{idx:04d}")

            vp.extract_clip(video_path, start, end, clip_path)
            frame_paths = vp.extract_frames(video_path, start, end, frames_dir, num_frames=2)
            vp.extract_thumbnail(video_path, start, end, thumb_path)

            clip_meta.append({
                "start": start, "end": end,
                "clip_name": clip_name, "thumb_name": thumb_name,
                "frames_dir": frames_dir, "frame_paths": frame_paths
            })
            all_frame_paths.append(frame_paths)

            progress = 10 + int((idx + 1) / total * 40)
            database.update_job_status(
                job_id, JobStatus.PROCESSING, progress=progress,
                total_clips=total, processed_clips=0,
                message=f"Extracting clip {idx+1}/{total}..."
            )

        print(f"[clutch-cut] All clips extracted. Starting batch AI analysis...")

        # ── Phase 2: batch classify all clips (minimises API calls) ──────────
        BATCH_SIZE = 10
        results = []
        for batch_start in range(0, total, BATCH_SIZE):
            batch_frames = all_frame_paths[batch_start:batch_start + BATCH_SIZE]
            batch_results = analyzer.classify_clips_batch(batch_frames)
            results.extend(batch_results)
            analyzed = min(batch_start + BATCH_SIZE, total)
            progress = 50 + int(analyzed / total * 45)
            database.update_job_status(
                job_id, JobStatus.PROCESSING, progress=progress,
                total_clips=total, processed_clips=analyzed,
                message=f"AI analyzed {analyzed}/{total} clips..."
            )
            print(f"[clutch-cut] Batch {batch_start//BATCH_SIZE + 1}: analyzed clips {batch_start}–{batch_start+len(batch_frames)-1}")

        # ── Phase 3: save to DB + cleanup ─────────────────────────────────────
        for idx, (meta, result) in enumerate(zip(clip_meta, results)):
            database.insert_clip(
                job_id=job_id,
                start_time=meta["start"],
                end_time=meta["end"],
                category=result.get("category", "unknown"),
                description=result.get("description", ""),
                confidence=result.get("confidence", 0.0),
                clip_filename=meta["clip_name"],
                thumbnail_filename=meta["thumb_name"]
            )
            vp.cleanup_frames(meta["frames_dir"])
            print(f"[clutch-cut] Clip {idx+1}/{total} → {result.get('category')}")

        database.update_job_status(
            job_id, JobStatus.DONE, progress=100,
            total_clips=total, processed_clips=total,
            message=f"Done! {total} clips ready."
        )
        print(f"[clutch-cut] Job {job_id} complete — {total} clips ready")

    except Exception as e:
        print(f"[clutch-cut] ERROR in job {job_id}: {e}")
        import traceback; traceback.print_exc()
        database.update_job_status(
            job_id, JobStatus.FAILED, message=f"Error: {str(e)}"
        )


@app.post("/api/upload", response_model=UploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(400, "File must be a video")

    user = get_current_user(credentials)
    user_id = user["id"] if user else None

    job_id = str(uuid.uuid4())
    ext = Path(file.filename or "video.mp4").suffix or ".mp4"
    video_path = UPLOADS_DIR / f"{job_id}{ext}"

    contents = await file.read()
    video_path.write_bytes(contents)

    database.create_job(job_id, file.filename or "video", user_id=user_id)

    t = threading.Thread(target=_process_video_sync, args=(job_id, str(video_path)), daemon=True)
    t.start()

    return UploadResponse(
        job_id=job_id,
        filename=file.filename or "video",
        message="Video uploaded. Processing started."
    )


@app.get("/api/status/{job_id}", response_model=ProcessingStatus)
async def get_status(job_id: str):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    return ProcessingStatus(
        job_id=job_id,
        status=JobStatus(job["status"]),
        progress=job["progress"],
        total_clips=job["total_clips"],
        processed_clips=job["processed_clips"],
        message=job["message"]
    )


@app.get("/api/clips/{job_id}", response_model=List[Clip])
async def get_clips(job_id: str, category: Optional[str] = None):
    job = database.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    categories = [category] if category else None
    rows = database.get_clips_for_job(job_id, categories)

    return [
        Clip(
            id=r["id"],
            job_id=r["job_id"],
            start_time=r["start_time"],
            end_time=r["end_time"],
            duration=r["duration"],
            category=PlayCategory(r["category"]),
            description=r["description"],
            confidence=r["confidence"],
            clip_filename=r["clip_filename"],
            thumbnail_filename=r.get("thumbnail_filename")
        )
        for r in rows
    ]


@app.post("/api/search", response_model=SearchResponse)
async def search_clips(req: SearchRequest):
    job = database.get_job(req.job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    if job["status"] != "done":
        raise HTTPException(400, "Video is still processing")

    cat_values = [c.value for c in req.categories] if req.categories else None
    all_clips = database.get_clips_for_job(req.job_id, cat_values)

    if not all_clips:
        return SearchResponse(clips=[], total=0, query=req.query)

    try:
        analyzer = GeminiAnalyzer()
        ranked = analyzer.semantic_search(req.query, all_clips)
    except Exception:
        # Fallback: keyword filter
        q = req.query.lower()
        ranked = [c for c in all_clips
                  if q in c["description"].lower() or q in c["category"].lower()]

    clips_out = [
        Clip(
            id=r["id"],
            job_id=r["job_id"],
            start_time=r["start_time"],
            end_time=r["end_time"],
            duration=r["duration"],
            category=PlayCategory(r["category"]),
            description=r["description"],
            confidence=r["confidence"],
            clip_filename=r["clip_filename"],
            thumbnail_filename=r.get("thumbnail_filename")
        )
        for r in ranked
    ]

    return SearchResponse(clips=clips_out, total=len(clips_out), query=req.query)


@app.get("/api/clip/download/{clip_filename}")
async def download_clip(clip_filename: str):
    clip_path = CLIPS_DIR / clip_filename
    if not clip_path.exists():
        raise HTTPException(404, "Clip not found")
    return FileResponse(
        str(clip_path),
        media_type="video/mp4",
        filename=clip_filename,
        headers={"Content-Disposition": f"attachment; filename={clip_filename}"}
    )


@app.get("/api/jobs")
async def list_jobs():
    """List all processing jobs."""
    import sqlite3
    conn = database.get_conn()
    rows = conn.execute(
        "SELECT * FROM jobs ORDER BY created_at DESC LIMIT 20"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/health")
async def health():
    return {"status": "ok", "service": "clutch-cut"}


# ── Auth endpoints ─────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    if database.get_user_by_email(req.email):
        raise HTTPException(400, "Email already registered")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    hashed = hash_password(req.password)
    user_id = database.create_user(req.name.strip(), req.email.lower().strip(), hashed)
    token = create_token(user_id)
    return AuthResponse(access_token=token, user_id=user_id, name=req.name.strip(), email=req.email.lower())


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    user = database.get_user_by_email(req.email.lower().strip())
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["id"])
    return AuthResponse(access_token=token, user_id=user["id"], name=user["name"], email=user["email"])


@app.get("/api/auth/me")
async def me(user: dict = Depends(require_auth)):
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


@app.get("/api/my/jobs")
async def my_jobs(user: dict = Depends(require_auth)):
    jobs = database.get_jobs_for_user(user["id"])
    return jobs
