from __future__ import annotations

import random
from typing import Dict, List

LOCI = [
    "Species",
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
    "Personality",
    "ShinyGene",
    "MutationSlot",
]

COMMON_ALLELES: Dict[str, List[str]] = {
    "Species": ["Slime", "Dragon", "Spirit", "Doll"],
    "BodyType": ["Round", "Lean", "Chubby", "Tiny"],
    "BaseColor": ["Mint", "Ruby", "Azure", "Amber"],
    "Pattern": ["Plain", "Speckled", "Striped", "Swirl"],
    "EyeShape": ["Dot", "Oval", "Star", "Crescent"],
    "EyeColor": ["Black", "Brown", "Teal", "Gold"],
    "Mouth": ["Smile", "Fang", "Beak", "Whisker"],
    "Horn": ["None", "Stub", "Spiral", "Blade"],
    "Wing": ["None", "Leaf", "Feather", "Crystal"],
    "Tail": ["None", "Fluff", "Spike", "Ribbon"],
    "Accessory": ["None", "Bell", "Cape", "Charm"],
    "Aura": ["None", "Mist", "Spark", "Glitter"],
    "Element": ["Water", "Fire", "Wind", "Earth"],
    "Personality": ["Gentle", "Bold", "Curious", "Calm"],
    "ShinyGene": ["Normal", "Normal", "Normal", "Shiny"],
    "MutationSlot": ["None", "None", "None", "None"],
}

RARE_ALLELES: Dict[str, List[str]] = {
    "Aura": ["Prismatic"],
    "Accessory": ["Relic"],
    "EyeColor": ["Void"],
}

HIDDEN_CANDIDATES = [
    "Aura",
    "Accessory",
    "EyeColor",
    "Element",
    "Personality",
    "ShinyGene",
    "MutationSlot",
]


def random_genome(rng: random.Random) -> dict:
    genome = {}
    for locus in LOCI:
        alleles = COMMON_ALLELES[locus]
        genome[locus] = [rng.choice(alleles), rng.choice(alleles)]
    return genome


def inherit_allele(rng: random.Random, allele_pair: list[str]) -> str:
    return rng.choice(allele_pair)


def choose_hidden_loci(rng: random.Random, count: int = 3) -> list[str]:
    count = min(count, len(HIDDEN_CANDIDATES))
    return rng.sample(HIDDEN_CANDIDATES, k=count)
