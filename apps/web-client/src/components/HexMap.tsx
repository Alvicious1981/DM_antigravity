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

interface HexMapProps {
    cellId?: number;
    mode?: "exploration" | "combat" | "management";
}

export default function HexMap({
    cellId = 0,
    mode = "exploration",
}: HexMapProps) {
    return (
        <section
            id="hex-map"
            className="flex flex-col items-center justify-center rounded-lg border border-iron bg-obsidian/60 p-4 backdrop-blur-sm"
        >
            <h2
                className="mb-4 text-sm font-bold uppercase tracking-widest text-gold/60"
                style={{ fontFamily: "var(--font-cinzel)" }}
            >
                {mode === "combat"
                    ? "Bestiario"
                    : mode === "management"
                        ? "Grimorio"
                        : "Mapa del Mundo"}
            </h2>

            <div className="flex aspect-video w-full items-center justify-center rounded border border-iron/30 bg-abyss">
                <div className="text-center">
                    <p className="text-4xl text-ash/20">🗺</p>
                    <p className="mt-2 text-xs text-ash">
                        {mode === "exploration"
                            ? `Celda actual: ${cellId}`
                            : mode === "combat"
                                ? "Datos de enemigos aparecerán aquí"
                                : "Sistema Paper Doll activo"}
                    </p>
                </div>
            </div>
        </section>
    );
}
