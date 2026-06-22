import { useState, useEffect, useRef, useCallback } from "react";
import { Film, Zap, RefreshCw } from "lucide-react";
import VideoUpload from "./components/VideoUpload";
import ProcessingStatusComp from "./components/ProcessingStatus";
import SearchBar from "./components/SearchBar";
import ClipCard from "./components/ClipCard";
import VideoPlayer from "./components/VideoPlayer";
import CategoryFilter from "./components/CategoryFilter";
import type { Clip, PlayCategory, ProcessingStatus } from "./types";
import {
  uploadVideo,
  getStatus,
  getClips,
  searchClips,
} from "./api";

type Stage = "upload" | "processing" | "ready";

export default function App() {
  const [stage, setStage] = useState<Stage>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [displayedClips, setDisplayedClips] = useState<Clip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PlayCategory | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [jobFilename, setJobFilename] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const loadAllClips = useCallback(async (jId: string) => {
    try {
      const clips = await getClips(jId);
      setAllClips(clips);
      setDisplayedClips(clips);
    } catch {}
  }, []);

  const startPolling = useCallback((jId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const s = await getStatus(jId);
        setProcessingStatus(s);
        if (s.status === "done") {
          stopPolling();
          setStage("ready");
          await loadAllClips(jId);
        } else if (s.status === "failed") {
          stopPolling();
        }
      } catch {}
    }, 2500);
  }, [loadAllClips]);

  useEffect(() => () => stopPolling(), []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadVideo(file);
      setJobId(res.job_id);
      setJobFilename(res.filename);
      setStage("processing");
      const initialStatus: ProcessingStatus = {
        job_id: res.job_id,
        status: "pending",
        progress: 0,
        total_clips: 0,
        processed_clips: 0,
        message: "Starting...",
      };
      setProcessingStatus(initialStatus);
      startPolling(res.job_id);
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Upload failed. Is the backend running?");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!jobId) return;
    setIsSearching(true);
    setSearchQuery(query);
    setSelectedCategory(null);
    try {
      const res = await searchClips({ job_id: jobId, query });
      setDisplayedClips(res.clips);
    } catch {
      // Fallback: local keyword filter
      const q = query.toLowerCase();
      setDisplayedClips(
        allClips.filter(
          (c) =>
            c.description.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        )
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryFilter = (cat: PlayCategory | null) => {
    setSelectedCategory(cat);
    setSearchQuery(null);
    if (cat === null) {
      setDisplayedClips(allClips);
    } else {
      setDisplayedClips(allClips.filter((c) => c.category === cat));
    }
  };

  const handleReset = () => {
    stopPolling();
    setStage("upload");
    setJobId(null);
    setProcessingStatus(null);
    setAllClips([]);
    setDisplayedClips([]);
    setSelectedCategory(null);
    setSearchQuery(null);
    setActiveClip(null);
  };

  // Category counts for filter tabs
  const categoryCounts: Record<string, number> = {};
  for (const c of allClips) {
    categoryCounts[c.category] = (categoryCounts[c.category] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              Clutch<span className="text-orange-400">Cut</span>
            </h1>
          </div>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Upload your game footage. Search any play. Get the clip instantly.
          </p>
          {jobId && stage !== "upload" && (
            <button
              onClick={handleReset}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload new video
            </button>
          )}
        </header>

        {/* UPLOAD STAGE */}
        {stage === "upload" && (
          <div className="flex flex-col items-center gap-8">
            <VideoUpload onUpload={handleUpload} isUploading={isUploading} />

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: "🎯", label: "Scene Detection" },
                { icon: "🤖", label: "Gemini Vision AI" },
                { icon: "⚡", label: "Instant Search" },
                { icon: "✂️", label: "Auto Clip Trimming" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/50"
                >
                  <span>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROCESSING STAGE */}
        {stage === "processing" && processingStatus && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-white/50 text-sm mb-1">Processing</p>
              <p className="text-white font-semibold">{jobFilename}</p>
            </div>
            <ProcessingStatusComp status={processingStatus} />
          </div>
        )}

        {/* READY STAGE */}
        {stage === "ready" && (
          <div className="flex flex-col gap-8">
            {/* Stats bar */}
            <div className="flex items-center justify-between p-4 bg-green-500/8 border border-green-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-400">Ready to Search</p>
                  <p className="text-xs text-white/40">{jobFilename}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{allClips.length}</p>
                <p className="text-xs text-white/40">clips analyzed</p>
              </div>
            </div>

            {/* Search */}
            <SearchBar
              onSearch={handleSearch}
              isSearching={isSearching}
              disabled={false}
            />

            {/* Category filters */}
            <CategoryFilter
              selected={selectedCategory}
              counts={categoryCounts}
              onSelect={handleCategoryFilter}
            />

            {/* Results header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : selectedCategory
                    ? `${selectedCategory.replace(/_/g, " ")} clips`
                    : "All Clips"}
                </h2>
                <p className="text-sm text-white/40">{displayedClips.length} clips</p>
              </div>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery(null);
                    setSelectedCategory(null);
                    setDisplayedClips(allClips);
                  }}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Clips grid */}
            {displayedClips.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <p className="text-5xl mb-4">🏀</p>
                <p className="text-lg font-medium">No clips found</p>
                <p className="text-sm mt-1">Try a different search term or clear the filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedClips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    onPlay={setActiveClip}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeClip && (
        <VideoPlayer
          clip={activeClip}
          clips={displayedClips}
          onClose={() => setActiveClip(null)}
          onNavigate={setActiveClip}
        />
      )}
    </div>
  );
}
