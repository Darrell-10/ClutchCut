import { useState, type KeyboardEvent } from "react";
import { Search, Sparkles } from "lucide-react";
import clsx from "clsx";

interface Props {
  onSearch: (query: string) => void;
  isSearching: boolean;
  disabled?: boolean;
}

const EXAMPLE_SEARCHES = [
  "half court shot",
  "pick and roll",
  "fast break dunk",
  "steal and layup",
  "behind the back crossover",
  "alley-oop",
  "blocked shot",
  "clutch three pointer",
];

export default function SearchBar({ onSearch, isSearching, disabled }: Props) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const q = query.trim();
    if (q) onSearch(q);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled || isSearching}
            placeholder="Describe the play you're looking for..."
            className={clsx(
              "w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-white/30",
              "bg-white/8 border border-white/15 outline-none text-base",
              "focus:border-orange-400/60 focus:bg-white/10 transition-all",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={disabled || isSearching || !query.trim()}
          className={clsx(
            "px-6 py-4 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap",
            "bg-orange-500 hover:bg-orange-400 text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isSearching ? (
            <>
              <Sparkles className="w-4 h-4 animate-pulse" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Find Clip
            </>
          )}
        </button>
      </div>

      {/* Example queries */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-white/30 self-center">Try:</span>
        {EXAMPLE_SEARCHES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              onSearch(ex);
            }}
            disabled={disabled || isSearching}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg border transition-all",
              "border-white/10 text-white/40 hover:border-orange-400/40 hover:text-white/70 hover:bg-orange-500/5",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
