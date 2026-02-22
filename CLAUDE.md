# Dungeon Cortex — Agent Context

**Project:** Dungeon Cortex — a D&D 5e Simulated Reality Engine (not a chatbot).
**Goal:** Resolve the "DM Paradox": AI manages narrative and atmosphere; deterministic code governs all mechanics.

## The Iron Laws (non-negotiable)

1. **Code is Law** — The engine (`packages/engine`) is SSOT for all game mechanics. The LLM narrates; Python resolves. Never let an AI calculate dice rolls or combat outcomes mentally.
2. **State is Truth** — PostgreSQL/Supabase is the only source of truth. If an item/spell/resource isn't in the DB, it doesn't exist in the game world.
3. **Diegetic UI** — The interface IS the game. No SaaS aesthetics. Visceral Dark Fantasy skeuomorphism only. UI reacts to game state (screen shake on crits, grayscale on death, etc.).

## Repo Structure

```
apps/web-client/          # Next.js + React frontend (Abyss design system)
  src/app/                # Pages: Dashboard, ActionPanel, InventoryScreen, WorldMap
  src/components/         # InitiativeSidebar, PaperDoll
  src/hooks/              # useAgentState.ts, socketHandlers.ts, useSpells.ts
  src/domain/types.ts     # Shared TypeScript types

packages/engine/          # Python FastAPI backend
  src/engine/
    server.py             # FastAPI app entry point
    schemas.py            # Pydantic models (source of truth for data shapes)
    combat.py             # Deterministic combat resolution
    spells.py             # Spell casting engine
    inventory.py          # Item/equipment logic
    initiative.py         # Turn order management
    state.py              # Game state management
    conditions.py         # Status effects
    dice.py               # Cryptographic RNG dice roller
    rules.py              # D&D 5e SRD rules
    srd_queries.py        # SRD database queries
    db.py                 # DB connection
    maps.py / visibility.py / movement.py
    ai/
      chronos.py          # Narrative agent (Arbiter)
      visual_vault.py     # Image generation pipeline
      memory.py           # Agent memory
      tokenomics.py       # Token budget management
    routers/
      websocket.py        # AG-UI WebSocket protocol
      combat.py / game.py / maps.py / srd.py

external-sources/         # Fantasy map generator, Stitch MCP
packages/engine/dungeon_cortex_dev.db  # SQLite dev DB (SRD data, spells, monsters)
```

## Key Architecture Patterns

- **Transport:** WebSocket (AG-UI protocol) between frontend and FastAPI backend
- **State flow:** Player input → WebSocket → FastAPI → deterministic engine function → JSON fact packet → Chronos (LLM) narrates → WebSocket response to client
- **Design system:** "Abyss" / "Stitch" — dark fantasy, no Bootstrap/MUI
- **Agent Triumvirate:** Arbiter (narration), Cartographer (maps), Treasurer (inventory/economy)

## Dev Commands

```bash
# Backend
cd packages/engine && uvicorn src.engine.server:app --reload

# Frontend
cd apps/web-client && npm run dev
```

## File Ownership (for parallel agent work)

- **Backend/engine logic** → `packages/engine/src/engine/*.py`
- **Frontend UI components** → `apps/web-client/src/app/` and `src/components/`
- **WebSocket protocol** → `packages/engine/src/engine/routers/websocket.py` + `apps/web-client/src/hooks/socketHandlers.ts`
- **Types/schemas** — backend: `schemas.py`; frontend: `src/domain/types.ts`

**Never have two agents edit the same file simultaneously.**
