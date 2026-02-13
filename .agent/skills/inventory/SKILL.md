---
name: the-treasurer
description: Loot generation, inventory management, and item transaction processing
---

# The Treasurer — Inventory & Loot Skill (§8.3)

## Role
Generación de botín, gestión de inventario y procesamiento de transacciones de objetos.

## Trigger Semántico
- "Saqueo el cuerpo", "Abro el cofre", "Busco en la habitación"
- Any loot or inventory interaction

## Flow (Loot Goblin)
1. **Calculate Reward**: Receive CR or lock difficulty
2. **Query Loot Tables**: Weighted random from SRD reference tables
3. **Generate Instances**: Create new `InventoryItem` records in DB
4. **Visual Generation**: Invoke Visual Vault for unique item icons
5. **UI Update**: Send `SHOW_WIDGET` event with loot modal to player

## Tools
- `packages/engine/src/engine/dice.py` — random loot rolls
- `packages/db-schema/models.py` — `InventoryItem`, `SrdMechanic`
- Visual Vault agent — item icon generation (Nano Banana Pro)

## Output
`SHOW_WIDGET` event with `loot_modal` containing draggable items.
