import { CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";
import type { ProcessingStatus as Status } from "../types";

interface Props {
  status: Status;
}

export default function ProcessingStatus({ status }: Props) {
  const isDone = status.status === "done";
  const isFailed = status.status === "failed";
  const isProcessing = status.status === "processing" || status.status === "pending";

  return (
    <div className="w-full max-w-2xl mx-auto tape-border rounded-2xl p-6 bg-navy-dark/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isDone && <CheckCircle className="w-5 h-5 text-sky-film flex-shrink-0" />}
          {isFailed && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
          {isProcessing && (
            <span className="w-3 h-3 rounded-full bg-red-500 animate-[recBlink_1.2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(239,68,68,0.8)] flex-shrink-0" />
          )}
          <div>
            <p className={clsx(
              "font-mono font-bold tracking-widest text-sm uppercase",
              isDone ? "text-sky-film" : isFailed ? "text-red-400" : "text-cream-dark"
            )}>
              {isDone ? "ANALYSIS COMPLETE" : isFailed ? "PROCESS FAILED" : "● ANALYZING FOOTAGE"}
            </p>
            <p className="text-xs text-cream-muted/50 font-mono mt-0.5">{status.message}</p>
          </div>
        </div>
        <span className={clsx(
          "font-mono font-black text-2xl",
          isDone ? "text-sky-film" : "text-cream-dark"
        )}>
          {status.progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-navy rounded-full overflow-hidden mb-4 shimmer-bar">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-700",
            isDone
              ? "bg-sky-film shadow-[0_0_12px_rgba(91,188,214,0.6)]"
              : isFailed
              ? "bg-red-500"
              : "bg-gradient-to-r from-sky-dark via-sky-film to-sky-light shadow-[0_0_12px_rgba(91,188,214,0.4)]"
          )}
          style={{ width: `${status.progress}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between items-center font-mono text-xs text-cream-muted/50 tracking-wider">
        <span>
          {status.total_clips > 0
            ? `CLIPS: ${status.processed_clips}/${status.total_clips}`
            : "DETECTING SCENES..."}
        </span>
        <span className="text-cream-muted/30">SP ■ HI-FI</span>
        <span>
          {isDone ? "TAPE READY" : isProcessing ? "PROCESSING" : "STANDBY"}
        </span>
      </div>

      {isDone && status.total_clips > 0 && (
        <div className="mt-4 pt-4 border-t border-sky-film/10 text-center">
          <p className="text-cream-muted/60 text-sm font-mono tracking-wider">
            <span className="text-sky-film font-bold">{status.total_clips}</span> CLIPS CATALOGUED AND READY
          </p>
        </div>
      )}
    </div>
  );
}
