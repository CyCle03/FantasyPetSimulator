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

export default function PetAvatar({ pet }: { pet: Pet }) {
  const shown = pet.phenotype_public ?? pet.phenotype;
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [hasLoadedAsset, setHasLoadedAsset] = useState(false);
  const layers = useMemo(
    () =>
      LAYERS.map((locus) => ({
        locus,
        value: shown[locus] ?? "Unknown"
      })).filter((layer) => layer.value !== "Unknown"),
    [shown]
  );

  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-ink/10 bg-white">
      {!USE_ASSETS || !hasLoadedAsset ? (
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
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
    </div>
  );
}
