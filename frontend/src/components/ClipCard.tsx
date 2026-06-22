import { Play, Download, Clock, TrendingUp } from "lucide-react";
import clsx from "clsx";
import type { Clip } from "../types";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_EMOJIS } from "../types";
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

export default function ClipCard({ clip, onPlay }: Props) {
  const label = CATEGORY_LABELS[clip.category] ?? clip.category;
  const color = CATEGORY_COLORS[clip.category] ?? CATEGORY_COLORS.unknown;
  const emoji = CATEGORY_EMOJIS[clip.category] ?? "❓";
  const confidence = Math.round(clip.confidence * 100);

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-400/40 hover:bg-white/8 transition-all duration-200">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-black/40 cursor-pointer overflow-hidden"
        onClick={() => onPlay(clip)}
      >
        {clip.thumbnail_filename ? (
          <img
            src={getThumbnailUrl(clip.thumbnail_filename)}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{emoji}</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-orange-500/90 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded px-2 py-0.5 text-xs text-white font-mono">
          {formatTime(clip.duration)}
        </div>

        {/* Category badge */}
        <div className={clsx(
          "absolute top-2 left-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold border backdrop-blur-sm",
          color
        )}>
          <span>{emoji}</span>
          {label}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-sm text-white/70 line-clamp-2 leading-relaxed mb-3">
          {clip.description || "Basketball play detected"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(clip.start_time)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {confidence}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(clip)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/30 text-orange-300 text-xs font-medium transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              Play
            </button>
            <a
              href={getDownloadUrl(clip.clip_filename)}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
