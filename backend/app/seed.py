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
    starter_distribution = [
        ("Common", 0.55),
        ("Uncommon", 0.35),
        ("Rare", 0.10),
    ]

    def pick_starter_tier() -> str:
        roll = rng.random()
        cumulative = 0.0
        for tier, weight in starter_distribution:
            cumulative += weight
            if roll <= cumulative:
                return tier
        return starter_distribution[-1][0]

    for _ in range(2):
        target_tier = pick_starter_tier()
        genome = None
        phenotype = None
        score = 0
        tier = "Common"
        tags = []
        for _attempt in range(200):
            candidate = random_genome(rng)
            candidate["Aura"] = ["None", "None"]
            candidate_pheno = genome_to_phenotype(candidate)
            cand_score, cand_tier, cand_tags = rarity_profile(candidate_pheno)
            if cand_tier == target_tier:
                genome = candidate
                phenotype = candidate_pheno
                score = cand_score
                tier = cand_tier
                tags = cand_tags
                break
        if genome is None or phenotype is None:
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
