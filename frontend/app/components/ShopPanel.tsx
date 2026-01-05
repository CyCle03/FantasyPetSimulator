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
  premiumPrice,
  premiumCooldownMinutes,
  premiumCooldownSeconds,
  premiumRemainingSeconds,
  premiumStatusText,
  premiumHighlight,
  sellPrices,
  onRefreshEmotion,
  onInstantHatch,
  onAdoptEgg,
  onAdoptPremiumEgg,
  onSellPet,
  busy,
  error,
  adoptError,
  premiumAdoptError,
  sellError,
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
  premiumPrice: number;
  premiumCooldownMinutes: number;
  premiumCooldownSeconds: number;
  premiumRemainingSeconds: number;
  premiumStatusText: string;
  premiumHighlight: boolean;
  sellPrices: Record<string, number>;
  onRefreshEmotion: (petId: number) => void;
  onInstantHatch: (eggId: number) => void;
  onAdoptEgg: () => void;
  onAdoptPremiumEgg: () => void;
  onSellPet: (petId: number) => void;
  busy: boolean;
  error: string | null;
  adoptError: string | null;
  premiumAdoptError: string | null;
  sellError: string | null;
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
    readyBadge: string;
    moodBadge: string;
    hatchBadge: string;
    adoptBadge: string;
    sellBadge: string;
    sell: string;
    sellAction: string;
    payout: string;
    selectSellPet: string;
    sellHint: string;
    sellConfirmTitle: string;
    sellConfirmBody: string;
    cancel: string;
    confirm: string;
    premium: string;
    premiumBadge: string;
    premiumAction: string;
  };
}) {
  const incubating = eggs.filter((egg) => egg.status === "Incubating");
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedEggId, setSelectedEggId] = useState<number | null>(null);
  const [selectedSellPetId, setSelectedSellPetId] = useState<number | null>(null);
  const [confirmSellPetId, setConfirmSellPetId] = useState<number | null>(null);
  const hasGold = gold >= adoptPrice;
  const canAdopt = hasGold && adoptRemainingSeconds === 0;
  const hasPremiumGold = gold >= premiumPrice;
  const canAdoptPremium = hasPremiumGold && premiumRemainingSeconds === 0;
  const totalCooldown = Math.max(1, adoptCooldownSeconds);
  const progress = Math.min(1, 1 - adoptRemainingSeconds / totalCooldown);
  const premiumTotalCooldown = Math.max(1, premiumCooldownSeconds);
  const premiumProgress = Math.min(1, 1 - premiumRemainingSeconds / premiumTotalCooldown);
  const sellPet = pets.find((pet) => pet.id === selectedSellPetId);
  const sellPrice = sellPet ? sellPrices[sellPet.rarity_tier] ?? 0 : 0;
  const confirmPet = pets.find((pet) => pet.id === confirmSellPetId);
  const confirmPrice = confirmPet ? sellPrices[confirmPet.rarity_tier] ?? 0 : 0;

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
          <div className="flex items-center gap-2">
            <p className="font-semibold">{labels.emotion}</p>
            <span className="rounded-full bg-sky px-2 py-0.5 text-[10px] font-semibold text-white">
              {labels.moodBadge}
            </span>
          </div>
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
          <div className="flex items-center gap-2">
            <p className="font-semibold">{labels.hatch}</p>
            <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold text-white">
              {labels.hatchBadge}
            </span>
          </div>
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
          <div className="flex items-center gap-2">
            <p className="font-semibold">{labels.adopt}</p>
            <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-semibold text-ink">
              {labels.adoptBadge}
            </span>
            {adoptRemainingSeconds === 0 ? (
              <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold text-white">
                {labels.readyBadge}
              </span>
            ) : null}
          </div>
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
              className={`rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold ${
                adoptRemainingSeconds === 0 ? "adopt-ready" : ""
              }`}
              disabled={busy || !canAdopt}
              onClick={onAdoptEgg}
            >
              {labels.adoptAction}
            </button>
            {!hasGold ? (
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

        <div
          className={`rounded-2xl border border-ink/10 bg-white/70 p-3 ${
            premiumHighlight ? "adopt-highlight" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <p className="font-semibold">{labels.premium}</p>
            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
              {labels.premiumBadge}
            </span>
            {premiumRemainingSeconds === 0 ? (
              <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold text-white">
                {labels.readyBadge}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink/60">
              {labels.cost}: {premiumPrice}
            </span>
            <span className="text-xs text-ink/60">
              {labels.cooldown}: {premiumCooldownMinutes}m
            </span>
            <span className="text-xs text-ink/60">
              {labels.status}: {premiumStatusText}
            </span>
            <button
              className={`rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold ${
                premiumRemainingSeconds === 0 ? "adopt-ready" : ""
              }`}
              disabled={busy || !canAdoptPremium}
              onClick={onAdoptPremiumEgg}
            >
              {labels.premiumAction}
            </button>
            {!hasPremiumGold ? (
              <span className="text-xs text-ember">{labels.insufficientGold}</span>
            ) : null}
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-ink/10">
            <div
              className="h-2 rounded-full bg-ink/80 transition-[width] duration-300"
              style={{ width: `${Math.round(premiumProgress * 100)}%` }}
            />
          </div>
          {premiumAdoptError ? (
            <p className="mt-2 text-xs text-ember">{premiumAdoptError}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white/70 p-3">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{labels.sell}</p>
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
              {labels.sellBadge}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs"
              value={selectedSellPetId ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSelectedSellPetId(value || null);
              }}
            >
              <option value="">{labels.selectSellPet}</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  #{pet.id} {pet.phenotype_public?.Species ?? pet.phenotype.Species} (
                  {pet.rarity_tier})
                </option>
              ))}
            </select>
            <span className="text-xs text-ink/60">
              {labels.payout}: {sellPrice}
            </span>
            <button
              className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold"
              disabled={busy || !selectedSellPetId}
              onClick={() => selectedSellPetId && setConfirmSellPetId(selectedSellPetId)}
            >
              {labels.sellAction}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/60">{labels.sellHint}</p>
          {sellError ? <p className="mt-2 text-xs text-ember">{sellError}</p> : null}
        </div>

        {error ? <p className="text-xs text-ember">{error}</p> : null}
      </div>

      {confirmPet ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-5 shadow-lg">
            <h4 className="text-base font-semibold">{labels.sellConfirmTitle}</h4>
            <p className="mt-2 text-sm text-ink/70">
              {labels.sellConfirmBody
                .replace("{id}", String(confirmPet.id))
                .replace("{tier}", confirmPet.rarity_tier)
                .replace("{payout}", String(confirmPrice))}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold"
                onClick={() => setConfirmSellPetId(null)}
              >
                {labels.cancel}
              </button>
              <button
                className="rounded-full border border-ember bg-ember px-3 py-1 text-xs font-semibold text-white"
                onClick={() => {
                  if (!confirmSellPetId) return;
                  onSellPet(confirmSellPetId);
                  setConfirmSellPetId(null);
                }}
              >
                {labels.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
