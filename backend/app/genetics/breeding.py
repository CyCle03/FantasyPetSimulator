from __future__ import annotations

import random
from typing import Tuple

from .genome import LOCI, RARE_ALLELES, inherit_allele


def choose_species(parent_a: str, parent_b: str, rng: random.Random) -> str:
    if parent_a == parent_b:
        return parent_a

    pair = {parent_a, parent_b}
    if pair == {"Slime", "Spirit"}:
        roll = rng.random()
        if roll < 0.70:
            return "Slime"
        if roll < 0.95:
            return "Spirit"
        return "Hybrid"

    if pair == {"Dragon", "Spirit"}:
        roll = rng.random()
        if roll < 0.60:
            return "Dragon"
        if roll < 0.90:
            return "Spirit"
        return "Mythic"

    roll = rng.random()
    if roll < 0.90:
        return rng.choice([parent_a, parent_b])
    return "Hybrid"


def breed(
    parent_a_genome: dict,
    parent_b_genome: dict,
    parent_a_species: str,
    parent_b_species: str,
    rng: random.Random,
) -> Tuple[dict, bool]:
    child_genome = {}

    species = choose_species(parent_a_species, parent_b_species, rng)

    for locus in LOCI:
        if locus == "Species":
            child_genome[locus] = [species, species]
            continue
        allele_a = inherit_allele(rng, parent_a_genome[locus])
        allele_b = inherit_allele(rng, parent_b_genome[locus])
        child_genome[locus] = [allele_a, allele_b]

    mutated = False
    if rng.random() < 0.002:
        mutated = True
        target = rng.choice(["Aura", "Accessory", "EyeColor"])
        rare_allele = rng.choice(RARE_ALLELES[target])
        child_genome[target] = [rare_allele, rare_allele]

    return child_genome, mutated
