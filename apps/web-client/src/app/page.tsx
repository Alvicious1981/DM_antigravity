/**
 * Dungeon Cortex — Landing Page (Phase 1 Scaffold)
 * Placeholder demonstrating the Dark Fantasy design system.
 * Will be replaced by The Triptych (§7) in Phase 4.
 */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-abyss p-8">
      {/* Central Sigil */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Arcane glow ring */}
        <div className="absolute -inset-16 rounded-full bg-gold/5 blur-3xl" />

        {/* Title — Cinzel for dramatic weight */}
        <h1
          className="relative text-5xl font-bold tracking-wider text-gold"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          DUNGEON CORTEX
        </h1>

        {/* Subtitle */}
        <p className="max-w-md text-center text-lg text-ash">
          Motor de Realidad Simulada — D&D 5e
        </p>

        {/* The Iron Laws */}
        <div className="mt-8 flex flex-col gap-4 text-sm">
          {[
            { number: "I", law: "Code is Law", desc: "La IA narra; el Código resuelve." },
            { number: "II", law: "State is Truth", desc: "Si no está en la DB, no existe." },
            { number: "III", law: "Diegetic UI", desc: "La interfaz ES el mundo." },
          ].map((item) => (
            <div
              key={item.number}
              className="flex items-center gap-4 rounded-lg border border-iron bg-obsidian/80 px-6 py-4 backdrop-blur-sm transition-colors hover:border-gold/40"
            >
              <span
                className="text-2xl font-bold text-gold/60"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {item.number}
              </span>
              <div>
                <p className="font-semibold text-bone">{item.law}</p>
                <p className="text-xs text-ash">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Badge */}
        <div className="mt-8 flex items-center gap-2 text-xs text-ash">
          <span className="inline-block h-2 w-2 rounded-full bg-venom animate-pulse" />
          <span>Engine v0.1.0 — Phase 1: Scaffolding Complete</span>
        </div>
      </div>
    </div>
  );
}
