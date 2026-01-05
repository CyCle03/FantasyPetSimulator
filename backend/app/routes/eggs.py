from __future__ import annotations

import os
import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..genetics.emotions import pick_emotion
from ..genetics.genome import RARE_ALLELES, choose_hidden_loci, get_locus_alleles, random_genome
from ..genetics.phenotype import genome_to_phenotype
from ..genetics.rarity import hatch_reward, rarity_profile
from ..models import Egg, Pet, Player
from ..schemas import EggOut, HatchIn

router = APIRouter()
EGG_HATCH_SECONDS = 60
ADOPT_EGG_COST = int(os.getenv("ADOPT_EGG_COST", "12"))
ADOPT_COOLDOWN_SECONDS = int(os.getenv("ADOPT_EGG_COOLDOWN_SECONDS", "300"))
ADOPT_COOLDOWN = timedelta(seconds=ADOPT_COOLDOWN_SECONDS)
ADOPT_PREMIUM_EGG_COST = int(os.getenv("ADOPT_PREMIUM_EGG_COST", "30"))
ADOPT_PREMIUM_COOLDOWN_SECONDS = int(
    os.getenv("ADOPT_PREMIUM_EGG_COOLDOWN_SECONDS", "600")
)
ADOPT_PREMIUM_COOLDOWN = timedelta(seconds=ADOPT_PREMIUM_COOLDOWN_SECONDS)
PREMIUM_RARE_CHANCE = float(os.getenv("ADOPT_PREMIUM_RARE_CHANCE", "0.25"))
PREMIUM_AURA_ACTIVE_CHANCE = float(os.getenv("ADOPT_PREMIUM_AURA_ACTIVE_CHANCE", "0.7"))
PREMIUM_SHINY_CHANCE = float(os.getenv("ADOPT_PREMIUM_SHINY_CHANCE", "0.15"))


def _pick_weighted_allele(
    rng: random.Random,
    locus: str,
    prefer_rare: bool,
    exclude: set[str] | None = None,
) -> str:
    exclude = exclude or set()
    alleles = [a for a in get_locus_alleles(locus) if a not in exclude]
    if not alleles:
        alleles = get_locus_alleles(locus)
    if prefer_rare and locus in RARE_ALLELES:
        if rng.random() < PREMIUM_RARE_CHANCE:
            return rng.choice(RARE_ALLELES[locus])
    return rng.choice(alleles)


def premium_genome(rng: random.Random) -> dict:
    genome = random_genome(rng)

    if rng.random() < PREMIUM_AURA_ACTIVE_CHANCE:
        aura = _pick_weighted_allele(rng, "Aura", prefer_rare=True, exclude={"None"})
        genome["Aura"] = [aura, aura]

    if rng.random() < PREMIUM_RARE_CHANCE:
        accessory = _pick_weighted_allele(rng, "Accessory", prefer_rare=True)
        genome["Accessory"] = [accessory, accessory]

    if rng.random() < PREMIUM_RARE_CHANCE:
        eye_color = _pick_weighted_allele(rng, "EyeColor", prefer_rare=True)
        genome["EyeColor"] = [eye_color, eye_color]

    if rng.random() < PREMIUM_SHINY_CHANCE:
        genome["ShinyGene"] = ["Shiny", "Shiny"]

    return genome


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


@router.post("/adopt-egg-premium", response_model=EggOut)
def adopt_premium_egg(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    player = _get_player(db)
    if player.gold < ADOPT_PREMIUM_EGG_COST:
        raise HTTPException(status_code=400, detail="Not enough gold.")
    if player.adopt_premium_egg_ready_at and player.adopt_premium_egg_ready_at > now:
        remaining = int((player.adopt_premium_egg_ready_at - now).total_seconds())
        raise HTTPException(
            status_code=400,
            detail=f"Premium adoption cooldown. Try again in {remaining}s.",
        )

    player.gold -= ADOPT_PREMIUM_EGG_COST
    player.adopt_premium_egg_ready_at = now + ADOPT_PREMIUM_COOLDOWN
    rng = random.Random()
    genome = premium_genome(rng)
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
