import clsx from "clsx";
import type { PlayCategory } from "../types";
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from "../types";

const ALL_CATEGORIES: PlayCategory[] = [
  "offense", "defense", "pick_and_roll", "fast_break", "three_pointer",
  "dunk", "half_court_shot", "layup", "steal", "block", "rebound",
  "turnover", "alley_oop", "crossover", "transition"
];

interface Props {
  selected: PlayCategory | null;
  counts: Record<string, number>;
  onSelect: (cat: PlayCategory | null) => void;
}

export default function CategoryFilter({ selected, counts, onSelect }: Props) {
  const availableCategories = ALL_CATEGORIES.filter((c) => (counts[c] ?? 0) > 0);

  if (availableCategories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
          selected === null
            ? "bg-orange-500/20 border-orange-400/60 text-orange-300"
            : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
        )}
      >
        All
        <span className="text-xs opacity-60">({Object.values(counts).reduce((a, b) => a + b, 0)})</span>
      </button>

      {availableCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
            selected === cat
              ? "bg-orange-500/20 border-orange-400/60 text-orange-300"
              : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
          )}
        >
          <span className="text-base leading-none">{CATEGORY_EMOJIS[cat]}</span>
          {CATEGORY_LABELS[cat]}
          <span className="text-xs opacity-60">({counts[cat] ?? 0})</span>
        </button>
      ))}
    </div>
  );
}
