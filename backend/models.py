from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class PlayCategory(str, Enum):
    OFFENSE = "offense"
    DEFENSE = "defense"
    PICK_AND_ROLL = "pick_and_roll"
    FAST_BREAK = "fast_break"
    THREE_POINTER = "three_pointer"
    DUNK = "dunk"
    HALF_COURT_SHOT = "half_court_shot"
    LAYUP = "layup"
    STEAL = "steal"
    BLOCK = "block"
    REBOUND = "rebound"
    TURNOVER = "turnover"
    FREE_THROW = "free_throw"
    ALLEY_OOP = "alley_oop"
    CROSSOVER = "crossover"
    TRANSITION = "transition"
    UNKNOWN = "unknown"


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


class UploadResponse(BaseModel):
    job_id: str
    filename: str
    message: str


class ProcessingStatus(BaseModel):
    job_id: str
    status: JobStatus
    progress: int
    total_clips: int
    processed_clips: int
    message: str


class Clip(BaseModel):
    id: int
    job_id: str
    start_time: float
    end_time: float
    duration: float
    category: PlayCategory
    description: str
    confidence: float
    clip_filename: str
    thumbnail_filename: Optional[str] = None


class SearchRequest(BaseModel):
    job_id: str
    query: str
    categories: Optional[List[PlayCategory]] = None


class SearchResponse(BaseModel):
    clips: List[Clip]
    total: int
    query: str
