import type { Egg } from "../lib/api";

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function EggCard({
  egg,
  now,
  onHatch
}: {
  egg: Egg;
  now: number;
  onHatch: (id: number) => void;
}) {
  const hatchAt = new Date(egg.hatch_at).getTime();
  const remaining = hatchAt - now;
  const ready = remaining <= 0 && egg.status === "Incubating";

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Egg #{egg.id}</h3>
          <p className="text-sm text-ink/70">{egg.status}</p>
        </div>
        <span className="rounded-full bg-amber-200 px-3 py-1 text-xs text-ink">
          {ready ? "Ready" : "Incubating"}
        </span>
      </div>

      <div className="mt-3 text-sm text-ink/80">
        <p>Time left: {ready ? "0m 0s" : formatCountdown(remaining)}</p>
        <p>Species seed: {egg.genome.Species?.[0]}</p>
      </div>

      <button
        className={`mt-4 w-full rounded-full border px-3 py-2 text-sm font-semibold transition ${
          ready
            ? "border-ember bg-ember text-white"
            : "border-ink/30 bg-white text-ink/40"
        }`}
        onClick={() => ready && onHatch(egg.id)}
        disabled={!ready}
      >
        Hatch
      </button>
    </div>
  );
}
