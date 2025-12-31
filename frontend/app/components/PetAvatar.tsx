import { useMemo, useState } from "react";

import type { Pet } from "../lib/api";

const LAYERS = [
  "BodyType",
  "BaseColor",
  "Pattern",
  "EyeShape",
  "EyeColor",
  "Mouth",
  "Horn",
  "Wing",
  "Tail",
  "Accessory",
  "Aura",
  "Element"
];

const USE_ASSETS = process.env.NEXT_PUBLIC_USE_PART_ASSETS === "true";

function assetPath(locus: string, value: string) {
  return `/parts/${locus}/${value}.png`;
}

export default function PetAvatar({
  pet,
  size = 80,
  showBadge = true
}: {
  pet: Pet;
  size?: number;
  showBadge?: boolean;
}) {
  const shown = pet.phenotype_public ?? pet.phenotype;
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [hasLoadedAsset, setHasLoadedAsset] = useState(false);
  const maskWidth = Math.round(size * 0.5);
  const maskHeight = Math.round(size * 0.18);
  const tier = pet.rarity_tier;
  const ringSize = size < 120 ? 3 : 4;
  const glowBlur = size < 120 ? 10 : 14;
  const showMask = false;
  const badgeFont = size < 100 ? "text-[9px]" : "text-[10px]";
  const badgePad = size < 100 ? "px-1.5 py-0.5" : "px-2 py-0.5";
  const layers = useMemo(
    () =>
      LAYERS.map((locus) => ({
        locus,
        value: shown[locus] ?? "Unknown"
      })).filter((layer) => layer.value !== "Unknown"),
    [shown]
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white"
      style={{ width: size, height: size }}
    >
      {tier !== "Common" ? (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: getRarityGlowShadow(tier, glowBlur),
            border: `${ringSize}px solid ${getRarityColor(tier)}`
          }}
        />
      ) : null}
      {!USE_ASSETS || !hasLoadedAsset ? (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden>
          <defs>
            <linearGradient id={`grad-${pet.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="30" fill={`url(#grad-${pet.id})`} />
          <circle cx="30" cy="34" r="5" fill="#0f172a" />
          <circle cx="50" cy="34" r="5" fill={shown.EyeColor === "Void" ? "#111827" : "#1f2937"} />
          <path
            d="M28 52 C34 58, 46 58, 52 52"
            stroke="#1f2937"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {USE_ASSETS
        ? layers.map((layer) => {
            const src = assetPath(layer.locus, layer.value);
            if (failed.has(src)) return null;
            return (
              <img
                key={`${layer.locus}-${layer.value}`}
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
                onLoad={() => setHasLoadedAsset(true)}
                onError={() =>
                  setFailed((prev) => {
                    const next = new Set(prev);
                    next.add(src);
                    return next;
                  })
                }
              />
            );
          })
        : null}
      {showMask ? (
        <div
          className="absolute left-0 top-0"
          style={{
            width: maskWidth,
            height: maskHeight,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.2))"
          }}
        />
      ) : null}
      {showBadge ? (
        <div className="absolute right-1 top-1">
          <span
            className={`rounded-full ${badgePad} ${badgeFont} font-semibold ${getBadgeClass(tier)}`}
          >
            {tier}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function getBadgeClass(tier: string) {
  switch (tier) {
    case "Uncommon":
      return "bg-moss text-white";
    case "Rare":
      return "bg-sky text-white";
    case "Epic":
      return "bg-ember text-white";
    case "Legendary":
      return "bg-black text-white";
    default:
      return "bg-pearl text-ink";
  }
}

function getRarityColor(tier: string) {
  switch (tier) {
    case "Uncommon":
      return "#2f855a";
    case "Rare":
      return "#2563eb";
    case "Epic":
      return "#f97316";
    case "Legendary":
      return "#0f172a";
    default:
      return "#e2e8f0";
  }
}

function getRarityGlowShadow(tier: string, blur: number) {
  const color = getRarityColor(tier);
  return `0 0 ${blur}px ${color}88, 0 0 ${Math.round(blur * 1.5)}px ${color}55`;
}
