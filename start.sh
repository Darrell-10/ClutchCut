#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}▶ $1${RESET}"; }
ok()   { echo -e "${GREEN}✔ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }
err()  { echo -e "${RED}✖ $1${RESET}" >&2; }

# ── Check prerequisites ──────────────────────────────────────────────────────
command -v python3 >/dev/null 2>&1 || { err "python3 not found"; exit 1; }
command -v node    >/dev/null 2>&1 || { err "node not found"; exit 1; }
command -v ffmpeg  >/dev/null 2>&1 || { warn "ffmpeg not found — install with: brew install ffmpeg"; exit 1; }

# ── Gemini API Key ───────────────────────────────────────────────────────────
if [ -f "$BACKEND/.env" ]; then
  source "$BACKEND/.env"
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo ""
  err "GEMINI_API_KEY is not set."
  echo -e "  1. Get your key at ${CYAN}https://aistudio.google.com/app/apikey${RESET}"
  echo -e "  2. Create ${BOLD}backend/.env${RESET} with:"
  echo -e "     ${YELLOW}GEMINI_API_KEY=your_key_here${RESET}"
  echo ""
  exit 1
fi
ok "Gemini API key found"

# ── Backend setup ────────────────────────────────────────────────────────────
log "Setting up Python backend..."
cd "$BACKEND"

if [ ! -d ".venv" ]; then
  log "Creating virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt
ok "Backend dependencies installed"

# ── Frontend setup ───────────────────────────────────────────────────────────
log "Setting up frontend..."
cd "$FRONTEND"
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
ok "Frontend dependencies ready"

# ── Launch ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🏀 Starting ClutchCut${RESET}"
echo -e "   Backend  → ${CYAN}http://localhost:8000${RESET}"
echo -e "   Frontend → ${CYAN}http://localhost:5173${RESET}"
echo ""

# Start backend in background
cd "$BACKEND"
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend in background
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT INT TERM

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
