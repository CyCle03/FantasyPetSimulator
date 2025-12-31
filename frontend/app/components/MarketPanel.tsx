import type { Listing, Pet } from "../lib/api";

export default function MarketPanel({
  pets,
  listings,
  enabled,
  selectedPetId,
  price,
  onSelectPet,
  onPriceChange,
  onCreate,
  onBuy,
  onCancel,
  busy,
  error,
  labels
}: {
  pets: Pet[];
  listings: Listing[];
  enabled: boolean;
  selectedPetId: number | null;
  price: string;
  onSelectPet: (id: number) => void;
  onPriceChange: (value: string) => void;
  onCreate: () => void;
  onBuy: (id: number) => void;
  onCancel: (id: number) => void;
  busy: boolean;
  error: string | null;
  labels: {
    title: string;
    disabled: string;
    description: string;
    choosePet: string;
    price: string;
    list: string;
    listing: string;
    pet: string;
    seller: string;
    buy: string;
    cancel: string;
    empty: string;
  };
}) {
  if (!enabled) {
    return (
      <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-md">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="mt-2 text-sm text-ink/70">{labels.disabled}</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-md">
      <h2 className="text-xl font-semibold">{labels.title}</h2>
      <p className="mt-1 text-sm text-ink/70">{labels.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm"
          value={selectedPetId ?? ""}
          onChange={(event) => onSelectPet(Number(event.target.value))}
        >
          <option value="" disabled>
            {labels.choosePet}
          </option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              #{pet.id} {pet.phenotype_public?.Species ?? pet.phenotype.Species} ({pet.rarity_tier})
            </option>
          ))}
        </select>

        <input
          className="w-28 rounded-full border border-ink/20 bg-white px-4 py-2 text-sm"
          placeholder={labels.price}
          value={price}
          onChange={(event) => onPriceChange(event.target.value)}
        />

        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            selectedPetId && price && !busy
              ? "bg-ink text-white hover:bg-ink/90"
              : "bg-ink/20 text-ink/40"
          }`}
          disabled={!selectedPetId || !price || busy}
          onClick={onCreate}
        >
          {busy ? labels.listing : labels.list}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {listings.length === 0 ? (
          <p className="text-sm text-ink/60">{labels.empty}</p>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-2xl border border-ink/10 bg-white/70 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{labels.listing} #{listing.id}</p>
                  <p className="text-xs text-ink/60">{labels.pet} #{listing.pet_id}</p>
                </div>
                <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">
                  {listing.price} Gold
                </span>
              </div>
              <p className="mt-2 text-xs text-ink/70">
                {labels.seller}: {listing.seller_name}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-ink/10"
                  onClick={() => onBuy(listing.id)}
                  disabled={busy}
                >
                  {labels.buy}
                </button>
                <button
                  className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-ink/10"
                  onClick={() => onCancel(listing.id)}
                  disabled={busy}
                >
                  {labels.cancel}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
