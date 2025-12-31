from __future__ import annotations

import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..genetics.breeding import breed
from ..models import Breeding, Egg, Pet
from ..schemas import BreedIn, EggOut

router = APIRouter()

BREEDING_COOLDOWN = timedelta(minutes=10)
EGG_HATCH_SECONDS = 60


def _assert_available(pet: Pet) -> None:
    if pet.breeding_locked_until and pet.breeding_locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail=f"Pet {pet.id} is resting until {pet.breeding_locked_until}.",
        )


@router.post("/breed", response_model=EggOut)
def breed_pets(payload: BreedIn, db: Session = Depends(get_db)):
    if payload.parent_a_id == payload.parent_b_id:
        raise HTTPException(status_code=400, detail="Choose two different pets.")

    parent_a = db.query(Pet).filter(Pet.id == payload.parent_a_id).first()
    parent_b = db.query(Pet).filter(Pet.id == payload.parent_b_id).first()
    if not parent_a or not parent_b:
        raise HTTPException(status_code=404, detail="One or both pets not found.")

    _assert_available(parent_a)
    _assert_available(parent_b)

    rng = random.Random()
    child_genome, _ = breed(
        parent_a.genome_json,
        parent_b.genome_json,
        parent_a.phenotype_json["Species"],
        parent_b.phenotype_json["Species"],
        rng,
    )

    now = datetime.utcnow()
    egg = Egg(
        hatch_at=now + timedelta(seconds=EGG_HATCH_SECONDS),
        genome_json=child_genome,
        status="Incubating",
    )
    db.add(egg)
    db.flush()

    breeding = Breeding(
        parent_a_id=parent_a.id,
        parent_b_id=parent_b.id,
        egg_id=egg.id,
        status="Created",
    )
    db.add(breeding)

    lock_until = now + BREEDING_COOLDOWN
    parent_a.breeding_locked_until = lock_until
    parent_b.breeding_locked_until = lock_until

    db.commit()

    return EggOut(
        id=egg.id,
        created_at=egg.created_at,
        hatch_at=egg.hatch_at,
        genome=egg.genome_json,
        status=egg.status,
        hatched_pet_id=egg.hatched_pet_id,
    )
