import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";

interface Props {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

const ACCEPTED = {
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/x-msvideo": [".avi"],
  "video/webm": [".webm"],
  "video/x-matroska": [".mkv"],
};

export default function VideoUpload({ onUpload, isUploading }: Props) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError("Please upload a valid video file (MP4, MOV, AVI, WebM, MKV).");
        return;
      }
      if (accepted[0]) onUpload(accepted[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={clsx(
          "relative rounded-2xl p-12 transition-all duration-300 cursor-pointer tape-border",
          "flex flex-col items-center justify-center gap-5 text-center",
          "bg-navy-dark/80 backdrop-blur-sm",
          isDragActive && "border-sky-film/60 bg-sky-film/5 scale-[1.01]",
          !isDragActive && "hover:border-sky-film/40 hover:bg-sky-dark/40",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        {/* Film reel icon made with CSS */}
        <div className={clsx(
          "w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 relative",
          isDragActive ? "border-sky-film bg-sky-film/10" : "border-cream-muted/30 bg-navy/60"
        )}>
          {/* Sprocket holes */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {[0,60,120,180,240,300].map(deg => (
              <div
                key={deg}
                className="absolute w-3 h-3 bg-navy-dark rounded-full border border-cream-muted/20"
                style={{
                  top: '50%', left: '50%',
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-30px)`
                }}
              />
            ))}
          </div>
          <span className="text-3xl relative z-10">
            {isDragActive ? "🎬" : "📽️"}
          </span>
        </div>

        <div>
          <p className="text-xl font-bold text-cream mb-1 tracking-wide">
            {isDragActive ? "DROP FOOTAGE" : "LOAD FOOTAGE"}
          </p>
          <p className="text-sm text-cream-muted font-mono tracking-wider">
            MP4 · MOV · AVI · WebM · MKV
          </p>
        </div>

        {!isDragActive && (
          <button
            type="button"
            className={clsx(
              "px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase transition-all",
              "bg-sky-film/15 border border-sky-film/40 text-sky-film",
              "hover:bg-sky-film/25 hover:border-sky-film/70 hover:shadow-[0_0_20px_rgba(91,188,214,0.2)]",
              isUploading && "opacity-50"
            )}
          >
            {isUploading ? "◼ LOADING..." : "◉ SELECT FILE"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <p className="mt-4 text-xs text-cream-muted/40 text-center font-mono tracking-widest">
        GEMINI VISION AI  ·  AUTO SCENE DETECT  ·  PLAY CLASSIFICATION
      </p>
    </div>
  );
}
