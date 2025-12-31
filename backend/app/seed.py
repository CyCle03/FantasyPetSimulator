from __future__ import annotations

import random

from sqlalchemy.orm import Session

from .genetics.genome import random_genome
from .genetics.phenotype import genome_to_phenotype
from .genetics.rarity import rarity_score, rarity_tier
from .models import Pet


def seed_db(db: Session) -> None:
    if db.query(Pet).count() > 0:
        return

    rng = random.Random()
    for _ in range(2):
        genome = random_genome(rng)
        phenotype = genome_to_phenotype(genome)
        score = rarity_score(phenotype)
        tier = rarity_tier(score)
        pet = Pet(
            genome_json=genome,
            phenotype_json=phenotype,
            rarity_score=score,
            rarity_tier=tier,
        )
        db.add(pet)

    db.commit()
