from __future__ import annotations

RARE_BY_LOCUS = {
    "Accessory": {"Relic"},
    "Aura": {"Prismatic"},
    "EyeColor": {"Void"},
}


def rarity_score(phenotype: dict) -> int:
    score = 0
    for locus, rare_values in RARE_BY_LOCUS.items():
        if phenotype.get(locus) in rare_values:
            if locus == "Aura":
                score += 10
            else:
                score += 5

    if phenotype.get("ShinyGene") == "Shiny":
        score += 15

    if phenotype.get("Species") == "Mythic":
        score += 20

    return score


def rarity_tier(score: int) -> str:
    if score >= 35:
        return "Legendary"
    if score >= 20:
        return "Epic"
    if score >= 10:
        return "Rare"
    if score >= 5:
        return "Uncommon"
    return "Common"


def hatch_reward(score: int, tier: str) -> int:
    bonus = {
        "Common": 0,
        "Uncommon": 2,
        "Rare": 4,
        "Epic": 8,
        "Legendary": 15,
    }.get(tier, 0)
    return 5 + (score // 5) + bonus
