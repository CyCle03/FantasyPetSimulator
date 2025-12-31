from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from .database import Base


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    genome_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    phenotype_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    rarity_score: Mapped[int] = mapped_column(Integer, default=0)
    rarity_tier: Mapped[str] = mapped_column(String, default="Common")
    breeding_locked_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    hidden_loci_json: Mapped[list] = mapped_column(JSON, default=list)
    emotion: Mapped[str] = mapped_column(String, default="Calm")
    emotion_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Egg(Base):
    __tablename__ = "eggs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    hatch_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    genome_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String, default="Incubating")
    hatched_pet_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("pets.id"))
    hatched_pet: Mapped[Pet | None] = relationship("Pet")


class Breeding(Base):
    __tablename__ = "breedings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    parent_a_id: Mapped[int] = mapped_column(Integer, ForeignKey("pets.id"))
    parent_b_id: Mapped[int] = mapped_column(Integer, ForeignKey("pets.id"))
    egg_id: Mapped[int] = mapped_column(Integer, ForeignKey("eggs.id"))
    status: Mapped[str] = mapped_column(String, default="Created")

    parent_a: Mapped[Pet] = relationship("Pet", foreign_keys=[parent_a_id])
    parent_b: Mapped[Pet] = relationship("Pet", foreign_keys=[parent_b_id])
    egg: Mapped[Egg] = relationship("Egg")
