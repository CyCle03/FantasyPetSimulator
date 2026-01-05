from __future__ import annotations

import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..genetics.emotions import pick_emotion
from ..genetics.genome import choose_hidden_loci
from ..genetics.phenotype import genome_to_phenotype
from ..genetics.rarity import rarity_profile
from ..models import Egg, MarketListing, Pet, Player
from ..schemas import ShopEmotionIn, ShopHatchIn, ShopResultOut, ShopSellIn, ShopSellOut

router = APIRouter(prefix="/shop", tags=["shop"])

EMOTION_REFRESH_COST = 10
INSTANT_HATCH_COST = 15
SELL_PRICES = {
    "Common": 3,
    "Uncommon": 6,
    "Rare": 12,
    "Epic": 24,
    "Legendary": 50,
}


def _get_player(db: Session) -> Player:
    player = db.query(Player).first()
    if not player:
        player = Player(gold=0)
        db.add(player)
        db.commit()
        db.refresh(player)
    return player


@router.post("/refresh-emotion", response_model=ShopResultOut)
def refresh_emotion(payload: ShopEmotionIn, db: Session = Depends(get_db)):
    player = _get_player(db)
    if player.gold < EMOTION_REFRESH_COST:
        raise HTTPException(status_code=400, detail="Not enough gold.")

    pet = db.query(Pet).filter(Pet.id == payload.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")

    player.gold -= EMOTION_REFRESH_COST
    rng = random.Random()
    pet.emotion = pick_emotion(rng, pet.phenotype_json.get("Personality", "Calm"))
    pet.emotion_updated_at = datetime.utcnow()
    db.commit()

    return ShopResultOut(ok=True, gold=player.gold)


@router.post("/instant-hatch", response_model=ShopResultOut)
def instant_hatch(payload: ShopHatchIn, db: Session = Depends(get_db)):
    player = _get_player(db)
    if player.gold < INSTANT_HATCH_COST:
        raise HTTPException(status_code=400, detail="Not enough gold.")

    egg = db.query(Egg).filter(Egg.id == payload.egg_id).first()
    if not egg:
        raise HTTPException(status_code=404, detail="Egg not found.")
    if egg.status != "Incubating":
        raise HTTPException(status_code=400, detail="Egg already hatched.")

    player.gold -= INSTANT_HATCH_COST
    rng = random.Random()
    phenotype = genome_to_phenotype(egg.genome_json)
    score, tier, tags = rarity_profile(phenotype)
    hidden_loci = choose_hidden_loci(rng)
    pet = Pet(
        genome_json=egg.genome_json,
        phenotype_json=phenotype,
        rarity_score=score,
        rarity_tier=tier,
        rarity_tags_json=tags,
        hidden_loci_json=hidden_loci,
        emotion=pick_emotion(rng, phenotype.get("Personality", "Calm")),
        emotion_updated_at=datetime.utcnow(),
        owner_name="LocalUser",
    )
    db.add(pet)
    db.flush()

    egg.status = "Hatched"
    egg.hatched_pet_id = pet.id
    egg.hatch_at = datetime.utcnow()

    db.commit()

    return ShopResultOut(ok=True, gold=player.gold)


@router.post("/sell", response_model=ShopSellOut)
def sell_pet(payload: ShopSellIn, db: Session = Depends(get_db)):
    player = _get_player(db)
    pet = db.query(Pet).filter(Pet.id == payload.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")

    active_listing = (
        db.query(MarketListing)
        .filter(MarketListing.pet_id == pet.id, MarketListing.status == "Active")
        .first()
    )
    if active_listing:
        raise HTTPException(status_code=400, detail="Pet is listed on the market.")

    payout = SELL_PRICES.get(pet.rarity_tier, SELL_PRICES["Common"])
    player.gold += payout

    db.query(Egg).filter(Egg.hatched_pet_id == pet.id).update(
        {"hatched_pet_id": None}
    )
    db.delete(pet)
    db.commit()

    return ShopSellOut(ok=True, gold=player.gold, payout=payout)
