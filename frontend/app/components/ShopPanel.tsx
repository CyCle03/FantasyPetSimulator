import { useState } from "react";

import type { Egg, Pet } from "../lib/api";

export default function ShopPanel({
  pets,
  eggs,
  gold,
  emotionPrice,
  hatchPrice,
  adoptPrice,
  adoptCooldownMinutes,
  adoptCooldownSeconds,
  adoptRemainingSeconds,
  adoptStatusText,
  adoptHighlight,
  onRefreshEmotion,
  onInstantHatch,
  onAdoptEgg,
  busy,
  error,
  adoptError,
  labels
}: {
  pets: Pet[];
  eggs: Egg[];
  gold: number;
  emotionPrice: number;
  hatchPrice: number;
  adoptPrice: number;
  adoptCooldownMinutes: number;
  adoptCooldownSeconds: number;
  adoptRemainingSeconds: number;
  adoptStatusText: string;
  adoptHighlight: boolean;
  onRefreshEmotion: (petId: number) => void;
  onInstantHatch: (eggId: number) => void;
  onAdoptEgg: () => void;
  busy: boolean;
  error: string | null;
  adoptError: string | null;
  labels: {
    title: string;
    gold: string;
    emotion: string;
    hatch: string;
    adopt: string;
    selectPet: string;
    selectEgg: string;
    refresh: string;
    instant: string;
    adoptAction: string;
    cost: string;
    cooldown: string;
    status: string;
    insufficientGold: string;
  };
}) {
  const incubating = eggs.filter((egg) => egg.status === "Incubating");
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedEggId, setSelectedEggId] = useState<number | null>(null);
  const canAdopt = gold >= adoptPrice && adoptRemainingSeconds === 0;
  const totalCooldown = Math.max(1, adoptCooldownSeconds);
  const progress = Math.min(1, 1 - adoptRemainingSeconds / totalCooldown);

  return (
    <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{labels.title}</h3>
        <span className="rounded-full bg-amber-200 px-3 py-1 text-xs text-ink">
          {labels.gold}: {gold}
        </span>
      </div>

      <div className="mt-4 space-y-4 text-sm text-ink/80">
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-3">
          <p className="font-semibold">{labels.emotion}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs"
              value={selectedPetId ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSelectedPetId(value || null);
              }}
            >
              <option value="">{labels.selectPet}</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  #{pet.id} {pet.phenotype_public?.Species ?? pet.phenotype.Species}
                </option>
              ))}
            </select>
            <span className="text-xs text-ink/60">
              {labels.cost}: {emotionPrice}
            </span>
            <button
              className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold"
              disabled={busy || !selectedPetId}
              onClick={() => selectedPetId && onRefreshEmotion(selectedPetId)}
            >
              {labels.refresh}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white/70 p-3">
          <p className="font-semibold">{labels.hatch}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs"
              value={selectedEggId ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSelectedEggId(value || null);
              }}
            >
              <option value="">{labels.selectEgg}</option>
              {incubating.map((egg) => (
                <option key={egg.id} value={egg.id}>
                  Egg #{egg.id}
                </option>
              ))}
            </select>
            <span className="text-xs text-ink/60">
              {labels.cost}: {hatchPrice}
            </span>
            <button
              className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold"
              disabled={busy || !selectedEggId}
              onClick={() => selectedEggId && onInstantHatch(selectedEggId)}
            >
              {labels.instant}
            </button>
          </div>
        </div>

        <div
          className={`rounded-2xl border border-ink/10 bg-white/70 p-3 ${
            adoptHighlight ? "adopt-highlight" : ""
          }`}
        >
          <p className="font-semibold">{labels.adopt}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink/60">
              {labels.cost}: {adoptPrice}
            </span>
            <span className="text-xs text-ink/60">
              {labels.cooldown}: {adoptCooldownMinutes}m
            </span>
            <span className="text-xs text-ink/60">
              {labels.status}: {adoptStatusText}
            </span>
            <button
              className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold"
              disabled={busy || !canAdopt}
              onClick={onAdoptEgg}
            >
              {labels.adoptAction}
            </button>
            {!canAdopt ? (
              <span className="text-xs text-ember">{labels.insufficientGold}</span>
            ) : null}
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-ink/10">
            <div
              className="h-2 rounded-full bg-amber-300 transition-[width] duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          {adoptError ? (
            <p className="mt-2 text-xs text-ember">{adoptError}</p>
          ) : null}
        </div>

        {error ? <p className="text-xs text-ember">{error}</p> : null}
      </div>
    </section>
  );
}
