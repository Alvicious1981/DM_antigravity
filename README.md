# Dungeon Cortex

> **Motor de Realidad Simulada para D&D 5e** — Where the AI narrates, but the Code resolves.

## Architecture

This is a monorepo containing:

| Directory | Purpose |
|---|---|
| `apps/web-client/` | Next.js 14 frontend (The Visage) |
| `packages/engine/` | FastAPI + D&D 5e deterministic logic (The Engine) |
| `packages/db-schema/` | Shared SQLModel database definitions |
| `packages/agent-core/` | LLM orchestration (Triumvirate agents) |
| `external-sources/` | Git submodules (SRD data, map generator) |
| `.agent/skills/` | Antigravity modular agent skills |

## The Iron Laws

1. **Code is Law** — The AI narrates; the Engine resolves.
2. **State is Truth** — If it's not in the DB, it doesn't exist.
3. **Diegetic UI** — The interface IS the game world.

## Quick Start

```bash
# Frontend
cd apps/web-client && npm install && npm run dev

# Backend
cd packages/engine && pip install -r requirements.txt
python -m uvicorn src.engine.server:app --reload --port 8000
```

## SSOT

All technical decisions are governed by [`PROJECT_MANIFESTO.md`](./PROJECT_MANIFESTO.md).
