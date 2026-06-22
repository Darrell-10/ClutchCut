import subprocess
import os
import json
import shutil
from pathlib import Path
from typing import List, Tuple, Optional
import cv2

UPLOADS_DIR = Path(__file__).parent / "uploads"
CLIPS_DIR = Path(__file__).parent / "clips"
FRAMES_DIR = Path(__file__).parent / "frames"
THUMBNAILS_DIR = Path(__file__).parent / "thumbnails"

for d in [UPLOADS_DIR, CLIPS_DIR, FRAMES_DIR, THUMBNAILS_DIR]:
    d.mkdir(exist_ok=True)


def get_video_duration(video_path: str) -> float:
    """Return video duration in seconds using ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])


def detect_scenes(video_path: str, min_scene_duration: float = 2.0) -> List[Tuple[float, float]]:
    """
    Detect scene changes using OpenCV frame differencing.
    Returns list of (start_sec, end_sec) tuples.
    Falls back to fixed-length segments if detection fails.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps

        # Sample every 0.5s for scene detection
        sample_interval = max(1, int(fps * 0.5))
        scene_changes = [0.0]

        prev_frame = None
        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_interval == 0:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                gray = cv2.resize(gray, (160, 90))

                if prev_frame is not None:
                    diff = cv2.absdiff(gray, prev_frame)
                    score = diff.mean()
                    if score > 25:  # Scene change threshold
                        timestamp = frame_idx / fps
                        # Only add if far enough from last scene
                        if timestamp - scene_changes[-1] >= min_scene_duration:
                            scene_changes.append(timestamp)

                prev_frame = gray
            frame_idx += 1

        cap.release()

        if duration not in scene_changes:
            scene_changes.append(duration)

        # Build scene intervals
        scenes = []
        for i in range(len(scene_changes) - 1):
            start = scene_changes[i]
            end = scene_changes[i + 1]
            if end - start >= min_scene_duration:
                scenes.append((start, end))

        # If too few scenes, fall back to fixed segments
        if len(scenes) < 2:
            return _fixed_segments(duration, segment_length=8.0)

        return scenes

    except Exception as e:
        duration = get_video_duration(video_path)
        return _fixed_segments(duration, segment_length=8.0)


def _fixed_segments(duration: float, segment_length: float = 8.0) -> List[Tuple[float, float]]:
    """Split video into fixed-length segments."""
    segments = []
    t = 0.0
    while t < duration:
        end = min(t + segment_length, duration)
        if end - t >= 2.0:
            segments.append((t, end))
        t += segment_length
    return segments


def extract_clip(video_path: str, start: float, end: float,
                 output_path: str) -> bool:
    """Extract a clip from video using ffmpeg."""
    duration = end - start
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start),
        "-i", video_path,
        "-t", str(duration),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "fast",
        "-crf", "23",
        output_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def extract_frames(video_path: str, start: float, end: float,
                   output_dir: str, num_frames: int = 4) -> List[str]:
    """Extract evenly-spaced frames from a video segment."""
    duration = end - start
    if duration <= 0:
        return []

    output_dir_path = Path(output_dir)
    output_dir_path.mkdir(exist_ok=True)

    frame_paths = []
    interval = duration / (num_frames + 1)

    for i in range(num_frames):
        timestamp = start + interval * (i + 1)
        output_path = str(output_dir_path / f"frame_{i:04d}.jpg")
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(timestamp),
            "-i", video_path,
            "-vframes", "1",
            "-q:v", "2",
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True)
        if result.returncode == 0 and Path(output_path).exists():
            frame_paths.append(output_path)

    return frame_paths


def extract_thumbnail(video_path: str, start: float, end: float,
                      output_path: str) -> bool:
    """Extract a single thumbnail from the middle of a clip."""
    mid = start + (end - start) / 2
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(mid),
        "-i", video_path,
        "-vframes", "1",
        "-vf", "scale=320:180:force_original_aspect_ratio=decrease",
        "-q:v", "3",
        output_path
    ]
    result = subprocess.run(cmd, capture_output=True)
    return result.returncode == 0


def cleanup_frames(frames_dir: str):
    """Remove extracted frames after analysis."""
    shutil.rmtree(frames_dir, ignore_errors=True)
