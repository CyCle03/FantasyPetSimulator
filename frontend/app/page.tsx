"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import BreedPanel from "./components/BreedPanel";
import EggCard from "./components/EggCard";
import MarketPanel from "./components/MarketPanel";
import PetCard from "./components/PetCard";
import {
  breed,
  buyListing,
  cancelListing,
  createListing,
  getListings,
  getState,
  hatch,
  reset,
  type Egg,
  type Listing,
  type Pet
} from "./lib/api";

export default function Home() {
  const [lang, setLang] = useState<"en" | "ko">("en");
  const [pets, setPets] = useState<Pet[]>([]);
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [timeOffsetMs, setTimeOffsetMs] = useState(0);
  const [rareReveal, setRareReveal] = useState<Pet | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingPetId, setListingPetId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const prevPetIds = useRef<Set<number>>(new Set());
  const marketEnabled = process.env.NEXT_PUBLIC_ENABLE_MARKET === "true";

  const copy = {
    en: {
      title: "Collect, Breed, and Hatch",
      subtitle:
        "Genetics are calculated server-side. Each pet is defined by a layered genome, rendered here as SVG and descriptive traits.",
      refresh: "Refresh",
      myPets: "My Pets",
      myEggs: "My Eggs",
      hatchedEggs: "Hatched Eggs",
      resetDb: "Reset DB (dev)",
      selectedTitle: "Selected Details",
      selectedEmpty: "Select two pets to compare phenotypes.",
      breedPanel: {
        title: "Breeding Chamber",
        description:
          "Combine two pets to create a new egg. Cooldown applies after breeding.",
        selectionPlaceholder: "Pick two pets",
        breed: "Breed",
        breeding: "Breeding...",
        availablePets: "Available pets"
      },
      petCard: {
        body: "Body",
        pattern: "Pattern",
        aura: "Aura",
        emotion: "Emotion",
        breeding: "Breeding",
        ready: "Ready"
      },
      eggCard: {
        ready: "Ready",
        incubating: "Incubating",
        hatched: "Hatched",
        timeLeft: "Time left",
        speciesSeed: "Species seed",
        hatch: "Hatch"
      },
      market: {
        title: "Pet Market",
        disabled:
          "Market is disabled. Set `ENABLE_MARKET=true` on the backend and `NEXT_PUBLIC_ENABLE_MARKET=true` on the frontend to enable trading.",
        description: "List a pet for sale or buy from the market.",
        choosePet: "Choose pet",
        price: "Price",
        list: "List for sale",
        listing: "Listing",
        pet: "Pet",
        seller: "Seller",
        buy: "Buy",
        cancel: "Cancel",
        empty: "No active listings."
      }
    },
    ko: {
      title: "수집하고, 교배하고, 부화하세요",
      subtitle:
        "유전 계산은 서버에서 수행됩니다. 각 펫은 레이어드 유전자로 정의되며 SVG와 특성 텍스트로 표시됩니다.",
      refresh: "새로고침",
      myPets: "내 펫",
      myEggs: "내 알",
      hatchedEggs: "부화 완료 알",
      resetDb: "DB 초기화 (dev)",
      selectedTitle: "선택 상세",
      selectedEmpty: "펫 두 마리를 선택해 phenotype을 비교하세요.",
      breedPanel: {
        title: "교배실",
        description: "두 펫을 합쳐 새로운 알을 만듭니다. 교배 후 쿨타임이 적용됩니다.",
        selectionPlaceholder: "펫 두 마리를 선택하세요",
        breed: "교배",
        breeding: "교배 중...",
        availablePets: "보유 펫"
      },
      petCard: {
        body: "몸체",
        pattern: "패턴",
        aura: "오라",
        emotion: "감정",
        breeding: "교배",
        ready: "가능"
      },
      eggCard: {
        ready: "준비됨",
        incubating: "부화 중",
        hatched: "부화 완료",
        timeLeft: "남은 시간",
        speciesSeed: "종족 시드",
        hatch: "부화"
      },
      market: {
        title: "펫 마켓",
        disabled:
          "마켓이 비활성화되어 있습니다. 백엔드에 `ENABLE_MARKET=true`, 프론트에 `NEXT_PUBLIC_ENABLE_MARKET=true`를 설정하세요.",
        description: "펫을 판매 등록하거나 마켓에서 구매하세요.",
        choosePet: "펫 선택",
        price: "가격",
        list: "판매 등록",
        listing: "등록",
        pet: "펫",
        seller: "판매자",
        buy: "구매",
        cancel: "취소",
        empty: "활성화된 등록이 없습니다."
      }
    }
  } as const;

  const text = copy[lang];

  const refresh = async () => {
    const state = await getState();
    setPets(state.pets);
    setEggs(state.eggs);
    const serverTime = new Date(state.server_time).getTime();
    setTimeOffsetMs(serverTime - Date.now());
    if (marketEnabled) {
      const market = await getListings();
      setListings(market);
    }
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + timeOffsetMs), 1000);
    return () => clearInterval(timer);
  }, [timeOffsetMs]);

  useEffect(() => {
    if (pets.length === 0) return;
    const rareTiers = new Set(["Rare", "Epic", "Legendary"]);
    const newPet = pets.find(
      (pet) => !prevPetIds.current.has(pet.id) && rareTiers.has(pet.rarity_tier)
    );
    prevPetIds.current = new Set(pets.map((pet) => pet.id));
    if (newPet) {
      setRareReveal(newPet);
      playRareSound();
      const timer = setTimeout(() => setRareReveal(null), 2400);
      return () => clearTimeout(timer);
    }
  }, [pets]);

  const selectedPets = useMemo(
    () => pets.filter((pet) => selected.includes(pet.id)),
    [pets, selected]
  );
  const incubatingEggs = useMemo(
    () => eggs.filter((egg) => egg.status === "Incubating"),
    [eggs]
  );
  const hatchedEggs = useMemo(
    () => eggs.filter((egg) => egg.status !== "Incubating"),
    [eggs]
  );

  const toggleSelect = (id: number) => {
    setError(null);
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleBreed = async () => {
    if (selected.length !== 2) return;
    setBusy(true);
    setError(null);
    try {
      await breed(selected[0], selected[1]);
      setSelected([]);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Breeding failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleHatch = async (eggId: number) => {
    setBusy(true);
    setError(null);
    try {
      await hatch(eggId);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Hatch failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    setError(null);
    try {
      await reset();
      await refresh();
    } catch (err: any) {
      setError(err.message || "Reset failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateListing = async () => {
    if (!listingPetId) return;
    const priceValue = Number(listingPrice);
    if (!priceValue || priceValue <= 0) {
      setError("Enter a valid price.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createListing(listingPetId, priceValue);
      setListingPetId(null);
      setListingPrice("");
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to list pet.");
    } finally {
      setBusy(false);
    }
  };

  const handleBuyListing = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      await buyListing(id);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to buy listing.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelListing = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      await cancelListing(id);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to cancel listing.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5e6,_#f8f3e6_60%,_#f1e6d2_100%)] px-6 py-10">
      {rareReveal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="rare-reveal rare-shimmer w-full max-w-md rounded-3xl p-6 text-center text-white shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em]">Rare Hatch</p>
            <h2 className="mt-2 text-3xl font-semibold">
              {(rareReveal.phenotype_public ?? rareReveal.phenotype).Species} {rareReveal.rarity_tier}
            </h2>
            <p className="mt-2 text-sm text-white/90">
              Aura: {(rareReveal.phenotype_public ?? rareReveal.phenotype).Aura} · Eye: {(rareReveal.phenotype_public ?? rareReveal.phenotype).EyeColor}
            </p>
            <div className="mt-4 text-xs text-white/80">
              A new legend joins your collection.
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ink/50">
              SD Fantasy Pet Lab
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{text.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/70">{text.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="rounded-full border border-ink/20 bg-white px-3 py-2 text-sm"
              value={lang}
              onChange={(event) => setLang(event.target.value as "en" | "ko")}
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
            <button
              className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10"
              onClick={refresh}
            >
              {text.refresh}
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{text.myPets}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  selected={selected.includes(pet.id)}
                  onSelect={toggleSelect}
                  now={now}
                  labels={text.petCard}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <BreedPanel
              pets={pets}
              selected={selected}
              onBreed={handleBreed}
              error={error}
              busy={busy}
              labels={text.breedPanel}
            />

            <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-md">
              <h3 className="text-lg font-semibold">{text.selectedTitle}</h3>
              <div className="mt-3 space-y-3 text-sm text-ink/80">
                {selectedPets.length === 0 ? (
                  <p>{text.selectedEmpty}</p>
                ) : (
                  selectedPets.map((pet) => {
                    const shown = pet.phenotype_public ?? pet.phenotype;
                    return (
                      <div key={pet.id} className="rounded-2xl border border-ink/10 p-3">
                        <p className="font-semibold">Pet #{pet.id}</p>
                        <p>Species: {shown.Species}</p>
                        <p>Element: {shown.Element}</p>
                        <p>Personality: {shown.Personality}</p>
                        <p>Emotion: {pet.emotion ?? "Calm"}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{text.myEggs}</h2>
            <button
              className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10"
              onClick={handleReset}
              disabled={busy}
            >
              {text.resetDb}
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incubatingEggs.map((egg) => (
              <EggCard
                key={egg.id}
                egg={egg}
                now={now}
                onHatch={handleHatch}
                labels={text.eggCard}
              />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{text.hatchedEggs}</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hatchedEggs.length === 0 ? (
              <p className="text-sm text-ink/60">
                {lang === "ko" ? "부화 완료 알이 없습니다." : "No hatched eggs yet."}
              </p>
            ) : (
              hatchedEggs.map((egg) => (
                <EggCard
                  key={egg.id}
                  egg={egg}
                  now={now}
                  onHatch={handleHatch}
                  labels={text.eggCard}
                />
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <MarketPanel
            pets={pets}
            listings={listings}
            enabled={marketEnabled}
            selectedPetId={listingPetId}
            price={listingPrice}
            onSelectPet={(id) => setListingPetId(id)}
            onPriceChange={setListingPrice}
            onCreate={handleCreateListing}
            onBuy={handleBuyListing}
            onCancel={handleCancelListing}
            busy={busy}
            error={error}
            labels={text.market}
          />
        </section>
      </div>
    </main>
  );
}

function playRareSound() {
  try {
    const AudioContextRef =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextRef) return;
    const context = new AudioContextRef();
    const now = context.currentTime;

    const lead = context.createOscillator();
    const leadGain = context.createGain();
    lead.type = "triangle";
    lead.frequency.setValueAtTime(523.25, now);
    lead.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
    leadGain.gain.setValueAtTime(0.001, now);
    leadGain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    const bell = context.createOscillator();
    const bellGain = context.createGain();
    bell.type = "sine";
    bell.frequency.setValueAtTime(1046.5, now + 0.05);
    bellGain.gain.setValueAtTime(0.001, now + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.2, now + 0.1);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    lead.connect(leadGain).connect(context.destination);
    bell.connect(bellGain).connect(context.destination);
    lead.start(now);
    bell.start(now + 0.05);
    lead.stop(now + 0.8);
    bell.stop(now + 1.0);
  } catch {
    // Audio may be blocked by browser gesture policies.
  }
}
