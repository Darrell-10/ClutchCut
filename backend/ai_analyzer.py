import os
import json
import re
from pathlib import Path
from PIL import Image
from google import genai
from google.genai import types

PLAY_CATEGORIES = [
    "offense", "defense", "pick_and_roll", "fast_break", "three_pointer",
    "dunk", "half_court_shot", "layup", "steal", "block", "rebound",
    "turnover", "free_throw", "alley_oop", "crossover", "transition", "unknown"
]

CLASSIFY_PROMPT = """You are an expert basketball analyst with deep knowledge of basketball plays and tactics.

Analyze these frames from a basketball game clip and classify the play shown.

Respond with a JSON object ONLY (no markdown, no extra text):
{
  "category": "<one of: offense, defense, pick_and_roll, fast_break, three_pointer, dunk, half_court_shot, layup, steal, block, rebound, turnover, free_throw, alley_oop, crossover, transition, unknown>",
  "description": "<2-3 sentence detailed description of exactly what is happening in this clip, including player actions, shot type, defensive play, or other relevant details>",
  "confidence": <0.0-1.0 float>,
  "keywords": ["keyword1", "keyword2", ...]
}

Be specific: if you see a shot from half court, use half_court_shot. If you see an alley-oop, use alley_oop. Pick the MOST SPECIFIC category.
If this is purely defensive, use defense. If it's a ball-handler crossing over, use crossover."""

SEARCH_PROMPT_TEMPLATE = """You are a basketball play search expert.

A user is searching for: "{query}"

Here are available basketball clips with their descriptions:
{clips_json}

Score each clip from 0.0 to 1.0 based on how well it matches the user's query.
Consider synonyms and basketball terminology (e.g., "half court heave" = half_court_shot, "and-one" = layup, "chase-down" = block).

Respond with a JSON array ONLY (no markdown):
[
  {{"id": <clip_id>, "relevance": <0.0-1.0>}},
  ...
]

Only include clips with relevance > 0.3. Sort by relevance descending."""


def _load_pil(image_path: str) -> Image.Image:
    img = Image.open(image_path)
    img.thumbnail((640, 480))
    return img


class GeminiAnalyzer:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        self.client = genai.Client(api_key=api_key)

    def classify_clip(self, frame_paths: list[str]) -> dict:
        """Classify a basketball clip given a list of extracted frame image paths."""
        if not frame_paths:
            return {
                "category": "unknown",
                "description": "No frames available for analysis.",
                "confidence": 0.0,
                "keywords": []
            }

        parts: list = [CLASSIFY_PROMPT]
        for path in frame_paths[:5]:
            try:
                img = _load_pil(path)
                parts.append(img)
            except Exception:
                continue

        if len(parts) < 2:
            return {
                "category": "unknown",
                "description": "Could not load frames for analysis.",
                "confidence": 0.0,
                "keywords": []
            }

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=parts,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=512,
                )
            )
            text = response.text.strip()
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            result = json.loads(text)
            cat = result.get("category", "unknown").lower()
            if cat not in PLAY_CATEGORIES:
                cat = "unknown"
            result["category"] = cat
            result.setdefault("confidence", 0.7)
            result.setdefault("keywords", [])
            return result
        except Exception as e:
            return {
                "category": "unknown",
                "description": f"Analysis error: {str(e)}",
                "confidence": 0.0,
                "keywords": []
            }

    def semantic_search(self, query: str, clips: list[dict]) -> list[dict]:
        """Use Gemini to rank clips by relevance to a natural language query."""
        if not clips:
            return []

        clips_summary = [
            {"id": c["id"], "category": c["category"], "description": c["description"]}
            for c in clips
        ]

        prompt = SEARCH_PROMPT_TEMPLATE.format(
            query=query,
            clips_json=json.dumps(clips_summary, indent=2)
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=1024,
                )
            )
            text = response.text.strip()
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            rankings = json.loads(text)

            score_map = {r["id"]: r["relevance"] for r in rankings}
            scored_clips = []
            for clip in clips:
                relevance = score_map.get(clip["id"], 0.0)
                if relevance > 0.3:
                    clip_copy = dict(clip)
                    clip_copy["_relevance"] = relevance
                    scored_clips.append(clip_copy)

            scored_clips.sort(key=lambda x: x["_relevance"], reverse=True)
            return scored_clips
        except Exception:
            q_lower = query.lower()
            return [c for c in clips
                    if q_lower in c["description"].lower() or q_lower in c["category"].lower()]
