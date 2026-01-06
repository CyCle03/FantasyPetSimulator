from __future__ import annotations

RARE_BY_LOCUS = {
    "Accessory": {"Relic"},
    "Aura": {"Prismatic"},
    "EyeColor": {"Void"},
}

SYNERGY_RULES = [
    {
        "tags": ["SYNERGY_LEGENDARY_1", "LEGENDARY_SET_A"],
        "requirements": [("Aura", "Prismatic"), ("EyeColor", "Void")],
        "bonus": 30,
        "min_tier": "Legendary",
    },
    {
        "tags": ["SYNERGY_EPIC_1", "EPIC_SET_B"],
        "requirements": [("Wing", "Crystal"), ("Element", "Fire")],
        "bonus": 18,
        "min_tier": "Epic",
    },
    {
        "tags": ["SYNERGY_EPIC_2", "EPIC_SET_C"],
        "requirements": [("Tail", "Ribbon"), ("BaseColor", "Mint"), ("Aura", "Spark")],
        "bonus": 16,
        "min_tier": "Epic",
    },
]


def rarity_profile(phenotype: dict) -> tuple[int, str, list[str]]:
    score = 0
    tags: list[str] = []

    aura_value = phenotype.get("Aura")
    element_value = phenotype.get("Element")

    if aura_value and aura_value != "None":
        score += 10
        tags.append("AURA_ACTIVE")

    if element_value and element_value != "None":
        tags.append("ELEMENT_ACTIVE")

    for locus, rare_values in RARE_BY_LOCUS.items():
        if phenotype.get(locus) in rare_values:
            score += 5
            tags.append(f"{locus.upper()}_RARE")

    if phenotype.get("Aura") == "Prismatic":
        score += 5
        tags.append("PRISMATIC_AURA")

    if phenotype.get("EyeColor") == "Void":
        tags.append("VOID_EYES")

    if phenotype.get("Wing") == "Crystal":
        tags.append("CRYSTAL_WINGS")

    if phenotype.get("ShinyGene") == "Shiny":
        score += 15
        tags.append("SHINY_GENE")

    if phenotype.get("Species") == "Mythic":
        score += 20
        tags.append("MYTHIC_SPECIES")

    for rule in SYNERGY_RULES:
        if all(phenotype.get(locus) == value for locus, value in rule["requirements"]):
            score += rule["bonus"]
            tags.extend(rule["tags"])

    tier = rarity_tier(score)
    for rule in SYNERGY_RULES:
        if any(tag in tags for tag in rule["tags"]):
            tier = _max_tier(tier, rule["min_tier"])

    return score, tier, sorted(set(tags))


def rarity_score(phenotype: dict) -> int:
    return rarity_profile(phenotype)[0]


def rarity_tier(score: int) -> str:
    if score >= 55:
        return "Legendary"
    if score >= 40:
        return "Epic"
    if score >= 20:
        return "Rare"
    if score >= 10:
        return "Uncommon"
    return "Common"


def _max_tier(current: str, minimum: str) -> str:
    order = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
    return order[max(order.index(current), order.index(minimum))]


def hatch_reward(score: int, tier: str) -> int:
    bonus = {
        "Common": 0,
        "Uncommon": 2,
        "Rare": 4,
        "Epic": 8,
        "Legendary": 15,
    }.get(tier, 0)
    return 5 + (score // 5) + bonus
