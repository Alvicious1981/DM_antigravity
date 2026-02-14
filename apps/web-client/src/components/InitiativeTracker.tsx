"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Combatant {
    id: string;
    name: string;
    initiative: number;
    active: boolean;
    current?: boolean;
    isPlayer?: boolean;
}

interface InitiativeTrackerProps {
    combatants: Combatant[];
    currentRound?: number;
}

export default function InitiativeTracker({ combatants, currentRound = 0 }: InitiativeTrackerProps) {
    return (
        <div className="space-y-3">
            {/* Round Counter */}
            {currentRound > 0 && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#f1c40f]/30 bg-[#f1c40f]/5"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-[#f1c40f]">
                        Ronda
                    </span>
                    <span className="text-lg font-bold text-[#f1c40f]" style={{ fontFamily: "var(--font-cinzel)" }}>
                        {currentRound}
                    </span>
                </motion.div>
            )}

            {/* Combatant List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {combatants.map((combatant, index) => {
                        const isCurrent = combatant.current;
                        const isInactive = !combatant.active;

                        return (
                            <motion.div
                                key={combatant.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{
                                    opacity: isInactive ? 0.4 : 1,
                                    x: 0,
                                }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                                className={`relative rounded-lg border p-3 transition-all duration-300 ${isCurrent
                                        ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                                        : "border-[#2a2a2d] bg-[#1a1a1d]"
                                    }`}
                                style={{
                                    filter: isInactive ? "grayscale(1)" : "none",
                                }}
                            >
                                {/* Current Turn Indicator */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#c5a059]"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [1, 0.5, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />
                                )}

                                <div className="flex items-center justify-between">
                                    {/* Name + Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">
                                            {combatant.isPlayer ? "⚔️" : "💀"}
                                        </span>
                                        <div>
                                            <p
                                                className={`text-sm font-semibold ${isCurrent ? "text-[#c5a059]" : "text-[#e0e0e4]"
                                                    }`}
                                            >
                                                {combatant.name}
                                            </p>
                                            {isInactive && (
                                                <p className="text-[10px] uppercase tracking-wider text-[#6b6b75]">
                                                    Inactivo
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Initiative Value */}
                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-widest text-[#6b6b75]">Init</p>
                                        <p
                                            className={`text-lg font-bold ${isCurrent ? "text-[#c5a059]" : "text-[#b0b0b8]"
                                                }`}
                                            style={{ fontFamily: "var(--font-geist-mono)" }}
                                        >
                                            {combatant.initiative}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {combatants.length === 0 && (
                <div className="rounded-lg border border-[#2a2a2d]/50 border-dashed bg-[#1a1a1d]/50 p-6 text-center">
                    <p className="text-xs text-[#6b6b75] italic">
                        Tira Iniciativa para comenzar el combate
                    </p>
                </div>
            )}
        </div>
    );
}
