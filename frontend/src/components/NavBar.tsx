import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import clsx from "clsx";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "HOME" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
];

export default function NavBar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-cream-muted/8 bg-navy-dark/90 backdrop-blur-md">
        {/* Scanline on navbar */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="ClutchCut"
              className="h-9 w-auto select-none"
              style={{ filter: 'invert(1) sepia(1) saturate(0) brightness(1.8) drop-shadow(0 0 8px rgba(91,188,214,0.3))' }}
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    "px-4 py-2 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all",
                    active
                      ? "text-sky-film bg-sky-film/10 border border-sky-film/25"
                      : "text-cream-muted/40 hover:text-cream-muted/70 hover:bg-white/5"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 tape-border rounded-lg bg-navy/60">
                  <User className="w-3 h-3 text-sky-film" />
                  <span className="font-mono text-[11px] text-cream-muted/60 tracking-wide">{user.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 tape-border rounded-lg bg-navy/60 hover:bg-navy text-cream-muted/40 hover:text-cream-muted/70 font-mono text-[11px] tracking-wider uppercase transition-all"
                >
                  <LogOut className="w-3 h-3" />
                  SIGN OUT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={clsx(
                  "px-5 py-2 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all",
                  "bg-sky-film/15 border border-sky-film/40 text-sky-film",
                  "hover:bg-sky-film/25 hover:border-sky-film/60 hover:shadow-[0_0_15px_rgba(91,188,214,0.2)]"
                )}
              >
                ◉ LOGIN
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-cream-muted/50 hover:text-cream-muted/80 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-cream-muted/8 bg-navy-dark/95 backdrop-blur-md px-6 py-4 flex flex-col gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "px-4 py-3 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all",
                  location.pathname === to
                    ? "text-sky-film bg-sky-film/10 border border-sky-film/20"
                    : "text-cream-muted/40 hover:text-cream-muted/70 hover:bg-white/5"
                )}
              >
                {label}
              </Link>
            ))}
            <div className="h-px bg-cream-muted/5 my-1" />
            {user ? (
              <>
                <div className="px-4 py-2 font-mono text-[11px] text-cream-muted/40 tracking-wide">
                  Signed in as <span className="text-sky-film">{user.name}</span>
                </div>
                <button onClick={handleSignOut} className="px-4 py-3 rounded-lg font-mono text-[11px] tracking-widest uppercase text-cream-muted/40 hover:text-cream-muted/70 text-left transition-all">
                  SIGN OUT
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg font-mono text-[11px] tracking-widest uppercase text-sky-film bg-sky-film/10 border border-sky-film/20 text-center transition-all"
              >
                ◉ LOGIN / REGISTER
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
