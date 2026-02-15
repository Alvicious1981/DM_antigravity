"use client";

/**
 * HexMap — Map Viewer Placeholder (Manifesto §7.3.A)
 *
 * Displays the Azgaar-powered map in Exploration mode.
 * Switches to Bestiary (Combat) or PaperDoll (Management) contextually.
 *
 * TODO Phase 4: Playwright integration with Azgaar Fantasy Map Generator
 * TODO Phase 4: Clickable POIs triggering travel events
 * TODO Phase 4: Fog of War based on character perception
 */

import { useMemo } from "react";
import { Combatant } from "@/hooks/useAgentState";

interface HexMapProps {
    cellId?: number | null;
    mode?: "exploration" | "combat" | "management";
    onCellClick?: (cellId: number) => void;
    selectedCell?: number | null;
    combatants?: Combatant[];
}

export default function HexMap({
    cellId = 0,
    mode = "exploration",
    onCellClick,
    selectedCell,
    combatants = []
}: HexMapProps) {
    // Phase 4: Replace with Azgaar
    const gridCells = useMemo(() => Array.from({ length: 25 }, (_, i) => i + 1), []);

    const occupantsByCell = useMemo(() => {
        const map: Record<number, Combatant[]> = {};
        combatants.forEach((c) => {
            if (c.position !== undefined && c.position !== null) {
                const pos = Number(c.position);
                if (!map[pos]) map[pos] = [];
                map[pos].push(c);
            }
        });
        return map;
    }, [combatants]);

    return (
        <section
            id="hex-map"
            className="flex flex-col items-center justify-center rounded-lg border border-iron bg-obsidian/60 p-4 backdrop-blur-sm w-full"
        >
            <h2
                className="mb-4 text-sm font-bold uppercase tracking-widest text-gold/60"
                style={{ fontFamily: "var(--font-cinzel)" }}
            >
                {mode === "combat"
                    ? "Bestiario - Zona de Combate"
                    : mode === "management"
                        ? "Grimorio"
                        : "Mapa del Mundo"}
            </h2>

            <div className="flex w-full flex-col items-center gap-4">
                <div className="grid grid-cols-5 gap-2 p-4 border border-iron/20 rounded bg-abyss/50">
                    {gridCells.map((id) => {
                        const occupants = occupantsByCell[id] || [];
                        return (
                            <div
                                key={id}
                                onClick={() => onCellClick?.(id)}
                                className={`
                                    flex h-10 w-10 items-center justify-center rounded border transition-all cursor-pointer relative
                                    ${selectedCell === id
                                        ? "border-gold bg-gold/20 shadow-[0_0_10px_rgba(255,215,0,0.3)] scale-110"
                                        : "border-iron/30 bg-abyss/40 hover:bg-indigo-500/20 hover:border-indigo-400/50"
                                    }
                                `}
                                title={`Celda ${id}`}
                            >
                                {occupants.map((c, i) => (
                                    <div
                                        key={c.id}
                                        className={`
                                            absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                                            ${c.isPlayer ? 'bg-blue-600 border-blue-400 text-white' : 'bg-red-600 border-red-400 text-white'}
                                        `}
                                        style={{
                                            transform: occupants.length > 1 ? `translate(${i * 4}px, ${i * 4}px)` : 'none',
                                            zIndex: 10 + i
                                        }}
                                        title={`${c.name} (${c.hp_current}/${c.hp_max} HP)`}
                                    >
                                        {c.name.substring(0, 2).toUpperCase()}
                                    </div>
                                ))}
                                {occupants.length === 0 && <span className={`text-xs ${selectedCell === id ? "text-gold" : "text-ash/40"}`}>{id}</span>}
                            </div>
                        );
                    })}
                </div>

                <div className="text-center text-xs text-ash/60">
                    {selectedCell ? `Celda Seleccionada: ${selectedCell}` : "Selecciona una celda para viajar"}
                </div>
            </div>
        </section>
    );
}
