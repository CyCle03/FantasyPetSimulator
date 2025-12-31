from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db, SessionLocal
from .routes import breeding, eggs, pets
from .seed import seed_db

app = FastAPI(title="SD Fantasy Pet MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pets.router)
app.include_router(breeding.router)
app.include_router(eggs.router)


@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
