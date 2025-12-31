from __future__ import annotations

import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MarketListing, Pet
from ..schemas import ListingBuyIn, ListingCancelIn, ListingCreateIn, ListingOut

router = APIRouter(prefix="/market", tags=["market"])


def _ensure_enabled() -> None:
    if os.getenv("ENABLE_MARKET", "false").lower() != "true":
        raise HTTPException(status_code=404, detail="Market is disabled.")


def _to_out(listing: MarketListing) -> ListingOut:
    return ListingOut(
        id=listing.id,
        created_at=listing.created_at,
        pet_id=listing.pet_id,
        price=listing.price,
        status=listing.status,
        seller_name=listing.seller_name,
        buyer_name=listing.buyer_name,
        sold_at=listing.sold_at,
    )


@router.get("/listings", response_model=list[ListingOut])
def get_listings(db: Session = Depends(get_db)):
    _ensure_enabled()
    listings = (
        db.query(MarketListing)
        .filter(MarketListing.status == "Active")
        .order_by(MarketListing.created_at.desc())
        .all()
    )
    return [_to_out(listing) for listing in listings]


@router.post("/list", response_model=ListingOut)
def create_listing(payload: ListingCreateIn, db: Session = Depends(get_db)):
    _ensure_enabled()
    if payload.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be positive.")

    pet = db.query(Pet).filter(Pet.id == payload.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")

    active = (
        db.query(MarketListing)
        .filter(MarketListing.pet_id == payload.pet_id, MarketListing.status == "Active")
        .first()
    )
    if active:
        raise HTTPException(status_code=400, detail="This pet is already listed.")

    listing = MarketListing(
        pet_id=payload.pet_id,
        price=payload.price,
        status="Active",
        seller_name=payload.seller_name or pet.owner_name or "LocalUser",
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return _to_out(listing)


@router.post("/buy", response_model=ListingOut)
def buy_listing(payload: ListingBuyIn, db: Session = Depends(get_db)):
    _ensure_enabled()
    listing = db.query(MarketListing).filter(MarketListing.id == payload.listing_id).first()
    if not listing or listing.status != "Active":
        raise HTTPException(status_code=404, detail="Listing not available.")

    buyer = payload.buyer_name or "LocalBuyer"
    listing.status = "Sold"
    listing.buyer_name = buyer
    listing.sold_at = datetime.utcnow()

    pet = db.query(Pet).filter(Pet.id == listing.pet_id).first()
    if pet:
        pet.owner_name = buyer

    db.commit()
    return _to_out(listing)


@router.post("/cancel", response_model=ListingOut)
def cancel_listing(payload: ListingCancelIn, db: Session = Depends(get_db)):
    _ensure_enabled()
    listing = db.query(MarketListing).filter(MarketListing.id == payload.listing_id).first()
    if not listing or listing.status != "Active":
        raise HTTPException(status_code=404, detail="Listing not available.")

    listing.status = "Cancelled"
    db.commit()
    return _to_out(listing)
