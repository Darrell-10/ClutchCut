import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Film, AlertCircle } from "lucide-react";
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
      if (accepted[0]) {
        onUpload(accepted[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
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
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center gap-4 text-center",
          isDragActive && !isDragReject && "border-orange-400 bg-orange-500/10 scale-[1.01]",
          isDragReject && "border-red-400 bg-red-500/10",
          !isDragActive && !isDragReject && "border-white/20 bg-white/5 hover:border-orange-400/60 hover:bg-orange-500/5",
          isUploading && "opacity-60 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        <div className={clsx(
          "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors",
          isDragActive ? "bg-orange-500/20" : "bg-white/10"
        )}>
          {isDragActive ? (
            <Film className="w-10 h-10 text-orange-400" />
          ) : (
            <Upload className="w-10 h-10 text-white/60" />
          )}
        </div>

        <div>
          <p className="text-xl font-semibold text-white mb-1">
            {isDragActive ? "Drop it here!" : "Drop your game footage"}
          </p>
          <p className="text-sm text-white/50">
            MP4, MOV, AVI, WebM, MKV · Any length
          </p>
        </div>

        {!isDragActive && (
          <button
            type="button"
            className={clsx(
              "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
              "bg-orange-500 hover:bg-orange-400 text-white",
              isUploading && "opacity-50"
            )}
          >
            {isUploading ? "Uploading..." : "Browse File"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <p className="mt-4 text-xs text-white/30 text-center">
        Gemini Vision AI will scan your footage and classify every play automatically
      </p>
    </div>
  );
}
