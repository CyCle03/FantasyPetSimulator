from __future__ import annotations

from typing import Dict

from .genome import COMMON_ALLELES, LOCI

DOMINANCE: Dict[str, Dict[str, int]] = {}
for locus, alleles in COMMON_ALLELES.items():
    DOMINANCE[locus] = {allele: index for index, allele in enumerate(alleles)}


def _pick_dominant(locus: str, allele_a: str, allele_b: str) -> str:
    if allele_a == allele_b:
        return allele_a
    if locus == "ShinyGene":
        return "Shiny" if "Shiny" in {allele_a, allele_b} else "Normal"

    weights = DOMINANCE.get(locus, {})
    weight_a = weights.get(allele_a, 0)
    weight_b = weights.get(allele_b, 0)
    if weight_a == weight_b:
        return sorted([allele_a, allele_b])[0]
    return allele_a if weight_a > weight_b else allele_b


def genome_to_phenotype(genome: dict) -> dict:
    phenotype: Dict[str, str] = {}
    for locus in LOCI:
        alleles = genome[locus]
        phenotype[locus] = _pick_dominant(locus, alleles[0], alleles[1])
    return phenotype
