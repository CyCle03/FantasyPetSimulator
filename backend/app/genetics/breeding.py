from __future__ import annotations

import os
import random
from typing import Tuple

from .genome import LOCI, RARE_ALLELES, choose_mutation_allele

BASE_MUTATION_CHANCE = 0.10
ELEMENT_CLASH_BONUS = 0.10
RARE_STABILIZE_MULT = 0.5
TOP_RARE_STABILIZE_MULT = 0.3
MUTATION_TUNE_MULTIPLIER = float(os.getenv("BREEDING_MUTATION_MULTIPLIER", "1.0"))


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
    parent_a_phenotype: dict,
    parent_b_phenotype: dict,
    rng: random.Random,
) -> Tuple[dict, bool]:
    child_genome = {}

    species = choose_species(
        parent_a_phenotype.get("Species", "Slime"),
        parent_b_phenotype.get("Species", "Slime"),
        rng,
    )

    for locus in LOCI:
        if locus == "Species":
            child_genome[locus] = [species, species]
            continue
        allele_a = _inherit_with_weight(
            rng,
            locus,
            parent_a_genome[locus],
            parent_b_genome[locus],
            parent_a_phenotype,
            parent_b_phenotype,
        )
        allele_b = _inherit_with_weight(
            rng,
            locus,
            parent_a_genome[locus],
            parent_b_genome[locus],
            parent_a_phenotype,
            parent_b_phenotype,
        )
        child_genome[locus] = [allele_a, allele_b]

    mutated = False
    if rng.random() < 0.002:
        mutated = True
        target = rng.choice(["Aura", "Accessory", "EyeColor"])
        rare_allele = rng.choice(RARE_ALLELES[target])
        child_genome[target] = [rare_allele, rare_allele]

    return child_genome, mutated


def _inherit_with_weight(
    rng: random.Random,
    locus: str,
    parent_alleles: list[str],
    other_parent_alleles: list[str],
    parent_a_phenotype: dict,
    parent_b_phenotype: dict,
) -> str:
    combined = set(parent_alleles) | set(other_parent_alleles)
    if len(combined) == 1:
        return next(iter(combined))

    mutation_chance = _mutation_chance(locus, parent_a_phenotype, parent_b_phenotype)
    roll = rng.random()
    if roll < mutation_chance:
        exclude = set(parent_alleles) | set(other_parent_alleles)
        return choose_mutation_allele(rng, locus, exclude)

    parent_share = (1 - mutation_chance) / 2
    roll = rng.random()
    if roll < parent_share:
        return rng.choice(parent_alleles)
    return rng.choice(other_parent_alleles)


def _mutation_chance(locus: str, parent_a_phenotype: dict, parent_b_phenotype: dict) -> float:
    base = BASE_MUTATION_CHANCE
    _ = locus

    opposites = [{"Fire", "Water"}, {"Wind", "Earth"}]
    pair = {
        parent_a_phenotype.get("Element", ""),
        parent_b_phenotype.get("Element", ""),
    }
    if pair in opposites:
        base += ELEMENT_CLASH_BONUS

    rare_values = {
        "Accessory": RARE_ALLELES.get("Accessory", []),
        "Aura": RARE_ALLELES.get("Aura", []),
        "EyeColor": RARE_ALLELES.get("EyeColor", []),
    }
    if any(
        parent_a_phenotype.get(locus) in values or parent_b_phenotype.get(locus) in values
        for locus, values in rare_values.items()
    ):
        base *= RARE_STABILIZE_MULT

    if (
        parent_a_phenotype.get("Aura") == "Prismatic"
        or parent_b_phenotype.get("Aura") == "Prismatic"
    ):
        base *= TOP_RARE_STABILIZE_MULT

    if (
        parent_a_phenotype.get("EyeColor") == "Void"
        or parent_b_phenotype.get("EyeColor") == "Void"
    ):
        base *= TOP_RARE_STABILIZE_MULT

    base *= MUTATION_TUNE_MULTIPLIER
    return max(0.0, min(base, 0.9))
