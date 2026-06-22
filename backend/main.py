import os
import uuid
import asyncio
from pathlib import Path
from typing import Optional, List
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import database
import video_processor as vp
from ai_analyzer import GeminiAnalyzer
from models import (
    UploadResponse, ProcessingStatus, Clip, SearchRequest,
    SearchResponse, JobStatus, PlayCategory
)

UPLOADS_DIR = Path(__file__).parent / "uploads"
CLIPS_DIR = Path(__file__).parent / "clips"
THUMBNAILS_DIR = Path(__file__).parent / "thumbnails"
FRAMES_DIR = Path(__file__).parent / "frames"

executor = ThreadPoolExecutor(max_workers=2)


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
    """Full video processing pipeline (runs in thread pool)."""
    try:
        analyzer = GeminiAnalyzer()

        database.update_job_status(
            job_id, JobStatus.PROCESSING, progress=5, message="Detecting scenes..."
        )

        scenes = vp.detect_scenes(video_path, min_scene_duration=2.0)
        total = len(scenes)

        database.update_job_status(
            job_id, JobStatus.PROCESSING, progress=10,
            total_clips=total, message=f"Found {total} scenes. Analyzing..."
        )

        for idx, (start, end) in enumerate(scenes):
            clip_name = f"{job_id}_clip_{idx:04d}.mp4"
            thumb_name = f"{job_id}_thumb_{idx:04d}.jpg"
            clip_path = str(CLIPS_DIR / clip_name)
            thumb_path = str(THUMBNAILS_DIR / thumb_name)
            frames_dir = str(FRAMES_DIR / f"{job_id}_{idx:04d}")

            # Extract clip
            vp.extract_clip(video_path, start, end, clip_path)

            # Extract frames for AI analysis
            frame_paths = vp.extract_frames(video_path, start, end, frames_dir, num_frames=4)

            # Extract thumbnail
            vp.extract_thumbnail(video_path, start, end, thumb_path)

            # AI classification
            result = analyzer.classify_clip(frame_paths)

            # Save to DB
            database.insert_clip(
                job_id=job_id,
                start_time=start,
                end_time=end,
                category=result.get("category", "unknown"),
                description=result.get("description", ""),
                confidence=result.get("confidence", 0.0),
                clip_filename=clip_name,
                thumbnail_filename=thumb_name
            )

            # Cleanup frames
            vp.cleanup_frames(frames_dir)

            progress = 10 + int((idx + 1) / total * 85)
            database.update_job_status(
                job_id, JobStatus.PROCESSING,
                progress=progress,
                total_clips=total,
                processed_clips=idx + 1,
                message=f"Analyzed {idx + 1}/{total} clips..."
            )

        database.update_job_status(
            job_id, JobStatus.DONE, progress=100,
            total_clips=total, processed_clips=total,
            message=f"Done! {total} clips ready."
        )

    except Exception as e:
        database.update_job_status(
            job_id, JobStatus.FAILED, message=f"Error: {str(e)}"
        )


@app.post("/api/upload", response_model=UploadResponse)
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(400, "File must be a video")

    job_id = str(uuid.uuid4())
    ext = Path(file.filename or "video.mp4").suffix or ".mp4"
    video_path = UPLOADS_DIR / f"{job_id}{ext}"

    contents = await file.read()
    video_path.write_bytes(contents)

    database.create_job(job_id, file.filename or "video")

    loop = asyncio.get_event_loop()
    loop.run_in_executor(executor, _process_video_sync, job_id, str(video_path))

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
