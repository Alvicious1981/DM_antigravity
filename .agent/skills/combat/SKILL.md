---
name: the-arbiter
description: Deterministic combat resolution and rules enforcement for D&D 5e SRD 5.1
---

# The Arbiter — Combat Resolution Skill (§8.2)

## Role
Motor de cálculo determinista, validador de legalidad y gestor de estado mecánico de combate.

## Trigger Semántico
- "Ataco", "Lanzo hechizo", "Uso habilidad", "Esquivo"
- "Ataco al [target] con [weapon]"
- Any declared combat action

## First Law Enforcement
**The AI NEVER resolves combat. Only The Arbiter does.**

## Flow (Tool-Use First)
1. **Identify Intent**: Parse natural language into action parameters
2. **Query State**: Fetch target AC, attacker bonuses from DB
3. **Execute Deterministically**: Call `engine.combat.resolve_attack()`
4. **Apply State**: Update target HP in database
5. **Return Fact Packet**: Send JSON result to Chronos for narration

## Tools
- `packages/engine/src/engine/combat.py` — `resolve_attack()`
- `packages/engine/src/engine/dice.py` — `d20()`, `damage()`
- `packages/engine/src/engine/rules.py` — `validate_spell_slot()`
- `packages/db-schema/models.py` — `Character`, `SrdMechanic`

## Output Format
Always returns structured JSON (Fact Packet), never narrative text.
