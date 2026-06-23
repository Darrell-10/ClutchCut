import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import creator from "../assets/creator.png";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-dark relative">
      {/* VHS overlays */}
      <div className="vhs-scanlines vhs-noise pointer-events-none" />
      <div className="vhs-tracking pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* Film sprockets */}
      <div className="fixed left-0 top-0 bottom-0 w-6 flex flex-col justify-around items-center py-4 pointer-events-none opacity-10 z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-3 h-4 border border-cream-muted/60 rounded-sm bg-navy-dark" />
        ))}
      </div>
      <div className="fixed right-0 top-0 bottom-0 w-6 flex flex-col justify-around items-center py-4 pointer-events-none opacity-10 z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-3 h-4 border border-cream-muted/60 rounded-sm bg-navy-dark" />
        ))}
      </div>

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 10% 20%, rgba(44,24,16,0.6) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 90% 80%, rgba(15,30,58,0.9) 0%, transparent 60%)
          `
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-8 py-10">

        {/* Nav */}
        <div className="flex items-center justify-between mb-16">
          <Link to="/">
            <img
              src={logo}
              alt="ClutchCut"
              className="h-12 w-auto select-none"
              style={{ filter: 'invert(1) sepia(1) saturate(0) brightness(1.8) drop-shadow(0 0 12px rgba(91,188,214,0.25))' }}
            />
          </Link>
          <Link
            to="/"
            className="font-mono text-[10px] tracking-widest uppercase text-cream-muted/40 hover:text-sky-film transition-colors border border-cream-muted/10 hover:border-sky-film/30 px-4 py-2 rounded-lg"
          >
            ← BACK TO APP
          </Link>
        </div>

        {/* Slogan banner */}
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] tracking-[0.5em] text-sky-film/50 uppercase mb-4">ClutchCut · Est. 2026</p>
          <h1 className="text-4xl sm:text-5xl font-black text-cream leading-tight tracking-tight">
            Show your work.
          </h1>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight"
            style={{ color: '#5BBCD6' }}>
            Achieve your dreams.
          </h1>
          <div className="mt-6 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-sky-film/40 to-transparent" />
        </div>

        {/* Creator card */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Photo */}
          <div className="relative">
            {/* VHS frame decoration */}
            <div className="absolute -inset-3 rounded-2xl border border-sky-film/10 pointer-events-none" />
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-sky-film/50 rounded-tl" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-sky-film/50 rounded-tr" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-sky-film/50 rounded-bl" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-sky-film/50 rounded-br" />

            <div className="relative rounded-xl overflow-hidden tape-border shadow-[0_0_60px_rgba(91,188,214,0.08)]">
              <img
                src={creator}
                alt="Darrell Cenido"
                className="w-full object-cover"
                style={{ maxHeight: '520px', objectPosition: 'center top' }}
              />
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
                }}
              />
              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy-dark/80 to-transparent" />

              {/* Name tag overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="tape-border bg-navy-dark/85 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="font-mono text-[10px] text-sky-film/60 tracking-widest uppercase mb-0.5">Creator & Founder</p>
                  <p className="font-bold text-cream text-lg tracking-wide">Darrell Cenido</p>
                </div>
              </div>

              {/* REC indicator on photo */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-[recBlink_1.2s_ease-in-out_infinite] shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                <span className="font-mono text-[9px] text-cream-dark/60 tracking-widest">REC</span>
              </div>
            </div>
          </div>

          {/* Bio content */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-[10px] text-sky-film/50 tracking-[0.4em] uppercase mb-3">About the Creator</p>
              <h2 className="text-3xl font-black text-cream mb-4 tracking-tight">Darrell Cenido</h2>
              <div className="h-px w-16 bg-sky-film/30 mb-6" />
              <div className="space-y-4 text-cream-muted/60 text-sm leading-relaxed font-light">
                <p>
                  Darrell Cenido is a basketball player and technologist who built ClutchCut to solve a real problem every baller faces — digging through hours of raw game footage just to find one play.
                </p>
                <p>
                  Combining a love for the game with cutting-edge AI, ClutchCut was designed to make film study faster, smarter, and accessible for players at every level — from rec leagues to elite programs.
                </p>
                <p>
                  Built with Gemini Vision AI and a passion for hoops, ClutchCut gives players the tools to analyze their game the way the pros do.
                </p>
              </div>
            </div>

            {/* Stats / pillars */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Vision", sub: "Gemini AI" },
                { label: "Purpose", sub: "Film Study" },
                { label: "Mission", sub: "Level Up" },
              ].map(({ label, sub }) => (
                <div key={label} className="tape-border rounded-xl p-4 bg-navy/50 text-center">
                  <p className="text-sky-film font-black text-lg">{label}</p>
                  <p className="font-mono text-[9px] text-cream-muted/30 tracking-widest uppercase mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Slogan quote */}
            <div className="tape-border rounded-xl p-5 bg-brown-dark/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-film/40 rounded-l-xl" />
              <p className="font-mono text-[10px] text-sky-film/40 tracking-widest uppercase mb-2">ClutchCut Motto</p>
              <p className="text-cream font-bold text-lg leading-snug pl-2">
                "Show your work.<br />Achieve your dreams."
              </p>
            </div>

            {/* Back CTA */}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono font-bold text-xs tracking-widest uppercase transition-all bg-sky-film/15 border border-sky-film/40 text-sky-film hover:bg-sky-film/25 hover:border-sky-film/70 hover:shadow-[0_0_20px_rgba(91,188,214,0.25)]"
            >
              ◉ START FINDING CLIPS
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-6 border-t border-cream-muted/5 text-center">
          <p className="font-mono text-[9px] text-cream-muted/20 tracking-[0.4em] uppercase">
            ClutchCut © 2026 · Darrell Cenido · Built with Gemini Vision AI
          </p>
        </div>
      </div>
    </div>
  );
}
