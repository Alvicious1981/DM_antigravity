"use client";

import { Spell } from "../../hooks/useAgentState";
import SpellCard from "./SpellCard";

interface SpellListProps {
    spells: Spell[];
    expandedSpellId: string | null;
    language: "en" | "es";
    onToggleExpand: (id: string) => void;
    onCast: (spellId: string) => void;
}

export default function SpellList({
    spells,
    expandedSpellId,
    language,
    onToggleExpand,
    onCast,
}: SpellListProps) {
    if (spells.length === 0) {
        return (
            <div className="text-center py-8 text-[#6b6b75] text-sm">
                {language === "es" ? "No hay hechizos conocidos." : "No spells known."}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {spells.map((spell) => (
                <SpellCard
                    key={spell.id}
                    spell={spell}
                    isExpanded={expandedSpellId === spell.id}
                    language={language}
                    onToggleExpand={() => onToggleExpand(spell.id)}
                    onCast={onCast}
                />
            ))}
        </div>
    );
}
