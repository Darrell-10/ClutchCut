import { useEffect, useRef } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { Clip } from "../types";
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from "../types";
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
  const emoji = CATEGORY_EMOJIS[clip.category] ?? "❓";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/95 backdrop-blur-md"
      style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px), rgba(8,15,30,0.97)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-sky-film border border-sky-film/30 px-2 py-1 rounded tracking-widest uppercase bg-sky-film/10">
              {emoji} {label}
            </span>
            <span className="font-mono text-xs text-cream-muted/40 tracking-wider">
              {formatTime(clip.start_time)} – {formatTime(clip.end_time)}
            </span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-[recBlink_1.2s_ease-in-out_infinite]" />
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getDownloadUrl(clip.clip_filename)}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg tape-border bg-navy/60 hover:bg-navy text-cream-muted/60 text-xs font-mono tracking-wider uppercase transition-all"
            >
              <Download className="w-3 h-3" />
              SAVE CLIP
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg tape-border bg-navy/60 hover:bg-navy text-cream-muted/60 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="relative bg-black rounded-xl overflow-hidden tape-border shadow-[0_0_60px_rgba(91,188,214,0.1)]">
          <video
            ref={videoRef}
            key={clip.id}
            src={getClipUrl(clip.clip_filename)}
            controls
            autoPlay
            className="w-full max-h-[68vh] object-contain"
          />

          {/* Scanline on video */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px)'
            }}
          />

          {/* Nav buttons */}
          {hasPrev && (
            <button
              onClick={() => onNavigate(clips[currentIdx - 1])}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-sky-film/30 bg-navy-dark/80 hover:bg-navy-dark hover:border-sky-film/60 flex items-center justify-center text-sky-film transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={() => onNavigate(clips[currentIdx + 1])}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-sky-film/30 bg-navy-dark/80 hover:bg-navy-dark hover:border-sky-film/60 flex items-center justify-center text-sky-film transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Description */}
        <div className="mt-3 p-4 tape-border rounded-xl bg-navy-dark/70">
          <p className="text-cream-muted/60 text-xs font-mono leading-relaxed">{clip.description}</p>
          <div className="mt-2 flex items-center gap-5 text-[10px] text-cream-muted/25 font-mono tracking-widest">
            <span>CLIP {currentIdx + 1}/{clips.length}</span>
            <span>CONF: {Math.round(clip.confidence * 100)}%</span>
            <span>DUR: {formatTime(clip.duration)}</span>
          </div>
        </div>

        <p className="text-center text-[10px] text-cream-muted/20 mt-2 font-mono tracking-widest">
          ◀ ▶  ARROW KEYS TO NAVIGATE  ·  ESC TO CLOSE
        </p>
      </div>
    </div>
  );
}
