import type { Pet } from "../lib/api";

const RARITY_STYLES: Record<string, string> = {
  Common: "border-pearl",
  Uncommon: "border-moss",
  Rare: "border-sky",
  Epic: "border-ember",
  Legendary: "border-black"
};

const BADGE_STYLES: Record<string, string> = {
  Common: "bg-pearl text-ink",
  Uncommon: "bg-moss text-white",
  Rare: "bg-sky text-white",
  Epic: "bg-ember text-white",
  Legendary: "bg-black text-white"
};

export default function PetCard({
  pet,
  selected,
  onSelect
}: {
  pet: Pet;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const shown = pet.phenotype_public ?? pet.phenotype;
  const accent = RARITY_STYLES[pet.rarity_tier] || RARITY_STYLES.Common;
  const badge = BADGE_STYLES[pet.rarity_tier] || BADGE_STYLES.Common;

  return (
    <div
      className={`rounded-2xl border-2 ${accent} bg-white/80 p-4 shadow-sm transition`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{shown.Species}</h3>
          <p className="text-sm text-ink/70">ID #{pet.id}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs ${badge}`}>
          {pet.rarity_tier}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden>
          <defs>
            <linearGradient id={`grad-${pet.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <circle cx="30" cy="30" r="24" fill={`url(#grad-${pet.id})`} />
          <circle cx="22" cy="26" r="4" fill="#0f172a" />
          <circle cx="38" cy="26" r="4" fill={shown.EyeColor === "Void" ? "#111827" : "#1f2937"} />
          <path
            d="M20 38 C26 44, 34 44, 40 38"
            stroke="#1f2937"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-sm text-ink/80">
          <p>Body: {shown.BodyType}</p>
          <p>Pattern: {shown.Pattern}</p>
          <p>Aura: {shown.Aura}</p>
          <p>Emotion: {pet.emotion ?? "Calm"}</p>
        </div>
      </div>

      <button
        className={`mt-4 w-full rounded-full border px-3 py-2 text-sm font-semibold transition ${
          selected
            ? "border-ink bg-ink text-white"
            : "border-ink/30 bg-white text-ink hover:bg-ink/10"
        }`}
        onClick={() => onSelect(pet.id)}
      >
        {selected ? "Selected" : "Select"}
      </button>
    </div>
  );
}
