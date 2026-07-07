import sqlite3
import json
from pathlib import Path
from typing import List, Optional
from models import Clip, PlayCategory, JobStatus

DB_PATH = Path(__file__).parent / "clutch_cut.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            progress INTEGER NOT NULL DEFAULT 0,
            total_clips INTEGER NOT NULL DEFAULT 0,
            processed_clips INTEGER NOT NULL DEFAULT 0,
            message TEXT NOT NULL DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS clips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT NOT NULL,
            start_time REAL NOT NULL,
            end_time REAL NOT NULL,
            duration REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            confidence REAL NOT NULL DEFAULT 0.0,
            clip_filename TEXT NOT NULL,
            thumbnail_filename TEXT,
            FOREIGN KEY (job_id) REFERENCES jobs(id)
        );

        CREATE INDEX IF NOT EXISTS idx_clips_job_id ON clips(job_id);
        CREATE INDEX IF NOT EXISTS idx_clips_category ON clips(category);
    """)
    # Migrate: add user_id to jobs if not present (safe ALTER TABLE)
    try:
        conn.execute("ALTER TABLE jobs ADD COLUMN user_id INTEGER REFERENCES users(id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id)")
    except Exception:
        pass
    conn.commit()
    conn.close()


# ── User operations ───────────────────────────────────────────────────────────

def create_user(name: str, email: str, hashed_password: str) -> int:
    conn = get_conn()
    cursor = conn.execute(
        "INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)",
        (name, email, hashed_password)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return user_id


def get_user_by_email(email: str) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id: int) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_jobs_for_user(user_id: int) -> List[dict]:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM jobs WHERE user_id=? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Job operations ─────────────────────────────────────────────────────────────

def create_job(job_id: str, filename: str, user_id: Optional[int] = None):
    conn = get_conn()
    conn.execute(
        "INSERT INTO jobs (id, user_id, filename, status) VALUES (?, ?, ?, 'pending')",
        (job_id, user_id, filename)
    )
    conn.commit()
    conn.close()


def update_job_status(job_id: str, status: JobStatus, progress: int = 0,
                      total_clips: int = 0, processed_clips: int = 0, message: str = ""):
    conn = get_conn()
    conn.execute(
        """UPDATE jobs SET status=?, progress=?, total_clips=?, processed_clips=?, message=?
           WHERE id=?""",
        (status.value, progress, total_clips, processed_clips, message, job_id)
    )
    conn.commit()
    conn.close()


def get_job(job_id: str) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def insert_clip(job_id: str, start_time: float, end_time: float, category: str,
                description: str, confidence: float, clip_filename: str,
                thumbnail_filename: Optional[str] = None):
    conn = get_conn()
    duration = end_time - start_time
    cursor = conn.execute(
        """INSERT INTO clips (job_id, start_time, end_time, duration, category, description,
           confidence, clip_filename, thumbnail_filename)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (job_id, start_time, end_time, duration, category, description,
         confidence, clip_filename, thumbnail_filename)
    )
    conn.commit()
    clip_id = cursor.lastrowid
    conn.close()
    return clip_id


def get_clips_for_job(job_id: str, categories: Optional[List[str]] = None) -> List[dict]:
    conn = get_conn()
    if categories:
        placeholders = ",".join("?" * len(categories))
        rows = conn.execute(
            f"SELECT * FROM clips WHERE job_id=? AND category IN ({placeholders}) ORDER BY start_time",
            [job_id] + categories
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM clips WHERE job_id=? ORDER BY start_time",
            (job_id,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def search_clips(job_id: str, query: str, categories: Optional[List[str]] = None) -> List[dict]:
    conn = get_conn()
    query_lower = f"%{query.lower()}%"
    if categories:
        placeholders = ",".join("?" * len(categories))
        rows = conn.execute(
            f"""SELECT * FROM clips
                WHERE job_id=? AND (LOWER(description) LIKE ? OR LOWER(category) LIKE ?)
                AND category IN ({placeholders})
                ORDER BY confidence DESC""",
            [job_id, query_lower, query_lower] + categories
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT * FROM clips
               WHERE job_id=? AND (LOWER(description) LIKE ? OR LOWER(category) LIKE ?)
               ORDER BY confidence DESC""",
            (job_id, query_lower, query_lower)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
