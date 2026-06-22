export type PlayCategory =
  | "offense"
  | "defense"
  | "pick_and_roll"
  | "fast_break"
  | "three_pointer"
  | "dunk"
  | "half_court_shot"
  | "layup"
  | "steal"
  | "block"
  | "rebound"
  | "turnover"
  | "free_throw"
  | "alley_oop"
  | "crossover"
  | "transition"
  | "unknown";

export type JobStatus = "pending" | "processing" | "done" | "failed";

export interface UploadResponse {
  job_id: string;
  filename: string;
  message: string;
}

export interface ProcessingStatus {
  job_id: string;
  status: JobStatus;
  progress: number;
  total_clips: number;
  processed_clips: number;
  message: string;
}

export interface Clip {
  id: number;
  job_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  category: PlayCategory;
  description: string;
  confidence: number;
  clip_filename: string;
  thumbnail_filename?: string;
}

export interface SearchRequest {
  job_id: string;
  query: string;
  categories?: PlayCategory[];
}

export interface SearchResponse {
  clips: Clip[];
  total: number;
  query: string;
}

export const CATEGORY_LABELS: Record<PlayCategory, string> = {
  offense: "Offense",
  defense: "Defense",
  pick_and_roll: "Pick & Roll",
  fast_break: "Fast Break",
  three_pointer: "3-Pointer",
  dunk: "Dunk",
  half_court_shot: "Half Court Shot",
  layup: "Layup",
  steal: "Steal",
  block: "Block",
  rebound: "Rebound",
  turnover: "Turnover",
  free_throw: "Free Throw",
  alley_oop: "Alley-Oop",
  crossover: "Crossover",
  transition: "Transition",
  unknown: "Other",
};

export const CATEGORY_COLORS: Record<PlayCategory, string> = {
  offense: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  defense: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pick_and_roll: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  fast_break: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  three_pointer: "bg-green-500/20 text-green-300 border-green-500/30",
  dunk: "bg-red-500/20 text-red-300 border-red-500/30",
  half_court_shot: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  layup: "bg-orange-400/20 text-orange-200 border-orange-400/30",
  steal: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  block: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  rebound: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  turnover: "bg-red-400/20 text-red-200 border-red-400/30",
  free_throw: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  alley_oop: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  crossover: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  transition: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export const CATEGORY_EMOJIS: Record<PlayCategory, string> = {
  offense: "⚡",
  defense: "🛡️",
  pick_and_roll: "🔄",
  fast_break: "💨",
  three_pointer: "🎯",
  dunk: "💥",
  half_court_shot: "🏀",
  layup: "🤙",
  steal: "✂️",
  block: "🚫",
  rebound: "↩️",
  turnover: "❌",
  free_throw: "🎱",
  alley_oop: "🌟",
  crossover: "🕺",
  transition: "🏃",
  unknown: "❓",
};
