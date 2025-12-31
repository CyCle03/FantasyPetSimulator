# Figma Template Guide (Pastel SD + Paper Line)

## Canvas
- Frame: 1024x1024
- Background: transparent
- Anchor: body center (align all layers to this point)

## Layer Order
1) BodyType
2) BaseColor
3) Pattern
4) EyeShape
5) EyeColor
6) Mouth
7) Horn
8) Wing
9) Tail
10) Accessory
11) Aura
12) Element

## Styles
### Line
- Stroke: `#3B3B3B`
- Width: 8px (at 1024px canvas)
- Cap: round
- Optional: subtle paper grain (5-8% opacity)

### BaseColor Palette
- Mint: `#9FE7C4`
- Ruby: `#F07A7A`
- Azure: `#8BB7F0`
- Amber: `#F4C06D`

### Shading
- Shadow: base color -20% lightness
- Highlight: base color +15% lightness
- Shadow edge: soft (10-20% blur)

### Pattern
- 10-15% darker than base color
- Opacity 60-70%

### Eyes
- Add a small white highlight dot (70% opacity)
- EyeColor values:
  - Black `#1F2937`
  - Brown `#6B4F3B`
  - Teal `#14B8A6`
  - Gold `#EAB308`
  - Void `#0B0F1A`

### Aura
- Glow gradient: `#FDE68A` -> `#FDBA74`
- Blur: 12-18px
- Opacity 60-80%

### Element FX
- Water: ring + droplets (`#7DD3FC`)
- Fire: soft flames (`#FB7185`)
- Wind: curved streaks (`#A7F3D0`)
- Earth: dust ring (`#D6B38C`)

## Components
Create one component set per Locus with variant names as allele values.
Suggested structure:
- Components/
  - BodyType/
    - Round
    - Lean
    - Chubby
    - Tiny
  - BaseColor/
    - Mint
    - Ruby
    - Azure
    - Amber
  - Pattern/
    - Plain
    - Speckled
    - Striped
    - Swirl
  - EyeShape/
    - Dot
    - Oval
    - Star
    - Crescent
  - EyeColor/
    - Black
    - Brown
    - Teal
    - Gold
    - Void
  - Mouth/
    - Smile
    - Fang
    - Beak
    - Whisker
  - Horn/
    - None
    - Stub
    - Spiral
    - Blade
  - Wing/
    - None
    - Leaf
    - Feather
    - Crystal
  - Tail/
    - None
    - Fluff
    - Spike
    - Ribbon
  - Accessory/
    - None
    - Bell
    - Cape
    - Charm
    - Relic
  - Aura/
    - None
    - Mist
    - Spark
    - Glitter
    - Prismatic
  - Element/
    - Water
    - Fire
    - Wind
    - Earth

## Export Rules
- Export each variant as PNG (transparent)
- Naming: `{Value}.png`
- Folder per locus: `frontend/public/parts/{Locus}/{Value}.png`

## Tips
- Keep all layers aligned to the same anchor point.
- Avoid oversized accessories that break the silhouette.
- Test with random combinations to check overlaps.
