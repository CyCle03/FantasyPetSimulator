# SD Fantasy Pet MVP Backend

## Requirements
- Python 3.11+

## Environment variables
- `ENV=development` or `ENV=dev` to enable `/reset` (default).
- `ENABLE_MARKET=true` to enable market endpoints.
- `BREEDING_MUTATION_MULTIPLIER` to scale mutation chances.
- `ADOPT_EGG_COST` to set adopt egg gold cost (default 12).
- `ADOPT_EGG_COOLDOWN_SECONDS` to set adopt cooldown in seconds (default 300).
- `ADOPT_PREMIUM_EGG_COST` to set premium adopt gold cost (default 30).
- `ADOPT_PREMIUM_EGG_COOLDOWN_SECONDS` to set premium adopt cooldown in seconds (default 600).
- `ADOPT_PREMIUM_RARE_CHANCE` to tune premium rare allele chance (default 0.25).
- `ADOPT_PREMIUM_AURA_ACTIVE_CHANCE` to tune premium aura activation (default 0.7).
- `ADOPT_PREMIUM_SHINY_CHANCE` to tune premium shiny chance (default 0.15).
- `SELL_PRICE_COMMON`, `SELL_PRICE_UNCOMMON`, `SELL_PRICE_RARE`, `SELL_PRICE_EPIC`, `SELL_PRICE_LEGENDARY` to tune sell payouts.

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
- `POST /adopt-egg-premium` creates a premium egg (higher rare odds).
- `/state` includes shop costs plus adopt-egg settings and cooldown timestamp.
- If you see `no such column: players.adopt_egg_ready_at` or `players.adopt_premium_egg_ready_at`, delete `backend/pets.db` and restart.
