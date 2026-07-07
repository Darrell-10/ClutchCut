import { Mail } from "lucide-react";
import logo from "../assets/logo.png";
import NavBar from "../components/NavBar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-navy-dark text-cream relative overflow-hidden">
      <div className="vhs-scanlines vhs-noise vhs-tracking pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 60% at 30% 20%, rgba(44,24,16,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(15,30,58,0.6) 0%, transparent 60%)
          `
        }}
      />

      <NavBar />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <img
            src={logo}
            alt="ClutchCut"
            className="h-14 w-auto mx-auto mb-6 opacity-60 select-none"
            style={{ filter: 'invert(1) sepia(1) saturate(0) brightness(1.8)' }}
          />
          <div className="font-mono text-[10px] text-sky-film/40 tracking-[0.5em] uppercase mb-3">
            ◈ GET IN TOUCH ◈
          </div>
          <h1 className="font-mono text-4xl font-bold text-cream/90 tracking-tight mb-4">Contact</h1>
          <p className="font-mono text-sm text-cream-muted/30 tracking-wide leading-relaxed max-w-md mx-auto">
            Have a question, feedback, or want to collaborate?<br/>We'd love to hear from you.
          </p>
        </div>

        {/* Main contact card */}
        <div className="tape-border rounded-2xl bg-navy/50 backdrop-blur-sm p-8 mb-6 relative overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-sky-film/20" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-sky-film/20" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-sky-film/20" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-sky-film/20" />

          <div className="flex flex-col items-center gap-6">
            {/* REC-style decoration */}
            <div className="flex items-center gap-2 font-mono text-[9px] text-sky-film/30 tracking-[0.4em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-film/40 animate-pulse" />
              PRIMARY CONTACT
              <span className="w-1.5 h-1.5 rounded-full bg-sky-film/40 animate-pulse" />
            </div>

            {/* Email */}
            <div className="text-center">
              <p className="font-mono text-[10px] text-cream-muted/30 tracking-widest uppercase mb-3">Email</p>
              <a
                href="mailto:darrell.cenido@gmail.com"
                className="flex items-center justify-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-sky-film/10 border border-sky-film/20 flex items-center justify-center group-hover:bg-sky-film/20 group-hover:border-sky-film/40 transition-all">
                  <Mail className="w-4 h-4 text-sky-film" />
                </div>
                <span className="font-mono text-lg text-cream/70 group-hover:text-cream/90 transition-colors tracking-wide">
                  darrell.cenido@gmail.com
                </span>
              </a>
            </div>

            <div className="w-24 h-px bg-cream-muted/8" />

            <p className="font-mono text-xs text-cream-muted/25 tracking-wide text-center leading-relaxed">
              Response time is typically within 24–48 hours.<br/>
              For collaborations, please include your project details.
            </p>
          </div>
        </div>

        {/* Socials row (placeholder) */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href="https://github.com/Darrell-10"
            target="_blank"
            rel="noopener noreferrer"
            className="tape-border rounded-xl bg-navy/40 p-5 flex items-center gap-4 hover:bg-navy/70 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-cream-muted/5 border border-cream-muted/10 flex items-center justify-center group-hover:border-cream-muted/20 transition-all">
              <span className="text-cream-muted/40 group-hover:text-cream-muted/70 text-sm font-mono">GH</span>
            </div>
            <div>
              <p className="font-mono text-[10px] text-cream-muted/25 tracking-widest uppercase mb-0.5">GitHub</p>
              <p className="font-mono text-xs text-cream-muted/50">Darrell-10</p>
            </div>
          </a>
          <div className="tape-border rounded-xl bg-navy/40 p-5 flex items-center gap-4 opacity-40">
            <div className="w-9 h-9 rounded-full bg-cream-muted/5 border border-cream-muted/10 flex items-center justify-center">
              <span className="text-cream-muted/40 text-sm font-mono">IG</span>
            </div>
            <div>
              <p className="font-mono text-[10px] text-cream-muted/25 tracking-widest uppercase mb-0.5">Instagram</p>
              <p className="font-mono text-xs text-cream-muted/40">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Slogan */}
        <div className="text-center mt-16">
          <p className="font-mono text-xs text-cream-muted/20 tracking-[0.3em] uppercase italic">
            "Show your work. Achieve your dreams."
          </p>
        </div>
      </div>
    </div>
  );
}
