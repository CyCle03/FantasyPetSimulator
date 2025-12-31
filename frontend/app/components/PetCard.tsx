import type { Pet } from "../lib/api";
import PetAvatar from "./PetAvatar";

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
  onSelect,
  now,
  labels,
  onView
}: {
  pet: Pet;
  selected: boolean;
  onSelect: (id: number) => void;
  now: number;
  labels: {
    body: string;
    pattern: string;
    aura: string;
    emotion: string;
    breeding: string;
    ready: string;
    view: string;
    select: string;
    selected: string;
  };
  onView: (pet: Pet) => void;
}) {
  const shown = pet.phenotype_public ?? pet.phenotype;
  const accent = RARITY_STYLES[pet.rarity_tier] || RARITY_STYLES.Common;
  const badge = BADGE_STYLES[pet.rarity_tier] || BADGE_STYLES.Common;
  const cooldown = getCooldownText(pet.breeding_locked_until, now, labels.ready);

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
        <button
          type="button"
          onClick={() => onView(pet)}
          className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300"
          aria-label={labels.view}
        >
          <PetAvatar pet={pet} />
        </button>
        <div className="text-sm text-ink/80">
          <p>{labels.body}: {shown.BodyType}</p>
          <p>{labels.pattern}: {shown.Pattern}</p>
          <p>{labels.aura}: {shown.Aura}</p>
          <p>{labels.emotion}: {pet.emotion ?? "Calm"}</p>
          <p>{labels.breeding}: {cooldown}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="w-1/3 rounded-full border border-ink/30 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10"
          onClick={() => onView(pet)}
        >
          {labels.view}
        </button>
        <button
          className={`w-2/3 rounded-full border px-3 py-2 text-sm font-semibold transition ${
            selected
              ? "border-ink bg-ink text-white"
              : "border-ink/30 bg-white text-ink hover:bg-ink/10"
          }`}
          onClick={() => onSelect(pet.id)}
        >
          {selected ? labels.selected : labels.select}
        </button>
      </div>
    </div>
  );
}

function getCooldownText(lockedUntil: string | null, now: number, readyLabel: string) {
  if (!lockedUntil) return readyLabel;
  const until = new Date(lockedUntil).getTime();
  const remaining = until - now;
  if (remaining <= 0) return readyLabel;
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
