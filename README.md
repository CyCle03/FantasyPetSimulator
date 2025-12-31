# FantasyPetSimulator

A local MVP for collecting and breeding SD fantasy pets. Genetics and RNG are calculated on the FastAPI server, and the Next.js UI renders phenotypes as text/SVG.

## Structure
- `backend/`: FastAPI + SQLAlchemy + SQLite
- `frontend/`: Next.js (App Router) + Tailwind

## Run the backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```

## MVP Rules
- Single local user, no auth.
- Genetics are always calculated server-side.
- Eggs auto-hatch on `/state` once `hatch_at` passes (no cron).
- Breeding cooldown is 10 minutes per parent.
- Mutation chance: 0.2% (Aura/Accessory/EyeColor rare).

## API Endpoints
- `GET /state`: Returns pets and eggs, auto-hatching ready eggs.
- `POST /breed`: `{ parentAId, parentBId }` creates a new egg.
- `POST /hatch`: `{ eggId }` hatch if ready.
- `POST /reset`: Dev-only DB reset (requires `ENV=development`).
