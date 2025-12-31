# SD Fantasy Pet MVP Backend

## Requirements
- Python 3.11+

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
- `/reset` is available only when `ENV=development` (default).
- Eggs auto-hatch on `/state` when `hatch_at` is reached.
