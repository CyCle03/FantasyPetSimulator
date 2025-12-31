from __future__ import annotations

import argparse
import csv
import json
import random
from datetime import datetime
from pathlib import Path

from app.genetics.breeding import breed
from app.genetics.genome import random_genome
from app.genetics.phenotype import genome_to_phenotype
from app.genetics.rarity import rarity_profile


def main() -> None:
    parser = argparse.ArgumentParser(description="Simulate breeding and rarity distribution")
    parser.add_argument("--count", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument("--out", type=str, default=None)
    parser.add_argument("--parents", type=int, default=6)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    out_dir = Path(args.out or f"reports/run_{timestamp}")
    out_dir.mkdir(parents=True, exist_ok=True)

    parents = []
    for _ in range(args.parents):
        genome = random_genome(rng)
        phenotype = genome_to_phenotype(genome)
        parents.append({"genome": genome, "phenotype": phenotype})

    results = []
    for _ in range(args.count):
        parent_a = rng.choice(parents)
        parent_b = rng.choice(parents)
        child_genome, _ = breed(
            parent_a["genome"],
            parent_b["genome"],
            parent_a["phenotype"],
            parent_b["phenotype"],
            rng,
        )
        child_phenotype = genome_to_phenotype(child_genome)
        score, tier, tags = rarity_profile(child_phenotype)
        results.append(
            {
                "phenotype": child_phenotype,
                "rarity_score": score,
                "rarity_tier": tier,
                "rarity_tags": tags,
            }
        )
        parents.append({"genome": child_genome, "phenotype": child_phenotype})

    (out_dir / "pets.json").write_text(json.dumps(results, indent=2), encoding="utf-8")

    counts: dict[tuple[str, int], int] = {}
    for pet in results:
        key = (pet["rarity_tier"], pet["rarity_score"])
        counts[key] = counts.get(key, 0) + 1

    with (out_dir / "rarity.csv").open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["tier", "score", "count"])
        for (tier, score), count in sorted(counts.items()):
            writer.writerow([tier, score, count])

    print(f"Wrote reports to {out_dir}")


if __name__ == "__main__":
    main()
