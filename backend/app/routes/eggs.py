from __future__ import annotations

import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..genetics.emotions import pick_emotion
from ..genetics.genome import choose_hidden_loci, random_genome
from ..genetics.phenotype import genome_to_phenotype
from ..genetics.rarity import hatch_reward, rarity_profile
from ..models import Egg, Pet, Player
from ..schemas import EggOut, HatchIn

router = APIRouter()
EGG_HATCH_SECONDS = 60
ADOPT_EGG_COST = 12
ADOPT_COOLDOWN = timedelta(minutes=5)


def _create_pet_from_genome(db: Session, genome: dict) -> Pet:
    rng = random.Random()
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
    db.flush()
    return pet


def _get_player(db: Session) -> Player:
    player = db.query(Player).first()
    if not player:
        player = Player(gold=0)
        db.add(player)
        db.commit()
        db.refresh(player)
    return player


def _hatch_egg(db: Session, egg: Egg, player: Player, now: datetime) -> None:
    pet = _create_pet_from_genome(db, egg.genome_json)
    reward = hatch_reward(pet.rarity_score, pet.rarity_tier)
    player.gold += reward
    egg.status = "Hatched"
    egg.hatched_pet_id = pet.id
    egg.hatch_at = now


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

    player = _get_player(db)
    _hatch_egg(db, egg, player, now)
    db.commit()

    return EggOut(
        id=egg.id,
        created_at=egg.created_at,
        hatch_at=egg.hatch_at,
        genome=egg.genome_json,
        status=egg.status,
        hatched_pet_id=egg.hatched_pet_id,
    )


@router.post("/hatch-all", response_model=list[EggOut])
def hatch_all_eggs(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    eggs_ready = (
        db.query(Egg)
        .filter(Egg.status == "Incubating", Egg.hatch_at <= now)
        .all()
    )
    if not eggs_ready:
        return []

    player = _get_player(db)
    for egg in eggs_ready:
        _hatch_egg(db, egg, player, now)

    db.commit()

    return [
        EggOut(
            id=egg.id,
            created_at=egg.created_at,
            hatch_at=egg.hatch_at,
            genome=egg.genome_json,
            status=egg.status,
            hatched_pet_id=egg.hatched_pet_id,
        )
        for egg in eggs_ready
    ]


@router.post("/adopt-egg", response_model=EggOut)
def adopt_egg(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    player = _get_player(db)
    if player.gold < ADOPT_EGG_COST:
        raise HTTPException(status_code=400, detail="Not enough gold.")
    if player.adopt_egg_ready_at and player.adopt_egg_ready_at > now:
        remaining = int((player.adopt_egg_ready_at - now).total_seconds())
        raise HTTPException(
            status_code=400,
            detail=f"Adoption cooldown. Try again in {remaining}s.",
        )

    player.gold -= ADOPT_EGG_COST
    player.adopt_egg_ready_at = now + ADOPT_COOLDOWN
    rng = random.Random()
    genome = random_genome(rng)
    egg = Egg(
        hatch_at=now + timedelta(seconds=EGG_HATCH_SECONDS),
        genome_json=genome,
        status="Incubating",
    )
    db.add(egg)
    db.commit()
    db.refresh(egg)
    return EggOut(
        id=egg.id,
        created_at=egg.created_at,
        hatch_at=egg.hatch_at,
        genome=egg.genome_json,
        status=egg.status,
        hatched_pet_id=egg.hatched_pet_id,
    )
