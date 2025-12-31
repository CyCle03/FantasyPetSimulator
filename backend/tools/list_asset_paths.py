from __future__ import annotations

from pathlib import Path
import sys

CURRENT_DIR = Path(__file__).resolve()
BACKEND_DIR = CURRENT_DIR.parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.genetics.genome import COMMON_ALLELES, RARE_ALLELES

LAYERS = [
    "BodyType",
    "BaseColor",
    "Pattern",
    "EyeShape",
    "EyeColor",
    "Mouth",
    "Horn",
    "Wing",
    "Tail",
    "Accessory",
    "Aura",
    "Element",
]

BASE_DIR = Path("frontend/public/parts")


def main() -> None:
    for locus in LAYERS:
        values = list(COMMON_ALLELES.get(locus, []))
        values.extend(RARE_ALLELES.get(locus, []))
        for value in sorted(set(values)):
            path = BASE_DIR / locus / f"{value}.png"
            print(path.as_posix())


if __name__ == "__main__":
    main()
