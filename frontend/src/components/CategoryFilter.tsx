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
  const available = ALL_CATEGORIES.filter((c) => (counts[c] ?? 0) > 0);
  if (available.length === 0) return null;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[10px] tracking-widest uppercase transition-all",
          selected === null
            ? "border-sky-film/60 text-sky-film bg-sky-film/10 shadow-[0_0_12px_rgba(91,188,214,0.15)]"
            : "border-cream-muted/10 text-cream-muted/30 hover:border-cream-muted/25 hover:text-cream-muted/50"
        )}
      >
        ALL CLIPS
        <span className="opacity-60">({total})</span>
      </button>

      {available.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[10px] tracking-wider uppercase transition-all",
            selected === cat
              ? "border-sky-film/60 text-sky-film bg-sky-film/10 shadow-[0_0_12px_rgba(91,188,214,0.15)]"
              : "border-cream-muted/10 text-cream-muted/30 hover:border-cream-muted/25 hover:text-cream-muted/50"
          )}
        >
          {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
          <span className="opacity-50">({counts[cat]})</span>
        </button>
      ))}
    </div>
  );
}
