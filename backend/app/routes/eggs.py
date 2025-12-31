from __future__ import annotations

import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..genetics.emotions import pick_emotion
from ..genetics.genome import choose_hidden_loci
from ..genetics.phenotype import genome_to_phenotype
from ..genetics.rarity import rarity_score, rarity_tier
from ..models import Egg, Pet
from ..schemas import EggOut, HatchIn

router = APIRouter()


def _create_pet_from_genome(db: Session, genome: dict) -> Pet:
    rng = random.Random()
    phenotype = genome_to_phenotype(genome)
    score = rarity_score(phenotype)
    tier = rarity_tier(score)
    hidden_loci = choose_hidden_loci(rng)
    emotion = pick_emotion(rng, phenotype.get("Personality", "Calm"))
    pet = Pet(
        genome_json=genome,
        phenotype_json=phenotype,
        rarity_score=score,
        rarity_tier=tier,
        hidden_loci_json=hidden_loci,
        emotion=emotion,
        emotion_updated_at=datetime.utcnow(),
        owner_name="LocalUser",
    )
    db.add(pet)
    db.flush()
    return pet


@router.post("/hatch", response_model=EggOut)
def hatch_egg(payload: HatchIn, db: Session = Depends(get_db)):
    egg = db.query(Egg).filter(Egg.id == payload.egg_id).first()
    if not egg:
        raise HTTPException(status_code=404, detail="Egg not found.")
    if egg.status != "Incubating":
        raise HTTPException(status_code=400, detail="Egg already hatched.")

    now = datetime.utcnow()
    if egg.hatch_at > now:
        raise HTTPException(status_code=400, detail="Egg is not ready yet.")

    pet = _create_pet_from_genome(db, egg.genome_json)
    egg.status = "Hatched"
    egg.hatched_pet_id = pet.id
    db.commit()

    return EggOut(
        id=egg.id,
        created_at=egg.created_at,
        hatch_at=egg.hatch_at,
        genome=egg.genome_json,
        status=egg.status,
        hatched_pet_id=egg.hatched_pet_id,
    )
