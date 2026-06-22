# 🏀 ClutchCut — Basketball Highlight Finder

Upload your game footage. Search any play in natural language. Get the exact clip instantly.

**Powered by Google Gemini 1.5 Flash Vision AI.**

---

## Features

- **Drag & Drop Upload** — any MP4, MOV, AVI, WebM, or MKV file
- **Auto Scene Detection** — splits footage into plays using computer vision
- **AI Classification** — every clip is labeled: offense, defense, pick & roll, dunk, half court shot, fast break, and 13 more categories
- **Natural Language Search** — type _"my half court shot"_ or _"pick and roll into a layup"_ and Gemini finds it
- **Instant Clip Playback** — watch, navigate, and download individual clips
- **Category Filters** — browse by play type with clip counts

---

## Quick Start

### Prerequisites

```bash
brew install ffmpeg        # Required for video processing
brew install python@3.11   # Python 3.10+
brew install node          # Node 18+
```

### Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key (free tier works)

### Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Run

```bash
./start.sh
```

Open **http://localhost:5173** in your browser.

---

## How It Works

```
Video Upload
     │
     ▼
Scene Detection (OpenCV frame differencing)
     │  splits video into 2-30 second segments
     ▼
Frame Extraction (FFmpeg — 4 frames per clip)
     │
     ▼
Gemini 1.5 Flash Vision (per clip)
     │  → category (e.g. half_court_shot)
     │  → description ("Player launches a half-court heave...")
     │  → confidence score
     ▼
SQLite Storage (clips + metadata)
     │
     ▼
Natural Language Search
     │  Gemini ranks clips by relevance to your query
     ▼
Return Matching Clips + Serve Video Files
```

---

## Project Structure

```
clutch-cut/
├── backend/
│   ├── main.py              # FastAPI app & endpoints
│   ├── video_processor.py   # FFmpeg + OpenCV scene detection
│   ├── ai_analyzer.py       # Gemini Vision integration
│   ├── database.py          # SQLite operations
│   ├── models.py            # Pydantic schemas
│   ├── requirements.txt
│   └── .env                 # GEMINI_API_KEY goes here
├── frontend/
│   └── src/
│       ├── App.tsx           # Main app logic
│       ├── components/       # UI components
│       ├── api/              # Backend API client
│       └── types/            # TypeScript types
├── start.sh                  # One-command launcher
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a video file |
| GET | `/api/status/{job_id}` | Poll processing progress |
| GET | `/api/clips/{job_id}` | Get all analyzed clips |
| POST | `/api/search` | Semantic search across clips |
| GET | `/api/clip/download/{filename}` | Download a clip |

---

## Supported Play Categories

| Category | Description |
|----------|-------------|
| `offense` | General offensive play |
| `defense` | Defensive play |
| `pick_and_roll` | Pick and roll action |
| `fast_break` | Fast break opportunity |
| `three_pointer` | Three-point shot attempt |
| `dunk` | Dunk |
| `half_court_shot` | Half court or logo shot |
| `layup` | Layup attempt |
| `steal` | Defensive steal |
| `block` | Blocked shot |
| `rebound` | Offensive or defensive rebound |
| `alley_oop` | Alley-oop |
| `crossover` | Crossover dribble |
| `transition` | Transition play |
| `free_throw` | Free throw attempt |
