"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import BreedPanel from "./components/BreedPanel";
import EggCard from "./components/EggCard";
import MarketPanel from "./components/MarketPanel";
import PetAvatar from "./components/PetAvatar";
import PetCard from "./components/PetCard";
import ShopPanel from "./components/ShopPanel";
import {
  breed,
  buyListing,
  cancelListing,
  createListing,
  getListings,
  getState,
  hatch,
  hatchAll,
  instantHatch,
  refreshEmotion,
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
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [gold, setGold] = useState(0);
  const [visiblePets, setVisiblePets] = useState(8);
  const [visibleHatched, setVisibleHatched] = useState(6);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingPetId, setListingPetId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const prevPetIds = useRef<Set<number>>(new Set());
  const hasInitializedPets = useRef(false);
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
        ready: "Ready",
        view: "View",
        select: "Select",
        selected: "Selected"
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
      },
      petModal: {
        title: "Pet Preview",
        close: "Close",
        downloadImage: "Download PNG",
        downloadBundle: "Download JSON + Image"
      },
      shop: {
        title: "Pet Shop",
        gold: "Gold",
        emotion: "Refresh Emotion",
        hatch: "Instant Hatch",
        selectPet: "Choose pet",
        selectEgg: "Choose egg",
        refresh: "Refresh",
        instant: "Hatch now",
        cost: "Cost"
      },
      ui: {
        showMore: "Show more",
        total: "total",
        rareHatch: "Rare Hatch",
        hatchAll: "Hatch all ready"
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
        ready: "가능",
        view: "보기",
        select: "선택",
        selected: "선택됨"
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
      },
      petModal: {
        title: "펫 미리보기",
        close: "닫기",
        downloadImage: "PNG 다운로드",
        downloadBundle: "JSON + 이미지 다운로드"
      },
      shop: {
        title: "펫 상점",
        gold: "골드",
        emotion: "감정 리롤",
        hatch: "즉시 부화",
        selectPet: "펫 선택",
        selectEgg: "알 선택",
        refresh: "리롤",
        instant: "지금 부화",
        cost: "가격"
      },
      ui: {
        showMore: "더 보기",
        total: "총",
        rareHatch: "희귀 부화",
        hatchAll: "준비된 알 모두 부화"
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
    setGold(state.gold ?? 0);
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
    if (!hasInitializedPets.current) {
      prevPetIds.current = new Set(pets.map((pet) => pet.id));
      hasInitializedPets.current = true;
      return;
    }
    const rareTiers = new Set(["Rare", "Epic", "Legendary"]);
    const newPet = pets.find(
      (pet) => !prevPetIds.current.has(pet.id) && rareTiers.has(pet.rarity_tier)
    );
    prevPetIds.current = new Set(pets.map((pet) => pet.id));
    if (newPet) {
      setRareReveal(newPet);
      playRareSound();
    }
  }, [pets]);

  useEffect(() => {
    if (!rareReveal) return;
    const timer = setTimeout(() => setRareReveal(null), 2400);
    return () => clearTimeout(timer);
  }, [rareReveal]);

  const selectedPets = useMemo(
    () => pets.filter((pet) => selected.includes(pet.id)),
    [pets, selected]
  );
  const incubatingEggs = useMemo(
    () => eggs.filter((egg) => egg.status === "Incubating"),
    [eggs]
  );
  const readyEggs = useMemo(
    () => incubatingEggs.filter((egg) => new Date(egg.hatch_at).getTime() <= now),
    [incubatingEggs, now]
  );
  const hatchedEggs = useMemo(
    () => eggs.filter((egg) => egg.status !== "Incubating"),
    [eggs]
  );
  const petsToShow = useMemo(() => pets.slice(0, visiblePets), [pets, visiblePets]);
  const hatchedToShow = useMemo(
    () => hatchedEggs.slice(0, visibleHatched),
    [hatchedEggs, visibleHatched]
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

  const handleHatchAll = async () => {
    if (readyEggs.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await hatchAll();
      await refresh();
    } catch (err: any) {
      setError(err.message || "Hatch all failed.");
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

  const handleRefreshEmotion = async (petId: number) => {
    setBusy(true);
    setError(null);
    try {
      await refreshEmotion(petId);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to refresh emotion.");
    } finally {
      setBusy(false);
    }
  };

  const handleInstantHatch = async (eggId: number) => {
    setBusy(true);
    setError(null);
    try {
      await instantHatch(eggId);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to hatch instantly.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!activePet) return;
    const dataUrl = await composePetImage(activePet, 512);
    downloadDataUrl(dataUrl, `pet-${activePet.id}.png`);
  };

  const handleDownloadBundle = async () => {
    if (!activePet) return;
    const dataUrl = await composePetImage(activePet, 512);
    const payload = {
      pet: activePet,
      image: dataUrl,
      generated_at: new Date().toISOString()
    };
    downloadJson(payload, `pet-${activePet.id}.json`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff5e6,_#f8f3e6_60%,_#f1e6d2_100%)] px-6 py-10">
      <div className="pointer-events-none absolute -top-20 right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.35),_transparent_60%)] blur-2xl float-slow" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(147,197,253,0.35),_transparent_60%)] blur-2xl float-slow" />
      {activePet ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{text.petModal.title}</h2>
              <button
                className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink"
                onClick={() => setActivePet(null)}
              >
                {text.petModal.close}
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4 text-sm text-ink/80">
              <div className="rounded-3xl border border-ink/10 bg-parchment p-4">
                <PetAvatar pet={activePet} size={220} />
              </div>
              <div className="w-full rounded-2xl border border-ink/10 bg-white/80 p-4">
                <p className="font-semibold">Pet #{activePet.id}</p>
                <p>Species: {(activePet.phenotype_public ?? activePet.phenotype).Species}</p>
                <p>Element: {(activePet.phenotype_public ?? activePet.phenotype).Element}</p>
                <p>Personality: {(activePet.phenotype_public ?? activePet.phenotype).Personality}</p>
                <p>Emotion: {activePet.emotion ?? "Calm"}</p>
                <p>Rarity: {activePet.rarity_tier}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/10"
                  onClick={handleDownloadImage}
                >
                  {text.petModal.downloadImage}
                </button>
                <button
                  className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/10"
                  onClick={handleDownloadBundle}
                >
                  {text.petModal.downloadBundle}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {rareReveal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="rare-reveal rare-shimmer w-full max-w-md rounded-3xl p-6 text-center text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em]">{text.ui.rareHatch}</span>
              <button
                className="rounded-full border border-white/60 px-3 py-1 text-xs font-semibold"
                onClick={() => setRareReveal(null)}
              >
                ✕
              </button>
            </div>
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
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs text-ink">
              {text.shop.gold}: {gold}
            </span>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{text.myPets}</h2>
              <span className="text-xs text-ink/60">
                {text.ui.total} {pets.length}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {petsToShow.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  selected={selected.includes(pet.id)}
                  onSelect={toggleSelect}
                  now={now}
                  labels={text.petCard}
                  onView={setActivePet}
                />
              ))}
            </div>
            {pets.length > visiblePets ? (
              <button
                className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/10"
                onClick={() => setVisiblePets((count) => count + 8)}
              >
                {text.ui.showMore}
              </button>
            ) : null}
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

            <ShopPanel
              pets={pets}
              eggs={eggs}
              gold={gold}
              emotionPrice={10}
              hatchPrice={15}
              onRefreshEmotion={handleRefreshEmotion}
              onInstantHatch={handleInstantHatch}
              busy={busy}
              error={error}
              labels={text.shop}
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{text.myEggs}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleHatchAll}
                disabled={busy || readyEggs.length === 0}
              >
                {text.ui.hatchAll} ({readyEggs.length})
              </button>
              <button
                className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10"
                onClick={handleReset}
                disabled={busy}
              >
                {text.resetDb}
              </button>
            </div>
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
              hatchedToShow.map((egg) => (
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
          {hatchedEggs.length > visibleHatched ? (
            <button
              className="mt-4 rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/10"
              onClick={() => setVisibleHatched((count) => count + 6)}
            >
              {text.ui.showMore}
            </button>
          ) : null}
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

function tierStyles(tier: string) {
  switch (tier) {
    case "Uncommon":
      return { ring: "#2f855a", glow: "rgba(47,133,90,0.35)" };
    case "Rare":
      return { ring: "#2563eb", glow: "rgba(37,99,235,0.35)" };
    case "Epic":
      return { ring: "#f97316", glow: "rgba(249,115,22,0.4)" };
    case "Legendary":
      return { ring: "#0f172a", glow: "rgba(15,23,42,0.5)" };
    default:
      return { ring: "#e2e8f0", glow: "rgba(0,0,0,0)" };
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

async function composePetImage(pet: Pet, size: number): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const shown = pet.phenotype_public ?? pet.phenotype;
  const tier = pet.rarity_tier;
  const style = tierStyles(tier);
  if (USE_ASSETS) {
    for (const locus of LAYERS) {
      const value = shown[locus];
      if (!value || value === "Unknown") continue;
      const src = assetPath(locus, value);
      try {
        const img = await loadImage(src);
        context.drawImage(img, 0, 0, size, size);
      } catch {
        continue;
      }
    }
  } else {
    context.fillStyle = "#e2e8f0";
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.375, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#0f172a";
    context.beginPath();
    context.arc(size * 0.375, size * 0.45, size * 0.05, 0, Math.PI * 2);
    context.arc(size * 0.625, size * 0.45, size * 0.05, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#1f2937";
    context.lineWidth = size * 0.04;
    context.beginPath();
    context.moveTo(size * 0.35, size * 0.65);
    context.quadraticCurveTo(size * 0.5, size * 0.72, size * 0.65, size * 0.65);
    context.stroke();
  }

  if (tier !== "Common") {
    context.save();
    context.strokeStyle = style.ring;
    context.lineWidth = Math.max(2, Math.round(size * 0.04));
    context.shadowColor = style.glow;
    context.shadowBlur = Math.round(size * 0.08);
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  context.save();
  context.font = `${Math.round(size * 0.08)}px \"DM Sans\", sans-serif`;
  context.textAlign = "right";
  context.textBaseline = "top";
  const badgePadding = Math.round(size * 0.03);
  const badgeText = tier;
  const metrics = context.measureText(badgeText);
  const badgeWidth = metrics.width + badgePadding * 2;
  const badgeHeight = Math.round(size * 0.12);
  context.fillStyle = style.ring;
  drawRoundedRect(
    context,
    size - badgeWidth - badgePadding,
    badgePadding,
    badgeWidth,
    badgeHeight,
    badgeHeight / 2
  );
  context.fill();
  context.fillStyle = "#ffffff";
  context.fillText(badgeText, size - badgePadding * 1.5, badgePadding + badgeHeight * 0.18);
  context.restore();

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function downloadJson(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}
