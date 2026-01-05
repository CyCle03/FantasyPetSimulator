from __future__ import annotations

import random
from datetime import datetime

from sqlalchemy.orm import Session

from .genetics.emotions import pick_emotion
from .genetics.genome import choose_hidden_loci
from .genetics.genome import random_genome
from .genetics.phenotype import genome_to_phenotype
from .genetics.rarity import rarity_profile
from .models import Pet, Player


def seed_db(db: Session) -> None:
    if db.query(Pet).count() > 0:
        return

    if db.query(Player).count() == 0:
        db.add(Player(gold=20))

    rng = random.Random()
    for _ in range(2):
        genome = random_genome(rng)
        genome["Aura"] = ["None", "None"]
        phenotype = genome_to_phenotype(genome)
        score, tier, tags = rarity_profile(phenotype)
        hidden_loci = choose_hidden_loci(rng)
        emotion = pick_emotion(rng, phenotype.get("Personality", "Calm"))
        pet = Pet(
            genome_json=genome,
            phenotype_json=phenotype,
            rarity_score=score,
            rarity_tier=tier,
            rarity_tags_json=tags,
            hidden_loci_json=hidden_loci,
            emotion=emotion,
            emotion_updated_at=datetime.utcnow(),
            owner_name="LocalUser",
        )
        db.add(pet)

    db.commit()
