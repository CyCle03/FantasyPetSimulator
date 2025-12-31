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

## Optional PNG Assets
- Place part layers under `frontend/public/parts/{Locus}/{Value}.png`.
- Enable with `NEXT_PUBLIC_USE_PART_ASSETS=true` when running the frontend.
- When disabled, the app uses the SVG fallback avatar.

## API Endpoints
- `GET /state`: Returns pets and eggs, auto-hatching ready eggs.
- `POST /breed`: `{ parentAId, parentBId }` creates a new egg.
- `POST /hatch`: `{ eggId }` hatch if ready.
- `POST /reset`: Dev-only DB reset (requires `ENV=development`).

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

## PNG 에셋(선택)
- `frontend/public/parts/{Locus}/{Value}.png` 규칙으로 파츠 이미지 배치.
- 프론트 실행 시 `NEXT_PUBLIC_USE_PART_ASSETS=true`를 설정하면 사용됨.
- 비활성화 시 SVG 폴백 아바타 사용.

## API 엔드포인트
- `GET /state`: 펫/알 목록 반환, 부화 가능한 알 자동 처리.
- `POST /breed`: `{ parentAId, parentBId }`로 알 생성.
- `POST /hatch`: `{ eggId }` 즉시 부화(준비된 알만).
- `POST /reset`: 개발 환경 전용 DB 초기화(`ENV=development` 필요).
