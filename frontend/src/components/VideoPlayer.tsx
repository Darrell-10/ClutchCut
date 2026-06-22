import { useEffect, useRef } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { Clip } from "../types";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_EMOJIS } from "../types";
import { getClipUrl, getDownloadUrl } from "../api";

interface Props {
  clip: Clip;
  clips: Clip[];
  onClose: () => void;
  onNavigate: (clip: Clip) => void;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ clip, clips, onClose, onNavigate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentIdx = clips.findIndex((c) => c.id === clip.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < clips.length - 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(clips[currentIdx - 1]);
      if (e.key === "ArrowRight" && hasNext) onNavigate(clips[currentIdx + 1]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, hasPrev, hasNext, clips, currentIdx, onNavigate]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [clip.id]);

  const label = CATEGORY_LABELS[clip.category] ?? clip.category;
  const color = CATEGORY_COLORS[clip.category] ?? CATEGORY_COLORS.unknown;
  const emoji = CATEGORY_EMOJIS[clip.category] ?? "❓";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border",
              color
            )}>
              <span>{emoji}</span>
              {label}
            </div>
            <span className="text-white/40 text-sm">
              {formatTime(clip.start_time)} – {formatTime(clip.end_time)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getDownloadUrl(clip.clip_filename)}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="relative bg-black rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            key={clip.id}
            src={getClipUrl(clip.clip_filename)}
            controls
            autoPlay
            className="w-full max-h-[70vh] object-contain"
          />

          {/* Navigation overlays */}
          {hasPrev && (
            <button
              onClick={() => onNavigate(clips[currentIdx - 1])}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={() => onNavigate(clips[currentIdx + 1])}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Description */}
        <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/70 text-sm leading-relaxed">{clip.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-white/30">
            <span>Clip {currentIdx + 1} of {clips.length}</span>
            <span>Confidence: {Math.round(clip.confidence * 100)}%</span>
            <span>Duration: {formatTime(clip.duration)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-2">
          ← → arrow keys to navigate · Esc to close
        </p>
      </div>
    </div>
  );
}
