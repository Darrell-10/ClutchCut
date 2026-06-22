import { CheckCircle, Loader2, AlertCircle, Zap } from "lucide-react";
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
    <div className="w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        {isDone && <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />}
        {isFailed && <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
        {isProcessing && <Loader2 className="w-6 h-6 text-orange-400 animate-spin flex-shrink-0" />}
        <div>
          <h3 className={clsx(
            "font-semibold text-lg",
            isDone ? "text-green-400" : isFailed ? "text-red-400" : "text-orange-400"
          )}>
            {isDone ? "Analysis Complete!" : isFailed ? "Processing Failed" : "Analyzing Footage..."}
          </h3>
          <p className="text-sm text-white/50">{status.message}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            isDone ? "bg-green-500" : isFailed ? "bg-red-500" : "bg-gradient-to-r from-orange-500 to-amber-400"
          )}
          style={{ width: `${status.progress}%` }}
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <Zap className="w-4 h-4 text-orange-400" />
          {status.total_clips > 0
            ? `${status.processed_clips} / ${status.total_clips} clips analyzed`
            : "Detecting scenes..."}
        </div>
        <span className={clsx(
          "font-mono font-bold",
          isDone ? "text-green-400" : "text-orange-400"
        )}>
          {status.progress}%
        </span>
      </div>

      {isDone && status.total_clips > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-white/70 text-sm">
            Found <span className="text-white font-bold">{status.total_clips}</span> clips ready to search
          </p>
        </div>
      )}
    </div>
  );
}
