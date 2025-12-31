"use client";

import { useEffect, useMemo, useState } from "react";

import BreedPanel from "./components/BreedPanel";
import EggCard from "./components/EggCard";
import PetCard from "./components/PetCard";
import { breed, getState, hatch, reset, type Egg, type Pet } from "./lib/api";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const refresh = async () => {
    const state = await getState();
    setPets(state.pets);
    setEggs(state.eggs);
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5e6,_#f8f3e6_60%,_#f1e6d2_100%)] px-6 py-10">
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
                  selectedPets.map((pet) => (
                    <div key={pet.id} className="rounded-2xl border border-ink/10 p-3">
                      <p className="font-semibold">Pet #{pet.id}</p>
                      <p>Species: {pet.phenotype.Species}</p>
                      <p>Element: {pet.phenotype.Element}</p>
                      <p>Personality: {pet.phenotype.Personality}</p>
                    </div>
                  ))
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
      </div>
    </main>
  );
}
