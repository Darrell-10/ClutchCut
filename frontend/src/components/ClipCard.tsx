import { Play, Download, Clock } from "lucide-react";
import clsx from "clsx";
import type { Clip } from "../types";
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from "../types";
import { getThumbnailUrl, getDownloadUrl } from "../api";

interface Props {
  clip: Clip;
  onPlay: (clip: Clip) => void;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const CATEGORY_TAPE_COLORS: Record<string, string> = {
  offense:       "border-amber-500/50 text-amber-300 bg-amber-500/10",
  defense:       "border-sky-film/50 text-sky-film bg-sky-film/10",
  pick_and_roll: "border-purple-400/50 text-purple-300 bg-purple-400/10",
  fast_break:    "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
  three_pointer: "border-green-400/50 text-green-300 bg-green-400/10",
  dunk:          "border-red-400/50 text-red-300 bg-red-400/10",
  half_court_shot: "border-pink-400/50 text-pink-300 bg-pink-400/10",
  layup:         "border-orange-400/50 text-orange-300 bg-orange-400/10",
  steal:         "border-cyan-400/50 text-cyan-300 bg-cyan-400/10",
  block:         "border-indigo-400/50 text-indigo-300 bg-indigo-400/10",
  rebound:       "border-teal-400/50 text-teal-300 bg-teal-400/10",
  turnover:      "border-red-300/50 text-red-200 bg-red-300/10",
  free_throw:    "border-lime-400/50 text-lime-300 bg-lime-400/10",
  alley_oop:     "border-violet-400/50 text-violet-300 bg-violet-400/10",
  crossover:     "border-amber-300/50 text-amber-200 bg-amber-300/10",
  transition:    "border-sky-300/50 text-sky-200 bg-sky-300/10",
  unknown:       "border-cream-muted/20 text-cream-muted/50 bg-cream-muted/5",
};

export default function ClipCard({ clip, onPlay }: Props) {
  const label = CATEGORY_LABELS[clip.category] ?? clip.category;
  const emoji = CATEGORY_EMOJIS[clip.category] ?? "❓";
  const tapeColor = CATEGORY_TAPE_COLORS[clip.category] ?? CATEGORY_TAPE_COLORS.unknown;
  const confidence = Math.round(clip.confidence * 100);

  return (
    <div className="group relative tape-border rounded-xl overflow-hidden bg-navy-dark/70 hover:bg-navy/50 transition-all duration-200 hover:shadow-[0_0_30px_rgba(91,188,214,0.08)]">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-brown-dark/60 cursor-pointer overflow-hidden"
        onClick={() => onPlay(clip)}
      >
        {clip.thumbnail_filename ? (
          <img
            src={getThumbnailUrl(clip.thumbnail_filename)}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center film-strip">
            <span className="text-4xl opacity-40">{emoji}</span>
          </div>
        )}

        {/* VHS overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />

        {/* Scanline effect on thumbnail */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)'
          }}
        />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full border-2 border-sky-film/70 bg-navy-dark/80 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(91,188,214,0.4)]">
            <Play className="w-5 h-5 text-sky-film fill-sky-film ml-0.5" />
          </div>
        </div>

        {/* Duration - VHS counter style */}
        <div className="absolute bottom-2 right-2 bg-navy-dark/90 border border-cream-muted/10 rounded px-2 py-0.5 text-[10px] text-cream-dark font-mono tracking-widest">
          {formatTime(clip.duration)}
        </div>

        {/* Category badge */}
        <div className={clsx(
          "absolute top-2 left-2 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-bold border tracking-wider uppercase",
          tapeColor
        )}>
          {emoji} {label}
        </div>
      </div>

      {/* Info panel */}
      <div className="p-4">
        <p className="text-xs text-cream-muted/60 line-clamp-2 leading-relaxed mb-3 font-mono">
          {clip.description || "Basketball play detected"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-[10px] text-cream-muted/40 tracking-wider">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(clip.start_time)}
            </span>
            <span className="text-sky-film/50">▮ {confidence}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(clip)}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-sky-film/30 bg-sky-film/8 hover:bg-sky-film/20 hover:border-sky-film/60 text-sky-film text-[10px] font-mono tracking-widest uppercase transition-all"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              PLAY
            </button>
            <a
              href={getDownloadUrl(clip.clip_filename)}
              download
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-cream-muted/10 bg-navy/40 hover:bg-navy hover:border-cream-muted/20 text-cream-muted/50 text-[10px] font-mono transition-all"
            >
              <Download className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
