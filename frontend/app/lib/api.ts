export type Pet = {
  id: number;
  created_at: string;
  genome: Record<string, string[]>;
  phenotype: Record<string, string>;
  phenotype_public?: Record<string, string>;
  rarity_score: number;
  rarity_tier: string;
  breeding_locked_until: string | null;
  hidden_loci?: string[];
  emotion?: string;
};

export type Egg = {
  id: number;
  created_at: string;
  hatch_at: string;
  genome: Record<string, string[]>;
  status: string;
  hatched_pet_id: number | null;
};

export type State = {
  pets: Pet[];
  eggs: Egg[];
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed.");
  }

  return res.json() as Promise<T>;
}

export function getState(): Promise<State> {
  return request<State>("/state");
}

export function breed(parentAId: number, parentBId: number): Promise<Egg> {
  return request<Egg>("/breed", {
    method: "POST",
    body: JSON.stringify({ parentAId, parentBId })
  });
}

export function hatch(eggId: number): Promise<Egg> {
  return request<Egg>("/hatch", {
    method: "POST",
    body: JSON.stringify({ eggId })
  });
}

export function reset(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/reset", {
    method: "POST"
  });
}
