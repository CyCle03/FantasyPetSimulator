from __future__ import annotations

import os
import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db, init_db
from ..genetics.emotions import pick_emotion, should_update_emotion
from ..genetics.genome import choose_hidden_loci
from ..genetics.phenotype import genome_to_phenotype
from ..genetics.rarity import hatch_reward, rarity_score, rarity_tier
from ..models import Egg, Pet, Player
from ..schemas import EggOut, PetOut, ResetOut, StateOut
from ..seed import seed_db

router = APIRouter()


def _get_player(db: Session) -> Player:
    player = db.query(Player).first()
    if not player:
        player = Player(gold=0)
        db.add(player)
        db.commit()
        db.refresh(player)
    return player


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


@router.get("/state", response_model=StateOut)
def get_state(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    rng = random.Random()
    player = _get_player(db)
    eggs_ready = (
        db.query(Egg)
        .filter(Egg.status == "Incubating", Egg.hatch_at <= now)
        .all()
    )

    for egg in eggs_ready:
        pet = _create_pet_from_genome(db, egg.genome_json)
        reward = hatch_reward(pet.rarity_score, pet.rarity_tier)
        player.gold += reward
        egg.status = "Hatched"
        egg.hatched_pet_id = pet.id

    db.commit()

    pets = db.query(Pet).order_by(Pet.id).all()
    updated = False
    for pet in pets:
        if pet.emotion_updated_at and should_update_emotion(pet.emotion_updated_at, now):
            pet.emotion = pick_emotion(rng, pet.phenotype_json.get("Personality", "Calm"))
            pet.emotion_updated_at = now
            updated = True
    if updated:
        db.commit()
    eggs = db.query(Egg).order_by(Egg.id).all()

    return StateOut(
        pets=[
            PetOut(
                id=pet.id,
                created_at=pet.created_at,
                genome=pet.genome_json,
                phenotype=pet.phenotype_json,
                phenotype_public={
                    key: ("Unknown" if key in (pet.hidden_loci_json or []) else value)
                    for key, value in pet.phenotype_json.items()
                },
                rarity_score=pet.rarity_score,
                rarity_tier=pet.rarity_tier,
                breeding_locked_until=pet.breeding_locked_until,
                hidden_loci=pet.hidden_loci_json or [],
                emotion=pet.emotion,
                owner_name=pet.owner_name,
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
        server_time=now,
        gold=player.gold,
    )


@router.post("/reset", response_model=ResetOut)
def reset_db(db: Session = Depends(get_db)):
    env = os.getenv("ENV", "development")
    if env not in {"development", "dev"}:
        raise HTTPException(status_code=403, detail="Reset is disabled in this environment.")

    db.query(Egg).delete()
    db.query(Pet).delete()
    db.query(Player).delete()
    db.commit()

    init_db()
    seed_db(db)
    return ResetOut(ok=True)
