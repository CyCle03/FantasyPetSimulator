# FantasyPetSimulator

A local MVP for collecting and breeding SD fantasy pets. Genetics and RNG are calculated on the FastAPI server, and the Next.js UI renders phenotypes as text/SVG.

## Structure
- `backend/`: FastAPI + SQLAlchemy + SQLite
- `frontend/`: Next.js (App Router) + Tailwind

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

If you see a SQLite column error after pulling new changes, delete `backend/pets.db` and restart to recreate the DB.

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
- Hatch rewards grant Gold; use Gold in the shop for small boosts.
- Rarity tiers are server-calculated using part synergy rules.

## Optional PNG Assets
- Place part layers under `frontend/public/parts/{Locus}/{Value}.png`.
- Enable with `NEXT_PUBLIC_USE_PART_ASSETS=true` when running the frontend.
- When disabled, the app uses the SVG fallback avatar.
- You can list expected asset paths with:
  ```bash
  cd backend
  python3 tools/list_asset_paths.py
  ```

## UI Language
- Use the language dropdown in the header to switch between English and Korean.

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
- `GET /state`: Returns pets and eggs.
- `POST /breed`: `{ parentAId, parentBId }` creates a new egg.
- `POST /hatch`: `{ eggId }` hatch if ready.
- `POST /hatch-all`: Hatch all ready eggs.
- `POST /reset`: Dev-only DB reset (requires `ENV=development`).
- `POST /shop/refresh-emotion`: `{ petId }` reroll emotion (costs Gold).
- `POST /shop/instant-hatch`: `{ eggId }` instantly hatch an egg (costs Gold).

## Simulation (Balance Check)
```bash
cd backend
python3 tools/simulate_breeding.py --count 1000
```
Outputs `reports/pets.json` and `reports/rarity.csv`.

---

# FantasyPetSimulator (Korean)

SD 판타지 펫을 수집하고 교배해 알을 만들며, 부화해 새 펫을 얻는 로컬 MVP입니다. 유전 계산과 RNG는 FastAPI 서버에서만 수행되고, Next.js UI는 phenotype을 텍스트/SVG로 표시합니다.

## 구조
- `backend/`: FastAPI + SQLAlchemy + SQLite
- `frontend/`: Next.js (App Router) + Tailwind

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

업데이트 후 SQLite 컬럼 오류가 나면 `backend/pets.db`를 삭제하고 재실행하세요.

## 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

## MVP 규칙
- 단일 로컬 유저, 인증 없음.
- 유전 계산은 항상 서버에서 수행.
- `/state` 호출 시 `hatch_at`이 지난 알은 자동 부화(크론 없음).
- 교배 쿨타임은 부모당 10분.
- 돌연변이 확률 0.2% (Aura/Accessory/EyeColor 희귀 치환).
- 부화 보상으로 골드를 획득하며, 상점에서 사용 가능.
- 희귀도 등급은 서버 시너지 규칙으로 계산.

## PNG 에셋(선택)
- `frontend/public/parts/{Locus}/{Value}.png` 규칙으로 파츠 이미지 배치.
- 프론트 실행 시 `NEXT_PUBLIC_USE_PART_ASSETS=true`를 설정하면 사용됨.
- 비활성화 시 SVG 폴백 아바타 사용.
- 필요한 에셋 경로를 확인하려면:
  ```bash
  cd backend
  python3 tools/list_asset_paths.py
  ```

## 언어 선택
- 상단 언어 선택 드롭다운에서 영어/한국어를 전환할 수 있습니다.

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
- `GET /state`: 펫/알 목록 반환.
- `POST /breed`: `{ parentAId, parentBId }`로 알 생성.
- `POST /hatch`: `{ eggId }` 부화(준비된 알만).
- `POST /hatch-all`: 준비된 알을 모두 부화.
- `POST /reset`: 개발 환경 전용 DB 초기화(`ENV=development` 필요).
- `POST /shop/refresh-emotion`: `{ petId }` 감정 리롤(골드 소모).
- `POST /shop/instant-hatch`: `{ eggId }` 즉시 부화(골드 소모).

## 시뮬레이션(밸런스 확인)
```bash
cd backend
python3 tools/simulate_breeding.py --count 1000
```
`reports/pets.json`, `reports/rarity.csv` 출력.
