from __future__ import annotations

import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db, init_db
from ..seed import seed_db
from ..genetics.phenotype import genome_to_phenotype
from ..genetics.rarity import rarity_score, rarity_tier
from ..models import Egg, Pet
from ..schemas import EggOut, PetOut, ResetOut, StateOut

router = APIRouter()


def _create_pet_from_genome(db: Session, genome: dict) -> Pet:
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
    db.flush()
    return pet


@router.get("/state", response_model=StateOut)
def get_state(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    eggs_ready = (
        db.query(Egg)
        .filter(Egg.status == "Incubating", Egg.hatch_at <= now)
        .all()
    )

    for egg in eggs_ready:
        pet = _create_pet_from_genome(db, egg.genome_json)
        egg.status = "Hatched"
        egg.hatched_pet_id = pet.id

    db.commit()

    pets = db.query(Pet).order_by(Pet.id).all()
    eggs = db.query(Egg).order_by(Egg.id).all()

    return StateOut(
        pets=[
            PetOut(
                id=pet.id,
                created_at=pet.created_at,
                genome=pet.genome_json,
                phenotype=pet.phenotype_json,
                rarity_score=pet.rarity_score,
                rarity_tier=pet.rarity_tier,
                breeding_locked_until=pet.breeding_locked_until,
            )
            for pet in pets
        ],
        eggs=[
            EggOut(
                id=egg.id,
                created_at=egg.created_at,
                hatch_at=egg.hatch_at,
                genome=egg.genome_json,
                status=egg.status,
                hatched_pet_id=egg.hatched_pet_id,
            )
            for egg in eggs
        ],
    )


@router.post("/reset", response_model=ResetOut)
def reset_db(db: Session = Depends(get_db)):
    env = os.getenv("ENV", "development")
    if env not in {"development", "dev"}:
        raise HTTPException(status_code=403, detail="Reset is disabled in this environment.")

    db.query(Egg).delete()
    db.query(Pet).delete()
    db.commit()

    init_db()
    seed_db(db)
    return ResetOut(ok=True)
