from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class PetOut(BaseModel):
    id: int
    created_at: datetime
    genome: dict[str, Any]
    phenotype: dict[str, Any]
    phenotype_public: dict[str, Any]
    rarity_score: int
    rarity_tier: str
    rarity_tags: list[str]
    breeding_locked_until: datetime | None
    hidden_loci: list[str]
    emotion: str
    owner_name: str


class EggOut(BaseModel):
    id: int
    created_at: datetime
    hatch_at: datetime
    genome: dict[str, Any]
    status: str
    hatched_pet_id: int | None


class BreedingOut(BaseModel):
    id: int
    created_at: datetime
    parent_a_id: int
    parent_b_id: int
    egg_id: int
    status: str


class StateOut(BaseModel):
    pets: list[PetOut]
    eggs: list[EggOut]
    server_time: datetime
    gold: int
    emotion_refresh_cost: int
    instant_hatch_cost: int
    reveal_aura_cost: int
    adopt_egg_cost: int
    adopt_egg_cooldown_seconds: int
    adopt_egg_ready_at: datetime | None
    sell_price_by_tier: dict[str, int]
    adopt_premium_egg_cost: int
    adopt_premium_egg_cooldown_seconds: int
    adopt_premium_egg_ready_at: datetime | None


class BreedIn(BaseModel):
    parent_a_id: int = Field(alias="parentAId")
    parent_b_id: int = Field(alias="parentBId")


class HatchIn(BaseModel):
    egg_id: int = Field(alias="eggId")


class ResetOut(BaseModel):
    ok: bool


class ListingOut(BaseModel):
    id: int
    created_at: datetime
    pet_id: int
    price: int
    status: str
    seller_name: str
    buyer_name: str | None
    sold_at: datetime | None


class ListingCreateIn(BaseModel):
    pet_id: int = Field(alias="petId")
    price: int
    seller_name: str | None = Field(default=None, alias="sellerName")


class ListingBuyIn(BaseModel):
    listing_id: int = Field(alias="listingId")
    buyer_name: str | None = Field(default=None, alias="buyerName")


class ListingCancelIn(BaseModel):
    listing_id: int = Field(alias="listingId")


class ShopEmotionIn(BaseModel):
    pet_id: int = Field(alias="petId")


class ShopHatchIn(BaseModel):
    egg_id: int = Field(alias="eggId")


class ShopResultOut(BaseModel):
    ok: bool
    gold: int


class ShopSellIn(BaseModel):
    pet_id: int = Field(alias="petId")


class ShopSellOut(BaseModel):
    ok: bool
    gold: int
    payout: int


class ShopRevealIn(BaseModel):
    pet_id: int = Field(alias="petId")


class ShopRevealOut(BaseModel):
    ok: bool
    gold: int
    revealed: bool
