import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import logo from "./assets/logo.png";
import VideoUpload from "./components/VideoUpload";
import ProcessingStatusComp from "./components/ProcessingStatus";
import SearchBar from "./components/SearchBar";
import ClipCard from "./components/ClipCard";
import VideoPlayer from "./components/VideoPlayer";
import CategoryFilter from "./components/CategoryFilter";
import CamcorderHUD from "./components/CamcorderHUD";
import type { Clip, PlayCategory, ProcessingStatus } from "./types";
import { uploadVideo, getStatus, getClips, searchClips } from "./api";

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
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
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
        if (s.status === "done") { stopPolling(); setStage("ready"); await loadAllClips(jId); }
        else if (s.status === "failed") { stopPolling(); }
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
      setProcessingStatus({ job_id: res.job_id, status: "pending", progress: 0, total_clips: 0, processed_clips: 0, message: "Starting..." });
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
      const q = query.toLowerCase();
      setDisplayedClips(allClips.filter(c => c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)));
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryFilter = (cat: PlayCategory | null) => {
    setSelectedCategory(cat);
    setSearchQuery(null);
    setDisplayedClips(cat === null ? allClips : allClips.filter(c => c.category === cat));
  };

  const handleReset = () => {
    stopPolling();
    setStage("upload"); setJobId(null); setProcessingStatus(null);
    setAllClips([]); setDisplayedClips([]); setSelectedCategory(null);
    setSearchQuery(null); setActiveClip(null);
  };

  const categoryCounts: Record<string, number> = {};
  for (const c of allClips) { categoryCounts[c.category] = (categoryCounts[c.category] ?? 0) + 1; }

  const isRecording = stage === "processing";

  return (
    <div className="min-h-screen bg-navy-dark relative" style={{ animation: 'flicker 6s ease-in-out infinite' }}>

      {/* VHS overlay layers */}
      <div className="vhs-scanlines vhs-noise pointer-events-none" />
      <div className="vhs-tracking pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* Camcorder HUD */}
      <CamcorderHUD isRecording={isRecording} />

      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(44,24,16,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 90%, rgba(15,30,58,0.8) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(91,188,214,0.03) 0%, transparent 70%)
          `
        }}
      />

      {/* Film sprocket holes - left edge */}
      <div className="fixed left-0 top-0 bottom-0 w-6 flex flex-col justify-around items-center py-4 pointer-events-none opacity-10 z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-3 h-4 border border-cream-muted/60 rounded-sm bg-navy-dark" />
        ))}
      </div>
      {/* Right edge */}
      <div className="fixed right-0 top-0 bottom-0 w-6 flex flex-col justify-around items-center py-4 pointer-events-none opacity-10 z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-3 h-4 border border-cream-muted/60 rounded-sm bg-navy-dark" />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-10">

        {/* ── HEADER ── */}
        <header className="text-center mb-14">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={logo}
                alt="ClutchCut"
                className="h-28 w-auto select-none"
                style={{
                  filter: 'invert(1) sepia(1) saturate(0) brightness(1.8) drop-shadow(0 0 24px rgba(91,188,214,0.35))'
                }}
              />
              {/* Glow behind logo */}
              <div className="absolute inset-0 blur-2xl bg-sky-film/10 -z-10 scale-150" />
            </div>
          </div>

          <p className="text-cream-muted/40 text-sm font-mono tracking-[0.4em] uppercase mb-2">
            Basketball Intelligence System
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-mono tracking-widest text-cream-muted/25">
            <span>◉ AI SCENE DETECT</span>
            <span className="text-sky-film/30">▮</span>
            <span>◉ GEMINI VISION</span>
            <span className="text-sky-film/30">▮</span>
            <span>◉ INSTANT SEARCH</span>
          </div>

          {jobId && stage !== "upload" && (
            <button
              onClick={handleReset}
              className="mt-5 inline-flex items-center gap-1.5 text-[10px] text-cream-muted/25 hover:text-cream-muted/50 transition-colors font-mono tracking-widest uppercase"
            >
              <RefreshCw className="w-3 h-3" />
              NEW FOOTAGE
            </button>
          )}
        </header>

        {/* ── UPLOAD STAGE ── */}
        {stage === "upload" && (
          <div className="flex flex-col items-center gap-10">
            <VideoUpload onUpload={handleUpload} isUploading={isUploading} />

            {/* Feature strip */}
            <div className="w-full max-w-2xl">
              <div className="h-px bg-gradient-to-r from-transparent via-sky-film/20 to-transparent mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: "🎬", label: "SCENE DETECT", sub: "Auto-split footage" },
                  { icon: "🤖", label: "GEMINI AI", sub: "Vision analysis" },
                  { icon: "⚡", label: "FAST SEARCH", sub: "Natural language" },
                  { icon: "✂️", label: "CLIP EXPORT", sub: "Download any play" },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-4 tape-border rounded-xl bg-navy/40 text-center">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="text-[10px] font-mono font-bold tracking-widest text-sky-film/70 uppercase">{label}</p>
                      <p className="text-[9px] font-mono text-cream-muted/30 mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESSING STAGE ── */}
        {stage === "processing" && processingStatus && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-mono text-cream-muted/30 tracking-widest uppercase mb-1">Loading Tape</p>
              <p className="text-cream-dark font-mono tracking-wide">{jobFilename}</p>
            </div>
            <ProcessingStatusComp status={processingStatus} />
          </div>
        )}

        {/* ── READY STAGE ── */}
        {stage === "ready" && (
          <div className="flex flex-col gap-8">
            {/* Stats bar */}
            <div className="flex items-center justify-between p-5 tape-border rounded-xl bg-navy/50">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-sky-film shadow-[0_0_8px_rgba(91,188,214,0.8)]" />
                <div>
                  <p className="text-[10px] font-mono font-bold text-sky-film tracking-widest uppercase">Tape Ready</p>
                  <p className="text-[10px] text-cream-muted/30 font-mono mt-0.5 tracking-wider">{jobFilename}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-cream font-mono">{allClips.length}</p>
                <p className="text-[10px] text-cream-muted/30 font-mono tracking-widest uppercase">CLIPS INDEXED</p>
              </div>
            </div>

            {/* Search */}
            <SearchBar onSearch={handleSearch} isSearching={isSearching} />

            {/* Category filters */}
            <CategoryFilter selected={selectedCategory} counts={categoryCounts} onSelect={handleCategoryFilter} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-sky-film/15 to-transparent" />

            {/* Results header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-mono font-bold text-cream tracking-widest uppercase">
                  {searchQuery ? `RESULTS: "${searchQuery}"` : selectedCategory ? `${selectedCategory.replace(/_/g, " ").toUpperCase()} CLIPS` : "ALL FOOTAGE"}
                </h2>
                <p className="text-[10px] text-cream-muted/30 font-mono tracking-widest mt-1">{displayedClips.length} CLIPS FOUND</p>
              </div>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => { setSearchQuery(null); setSelectedCategory(null); setDisplayedClips(allClips); }}
                  className="text-[10px] font-mono text-sky-film/50 hover:text-sky-film tracking-widest uppercase transition-colors"
                >
                  ✕ CLEAR
                </button>
              )}
            </div>

            {/* Grid */}
            {displayedClips.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4 opacity-30">📼</p>
                <p className="font-mono text-cream-muted/30 tracking-widest uppercase text-sm">NO CLIPS FOUND</p>
                <p className="font-mono text-cream-muted/20 tracking-wider text-xs mt-2">Try a different search or clear the filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedClips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} onPlay={setActiveClip} />
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
