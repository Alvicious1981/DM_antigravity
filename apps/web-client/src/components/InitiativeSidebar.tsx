"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentState, Combatant } from "../hooks/useAgentState";
import { Skull, Heart, Shield, Sword } from "lucide-react";

export default function InitiativeSidebar() {
    const { combatants, connected } = useAgentState();

    if (!connected || combatants.length === 0) return null;

    // Sort by initiative descending
    const sortedCombatants = [...combatants].sort((a, b) => b.initiative - a.initiative);

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-64 bg-[#141416]/90 border-l border-[#2a2a2d] flex flex-col h-full z-30 shadow-2xl backdrop-blur-md"
        >
            <div className="p-4 border-b border-[#2a2a2d] bg-[#1a1a1d] flex items-center justify-between">
                <h3 className="font-cinzel text-[#c5a059] font-bold tracking-widest text-sm flex items-center gap-2">
                    <Sword className="w-4 h-4" /> INITIATIVE
                </h3>
                <span className="text-[10px] text-stone-500 font-mono">ROUND {1}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                <AnimatePresence mode="popLayout">
                    {sortedCombatants.map((c) => (
                        <CombatantCard key={c.id} combatant={c} />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function CombatantCard({ combatant }: { combatant: Combatant }) {
    const hpMax = combatant.hp_max || 20;
    const hpCurrent = combatant.hp_current ?? hpMax;
    const hpPercent = Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100));

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                borderColor: combatant.current ? "#c5a059" : "#2a2a2d",
                backgroundColor: combatant.current ? "rgba(197, 160, 89, 0.05)" : "rgba(20, 20, 22, 0.5)"
            }}
            className={`p-3 rounded border transition-colors relative overflow-hidden ${combatant.current ? 'ring-1 ring-[#c5a059]/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]' : ''
                }`}
        >
            {/* Active Turn Glow */}
            {combatant.current && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[#c5a059]/10 pointer-events-none"
                />
            )}

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-1 rounded flex items-center justify-center min-w-[1.5rem]">
                        {combatant.initiative}
                    </span>
                    <span className={`text-sm font-bold truncate max-w-[100px] ${combatant.isPlayer ? 'text-[#c5a059]' : 'text-stone-300'}`}>
                        {combatant.name}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Shield className="w-3 h-3" />
                    <span>{combatant.ac || 10}</span>
                </div>
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <div className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 ${hpPercent < 30 ? 'text-red-500 animate-pulse' : 'text-stone-500'}`} />
                        <span className={hpPercent < 30 ? 'text-red-400 font-bold' : 'text-stone-400'}>
                            {hpCurrent}/{hpMax}
                        </span>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${hpPercent}%`,
                            backgroundColor: hpPercent < 30 ? "#ef4444" : hpPercent < 60 ? "#f59e0b" : "#c5a059"
                        }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        className="h-full shadow-[0_0_8px_rgba(197,160,89,0.3)]"
                    />
                </div>
            </div>

            {/* Conditions */}
            {combatant.conditions && combatant.conditions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {combatant.conditions.map((cond, i) => {
                        const name = typeof cond === 'string' ? cond : cond.condition_id;
                        return (
                            <span key={i} className="text-[8px] uppercase tracking-tighter bg-purple-900/30 text-purple-400 px-1 border border-purple-500/20 rounded">
                                {name}
                            </span>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
