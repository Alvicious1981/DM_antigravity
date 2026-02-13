---
name: the-cartographer
description: Map visualization, spatial navigation, and geographic rendering via Azgaar Fantasy Map Generator
---

# The Cartographer — Map & Spatial Skill (§8.1)

## Role
Gestión espacial, renderizado de mapas y navegación geográfica usando Azgaar Fantasy Map Generator.

## Trigger Semántico
- "Viajo a...", "¿Dónde estoy?", "Mirar mapa", "Explorar norte"
- Any spatial or navigation inquiry

## Tools
- Browser Subagent (Playwright) — headless map rendering
- Azgaar Fantasy Map Generator API — geographic data
- `packages/db-schema/models.py` — `Character.location_cell_id`

## Flow
1. Load campaign `.map` file in headless Playwright browser
2. Inject JS to hide Azgaar editor UI, center on `character.location_cell_id`
3. Adjust zoom and visible layers based on character perception
4. Capture high-resolution viewport screenshot
5. Send image via AG-UI `MAP_UPDATE` event
6. Provide textual geography description to Chronos

## Dependencies (Phase 2+)
- `playwright` — browser automation
- `external-sources/fantasy-map-generator/` — Azgaar source
