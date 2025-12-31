import type { Pet } from "../lib/api";

export default function BreedPanel({
  pets,
  selected,
  onBreed,
  error,
  busy,
  labels
}: {
  pets: Pet[];
  selected: number[];
  onBreed: () => void;
  error: string | null;
  busy: boolean;
  labels: {
    title: string;
    description: string;
    selectionPlaceholder: string;
    breed: string;
    breeding: string;
    availablePets: string;
  };
}) {
  const selectionText = selected.length
    ? selected.map((id) => `#${id}`).join(" + ")
    : labels.selectionPlaceholder;

  return (
    <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-md">
      <h2 className="text-xl font-semibold">{labels.title}</h2>
      <p className="mt-1 text-sm text-ink/70">{labels.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-ink/20 bg-parchment px-4 py-2 text-sm">
          {selectionText}
        </div>
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            selected.length === 2 && !busy
              ? "bg-ink text-white hover:bg-ink/90"
              : "bg-ink/20 text-ink/40"
          }`}
          disabled={selected.length !== 2 || busy}
          onClick={onBreed}
        >
          {busy ? labels.breeding : labels.breed}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}

      <div className="mt-4 text-xs text-ink/60">
        {labels.availablePets}: {pets.length}
      </div>
    </section>
  );
}
