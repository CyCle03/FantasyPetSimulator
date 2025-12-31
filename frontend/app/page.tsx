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
  const [pets, setPets] = useState<Pet[]>([]);
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [rareReveal, setRareReveal] = useState<Pet | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingPetId, setListingPetId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const prevPetIds = useRef<Set<number>>(new Set());
  const marketEnabled = process.env.NEXT_PUBLIC_ENABLE_MARKET === "true";

  const refresh = async () => {
    const state = await getState();
    setPets(state.pets);
    setEggs(state.eggs);
    if (marketEnabled) {
      const market = await getListings();
      setListings(market);
    }
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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
            <h1 className="mt-2 text-3xl font-semibold">
              Collect, Breed, and Hatch
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/70">
              Genetics are calculated server-side. Each pet is defined by a layered
              genome, rendered here as SVG and descriptive traits.
            </p>
          </div>
          <button
            className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10"
            onClick={refresh}
          >
            Refresh
          </button>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">My Pets</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  selected={selected.includes(pet.id)}
                  onSelect={toggleSelect}
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
            />

            <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-md">
              <h3 className="text-lg font-semibold">Selected Details</h3>
              <div className="mt-3 space-y-3 text-sm text-ink/80">
                {selectedPets.length === 0 ? (
                  <p>Select two pets to compare phenotypes.</p>
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
                        <p>
                          Hidden:{" "}
                          {pet.hidden_loci && pet.hidden_loci.length
                            ? pet.hidden_loci.join(", ")
                            : "None"}
                        </p>
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
            <h2 className="text-2xl font-semibold">My Eggs</h2>
            <button
              className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/10"
              onClick={handleReset}
              disabled={busy}
            >
              Reset DB (dev)
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eggs.map((egg) => (
              <EggCard key={egg.id} egg={egg} now={now} onHatch={handleHatch} />
            ))}
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
