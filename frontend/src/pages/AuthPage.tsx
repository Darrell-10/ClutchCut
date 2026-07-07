import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import clsx from "clsx";
import logo from "../assets/logo.png";
import { login, register } from "../api";
import { useAuth } from "../context/AuthContext";

type Tab = "login" | "register";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res;
      if (tab === "login") {
        res = await login(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        res = await register(name, email, password);
      }
      signIn(res.access_token, { id: res.user_id, name: res.name, email: res.email });
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center px-4 relative">
      {/* VHS overlays */}
      <div className="vhs-scanlines vhs-noise pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 60% at 30% 20%, rgba(44,24,16,0.4) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(15,30,58,0.7) 0%, transparent 60%)
          `
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src={logo}
              alt="ClutchCut"
              className="h-16 w-auto mx-auto select-none mb-4"
              style={{ filter: 'invert(1) sepia(1) saturate(0) brightness(1.8) drop-shadow(0 0 12px rgba(91,188,214,0.3))' }}
            />
          </Link>
          <p className="font-mono text-[10px] text-sky-film/40 tracking-[0.4em] uppercase">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </p>
        </div>

        {/* Card */}
        <div className="tape-border rounded-2xl bg-navy/60 backdrop-blur-sm p-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 bg-navy-dark/60 rounded-xl">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className={clsx(
                  "flex-1 py-2.5 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all",
                  tab === t
                    ? "bg-sky-film/15 border border-sky-film/35 text-sky-film shadow-[0_0_12px_rgba(91,188,214,0.1)]"
                    : "text-cream-muted/30 hover:text-cream-muted/60"
                )}
              >
                {t === "login" ? "◉ Sign In" : "◎ Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name (register only) */}
            {tab === "register" && (
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-cream-muted/40 tracking-widest uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-navy-dark/80 border border-cream-muted/10 text-cream placeholder-cream-muted/20 font-mono text-sm outline-none focus:border-sky-film/40 focus:shadow-[0_0_12px_rgba(91,188,214,0.08)] transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-cream-muted/40 tracking-widest uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-navy-dark/80 border border-cream-muted/10 text-cream placeholder-cream-muted/20 font-mono text-sm outline-none focus:border-sky-film/40 focus:shadow-[0_0_12px_rgba(91,188,214,0.08)] transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-cream-muted/40 tracking-widest uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === "register" ? "Min. 6 characters" : "Your password"}
                  required
                  className="w-full px-4 pr-12 py-3 rounded-xl bg-navy-dark/80 border border-cream-muted/10 text-cream placeholder-cream-muted/20 font-mono text-sm outline-none focus:border-sky-film/40 focus:shadow-[0_0_12px_rgba(91,188,214,0.08)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted/30 hover:text-cream-muted/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full py-3.5 rounded-xl font-mono font-bold text-xs tracking-widest uppercase transition-all mt-1",
                "bg-sky-film/15 border border-sky-film/40 text-sky-film",
                "hover:bg-sky-film/25 hover:border-sky-film/70 hover:shadow-[0_0_20px_rgba(91,188,214,0.25)]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {loading
                ? "◉ PROCESSING..."
                : tab === "login" ? "◉ SIGN IN" : "◎ CREATE ACCOUNT"}
            </button>
          </form>

          {/* Switch tab hint */}
          <p className="text-center font-mono text-[10px] text-cream-muted/25 tracking-wider mt-6">
            {tab === "login" ? "No account? " : "Already have one? "}
            <button
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(null); }}
              className="text-sky-film/50 hover:text-sky-film transition-colors underline underline-offset-2"
            >
              {tab === "login" ? "Register here" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="font-mono text-[10px] text-cream-muted/20 hover:text-cream-muted/40 tracking-widest uppercase transition-colors">
            ← Back to ClutchCut
          </Link>
        </div>
      </div>
    </div>
  );
}
