# FantasyPetSimulator

A local MVP for collecting and breeding SD fantasy pets. Genetics and RNG are calculated on the FastAPI server, and the Next.js UI renders phenotypes as text/SVG or layered PNG parts.

## Structure
- `backend/`: FastAPI + SQLAlchemy + SQLite
- `frontend/`: Next.js (App Router) + Tailwind
- `design/`: Figma asset template notes

## Requirements
- Python 3.11+
- Node.js 18+

## Run the backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If `python3 -m venv` fails, install the venv package first:
```bash
sudo apt install python3-venv
```

Notes:
- SQLite DB is stored at `backend/pets.db`.
- The DB seeds 2 starter pets and 20 Gold on first run.
- `/reset` works only when `ENV=development` or `ENV=dev` (default).

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```

Environment variables:
- `NEXT_PUBLIC_API_BASE` (default `http://localhost:8000`)
- `NEXT_PUBLIC_USE_PART_ASSETS=true` to use PNG parts
- `NEXT_PUBLIC_ENABLE_MARKET=true` to show the market UI

## MVP Mechanics
- Single local user, no auth.
- Genetics are always calculated server-side.
- Breeding cooldown is 10 minutes per parent.
- Egg hatch time is 60 seconds; eggs do not auto-hatch.
- You can generate a fresh egg via `/adopt-egg` (defaults: 12 Gold, 5m cooldown).
- Emotions refresh every 10 minutes on `/state` or via the shop.
- Per-locus mutation starts at 10% and is tuned by element clashes and rarity stabilization.
- Extra rare mutation: 0.2% chance to force a rare Aura/Accessory/EyeColor.
- Hatch rewards grant Gold; shop costs default to 10 (emotion refresh), 15 (instant hatch), and 12 (adopt egg).
- Rarity tiers are server-calculated using part synergy rules.
- `BREEDING_MUTATION_MULTIPLIER` scales mutation chances.
- `ADOPT_EGG_COST` and `ADOPT_EGG_COOLDOWN_SECONDS` tune adopt pricing and cooldown.

## PNG Parts & Design
- Sample parts are under `frontend/public/parts/{Locus}/{Value}.png`.
- Enable with `NEXT_PUBLIC_USE_PART_ASSETS=true`.
- When disabled, the app uses the SVG fallback avatar.
- Figma export guidance lives in `design/FigmaTemplate.md`.
- You can list expected asset paths with:
  ```bash
  cd backend
  python3 tools/list_asset_paths.py
  ```

## UI Language
- Use the language dropdown in the header to switch between English and Korean.

## Troubleshooting
- If you see `no such column: players.adopt_egg_ready_at`, delete `backend/pets.db` and restart.

## Market (Experimental)
- Enable backend: `ENABLE_MARKET=true`
- Enable frontend: `NEXT_PUBLIC_ENABLE_MARKET=true`
- Market adds listing/buy/cancel endpoints for local trading.

## Deployment (Free Tier)
### Backend (Render)
1) Create a new Web Service from the GitHub repo.
2) Set the root directory to `backend`.
3) Build command: `pip install -r requirements.txt`
4) Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5) Add env vars as needed (example: `ENABLE_MARKET=true`).

### Frontend (Vercel)
1) Import the GitHub repo in Vercel.
2) Set the root directory to `frontend`.
3) Set env var `NEXT_PUBLIC_API_BASE` to your Render backend URL.
4) (Optional) `NEXT_PUBLIC_USE_PART_ASSETS=true`
5) (Optional) `NEXT_PUBLIC_ENABLE_MARKET=true`

## API Endpoints
- `GET /state`: Returns pets, eggs, gold, server time, and shop/adopt settings.
- `POST /breed`: `{ parentAId, parentBId }` creates a new egg.
- `POST /hatch`: `{ eggId }` hatch if ready.
- `POST /hatch-all`: Hatch all ready eggs.
- `POST /adopt-egg`: Create a new random egg.
- `POST /reset`: Dev-only DB reset (requires `ENV=development` or `ENV=dev`).
- `POST /shop/refresh-emotion`: `{ petId }` reroll emotion (costs Gold).
- `POST /shop/instant-hatch`: `{ eggId }` instantly hatch an egg (costs Gold).
- `GET /market/listings`: List active market items (when enabled).
- `POST /market/list`: `{ petId, price, sellerName? }` create a listing.
- `POST /market/buy`: `{ listingId, buyerName? }` buy a listing.
- `POST /market/cancel`: `{ listingId }` cancel a listing.

## Simulation (Balance Check)
```bash
cd backend
python3 tools/simulate_breeding.py --count 1000
```
Outputs `reports/pets.json` and `reports/rarity.csv`.

---

# FantasyPetSimulator (Korean)

SD 판타지 펫을 수집하고 교배해 알을 만들며, 부화해 새 펫을 얻는 로컬 MVP입니다. 유전 계산과 RNG는 FastAPI 서버에서만 수행되고, Next.js UI는 phenotype을 텍스트/SVG 또는 PNG 레이어로 표시합니다.

## 구조
- `backend/`: FastAPI + SQLAlchemy + SQLite
- `frontend/`: Next.js (App Router) + Tailwind
- `design/`: Figma 에셋 템플릿 가이드

## 요구 사항
- Python 3.11+
- Node.js 18+

## 백엔드 실행
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

`python3 -m venv`가 실패하면 venv 패키지를 먼저 설치하세요:
```bash
sudo apt install python3-venv
```

참고:
- SQLite DB는 `backend/pets.db`에 저장됩니다.
- 최초 실행 시 2마리 펫과 20 골드를 시드합니다.
- `/reset`은 `ENV=development` 또는 `ENV=dev`일 때만 동작합니다.

## 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

환경 변수:
- `NEXT_PUBLIC_API_BASE` (기본값 `http://localhost:8000`)
- `NEXT_PUBLIC_USE_PART_ASSETS=true` PNG 파츠 사용
- `NEXT_PUBLIC_ENABLE_MARKET=true` 마켓 UI 표시

## MVP 규칙
- 단일 로컬 유저, 인증 없음.
- 유전 계산은 항상 서버에서 수행.
- 교배 쿨타임은 부모당 10분.
- 알 부화 시간은 60초이며, 자동 부화되지 않습니다.
- `/adopt-egg`로 새로운 알을 생성할 수 있습니다(기본값: 12 골드, 5분 쿨타임).
- 감정은 `/state` 호출 시 10분 쿨타임마다 갱신되며, 상점에서도 리롤 가능.
- 로커스별 돌연변이 확률은 기본 10%이며, 상성/희귀도 보정이 적용됩니다.
- 추가 희귀 돌연변이: Aura/Accessory/EyeColor 0.2% 강제 희귀 치환.
- 부화 보상으로 골드를 획득하며, 상점 비용 기본값은 10(감정 리롤), 15(즉시 부화), 12(알 입양)입니다.
- 희귀도 등급은 서버 시너지 규칙으로 계산.
- `BREEDING_MUTATION_MULTIPLIER`로 돌연변이 확률을 조정할 수 있습니다.
- `ADOPT_EGG_COST`, `ADOPT_EGG_COOLDOWN_SECONDS`로 알 입양 비용/쿨타임을 조정할 수 있습니다.

## PNG 파츠 & 디자인
- 샘플 파츠는 `frontend/public/parts/{Locus}/{Value}.png`에 포함됩니다.
- 프론트 실행 시 `NEXT_PUBLIC_USE_PART_ASSETS=true`를 설정하면 사용됩니다.
- 비활성화 시 SVG 폴백 아바타 사용.
- Figma 템플릿 가이드는 `design/FigmaTemplate.md`에 있습니다.
- 필요한 에셋 경로를 확인하려면:
  ```bash
  cd backend
  python3 tools/list_asset_paths.py
  ```

## 언어 선택
- 상단 언어 선택 드롭다운에서 영어/한국어를 전환할 수 있습니다.

## 트러블슈팅
- `no such column: players.adopt_egg_ready_at` 오류가 보이면 `backend/pets.db`를 삭제 후 재실행하세요.

## 마켓 (실험)
- 백엔드 활성화: `ENABLE_MARKET=true`
- 프론트 활성화: `NEXT_PUBLIC_ENABLE_MARKET=true`
- 로컬 거래용 마켓(등록/구매/취소)을 추가합니다.

## 배포 (무료 플랜)
### 백엔드 (Render)
1) GitHub 레포에서 Web Service 생성
2) Root Directory: `backend`
3) Build Command: `pip install -r requirements.txt`
4) Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5) 필요 시 환경변수 설정 (예: `ENABLE_MARKET=true`)

### 프론트엔드 (Vercel)
1) Vercel에 GitHub 레포 Import
2) Root Directory: `frontend`
3) `NEXT_PUBLIC_API_BASE`를 Render 백엔드 URL로 설정
4) (선택) `NEXT_PUBLIC_USE_PART_ASSETS=true`
5) (선택) `NEXT_PUBLIC_ENABLE_MARKET=true`

## API 엔드포인트
- `GET /state`: 펫/알/골드/서버 시간 + 상점/알 입양 설정 반환.
- `POST /breed`: `{ parentAId, parentBId }`로 알 생성.
- `POST /hatch`: `{ eggId }` 부화(준비된 알만).
- `POST /hatch-all`: 준비된 알을 모두 부화.
- `POST /adopt-egg`: 랜덤 알 생성.
- `POST /reset`: 개발 환경 전용 DB 초기화(`ENV=development` 또는 `ENV=dev` 필요).
- `POST /shop/refresh-emotion`: `{ petId }` 감정 리롤(골드 소모).
- `POST /shop/instant-hatch`: `{ eggId }` 즉시 부화(골드 소모).
- `GET /market/listings`: 마켓 목록 조회(활성화 시).
- `POST /market/list`: `{ petId, price, sellerName? }` 등록.
- `POST /market/buy`: `{ listingId, buyerName? }` 구매.
- `POST /market/cancel`: `{ listingId }` 취소.

## 시뮬레이션(밸런스 확인)
```bash
cd backend
python3 tools/simulate_breeding.py --count 1000
```
`reports/pets.json`, `reports/rarity.csv` 출력.
