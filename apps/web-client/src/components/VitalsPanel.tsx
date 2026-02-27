"use client";

import { motion } from "framer-motion";

// ──────────────────────────────────────────────────────────
// VitalsPanel — Character Status (§7.2)
// Animated HP bar with spring physics and condition badges.
// ──────────────────────────────────────────────────────────

interface VitalsPanelProps {
    name: string;
    hp: number;
    maxHp: number;
    ac: number;
    conditions?: (string | { condition_id: string })[];
    lastRoll?: { notation: string; total: number } | null;
    gold?: number;
}

export default function VitalsPanel({
    name,
    hp,
    maxHp,
    ac,
    conditions = [],
    lastRoll,
    gold,
}: VitalsPanelProps) {
    const hpPercent = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

    // Color shifts based on HP thresholds
    const hpColor =
        hpPercent > 60
            ? "#22c55e" // green — healthy
            : hpPercent > 30
                ? "#eab308" // yellow — bloodied
                : hpPercent > 0
                    ? "#ef4444" // red — critical
                    : "#6b7280"; // gray — dead

    const statusLabel =
        hp <= 0 ? "MUERTO" : hpPercent <= 30 ? "CRÍTICO" : hpPercent <= 60 ? "HERIDO" : "ESTABLE";

    return (
        <div className="rounded-lg border border-[#2a2a2d] bg-[#141416] p-4 space-y-4">
            {/* Character Name & AC */}
            <div className="flex items-center justify-between">
                <h3
                    className="text-lg font-bold tracking-wide"
                    style={{ fontFamily: "var(--font-cinzel)", color: "#c5a059" }}
                >
                    {name}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a1d] border border-[#2a2a2d]">
                        <span className="text-xs text-[#6b6b75]">AC</span>
                        <span className="text-sm font-bold text-[#b0b0b8]">{ac}</span>
                    </div>
                    {gold !== undefined && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a1d] border border-[#c5a059]/30">
                            <span className="text-xs text-[#c5a059]/70">gp</span>
                            <span className="text-sm font-bold text-[#c5a059]">{gold}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6b6b75]">HP</span>
                    <span data-testid="hp-values" style={{ color: hpColor }}>
                        {hp} / {maxHp}
                    </span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#1a1a1d] border border-[#2a2a2d] overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: hpColor }}
                        initial={false}
                        animate={{
                            width: `${hpPercent}%`,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                            mass: 0.5,
                        }}
                    />
                </div>
                <div className="text-right">
                    <span
                        className="text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: hpColor }}
                    >
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* Conditions */}
            {conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {conditions.map((condition, idx) => {
                        const label = typeof condition === 'string' ? condition : condition.condition_id;
                        return (
                            <span
                                key={`${label}-${idx}`}
                                className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border"
                                style={{
                                    borderColor: "#8b5cf6",
                                    color: "#a78bfa",
                                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                                }}
                            >
                                {label}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Last Dice Roll */}
            {lastRoll && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-2 rounded bg-[#1a1a1d] border border-[#2a2a2d]"
                >
                    <span className="text-xs text-[#6b6b75]">{lastRoll.notation}</span>
                    <span className="text-lg font-bold text-[#c5a059]">
                        {lastRoll.total}
                    </span>
                </motion.div>
            )}
        </div>
    );
}
