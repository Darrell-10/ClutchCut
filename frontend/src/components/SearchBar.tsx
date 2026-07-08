import { useState, type KeyboardEvent } from "react";
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
  "alley-oop",
  "blocked shot",
  "crossover",
  "three pointer",
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
          {/* Finder bracket decoration */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60">
            <div className="absolute top-0 left-0 w-2 h-0.5 bg-sky-film" />
            <div className="absolute top-0 left-0 w-0.5 h-2 bg-sky-film" />
            <div className="absolute bottom-0 right-0 w-2 h-0.5 bg-sky-film" />
            <div className="absolute bottom-0 right-0 w-0.5 h-2 bg-sky-film" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled || isSearching}
            placeholder="SEARCH PLAY — e.g. half court shot, pick and roll..."
            className={clsx(
              "w-full pl-10 pr-4 py-4 rounded-xl text-cream placeholder-cream/40",
              "bg-navy-dark/80 border border-sky-film/40 outline-none text-sm font-mono tracking-wide",
              "focus:border-sky-film focus:bg-navy-dark focus:shadow-[0_0_20px_rgba(91,188,214,0.15)] transition-all",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={disabled || isSearching || !query.trim()}
          className={clsx(
            "px-6 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap",
            "bg-sky-film/15 border border-sky-film/40 text-sky-film",
            "hover:bg-sky-film/25 hover:border-sky-film/70 hover:shadow-[0_0_20px_rgba(91,188,214,0.25)]",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
        >
          {isSearching ? "◉ SCANNING..." : "◉ FIND CLIP"}
        </button>
      </div>

      {/* Example tags */}
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-cream/60 font-mono tracking-widest">QUICK FIND:</span>
        {EXAMPLE_SEARCHES.map((ex) => (
          <button
            key={ex}
            onClick={() => { setQuery(ex); onSearch(ex); }}
            disabled={disabled || isSearching}
            className={clsx(
              "text-[10px] px-3 py-1 rounded-md border font-mono tracking-wider uppercase transition-all",
              "border-cream/20 text-cream/60",
              "hover:border-sky-film/60 hover:text-sky-film hover:bg-sky-film/5",
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
