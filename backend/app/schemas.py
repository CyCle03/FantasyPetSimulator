from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class PetOut(BaseModel):
    id: int
    created_at: datetime
    genome: dict[str, Any]
    phenotype: dict[str, Any]
    rarity_score: int
    rarity_tier: str
    breeding_locked_until: datetime | None


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


class BreedIn(BaseModel):
    parent_a_id: int = Field(alias="parentAId")
    parent_b_id: int = Field(alias="parentBId")


class HatchIn(BaseModel):
    egg_id: int = Field(alias="eggId")


class ResetOut(BaseModel):
    ok: bool
