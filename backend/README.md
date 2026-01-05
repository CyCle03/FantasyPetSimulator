# SD Fantasy Pet MVP Backend

## Requirements
- Python 3.11+

## Environment variables
- `ENV=development` or `ENV=dev` to enable `/reset` (default).
- `ENABLE_MARKET=true` to enable market endpoints.
- `BREEDING_MUTATION_MULTIPLIER` to scale mutation chances.

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
uvicorn app.main:app --reload
```

## Notes
- SQLite DB is stored at `backend/pets.db`.
- `/reset` is available only when `ENV=development` or `ENV=dev` (default).
- Eggs do not auto-hatch; use `/hatch` or `/hatch-all`.
- `POST /adopt-egg` creates a new random egg (12 Gold, 5m cooldown).
