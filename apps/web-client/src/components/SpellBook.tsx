"use client";

import { useSpells } from "../hooks/useSpells";
import SpellFilterBar from "./SpellBook/SpellFilterBar";
import SpellList from "./SpellBook/SpellList";

interface SpellBookProps {
    spells: any[];
    onCast: (spellId: string) => void;
}

export default function SpellBook({ spells, onCast }: SpellBookProps) {
    const {
        selectedLevel,
        setSelectedLevel,
        selectedLanguage,
        toggleLanguage,
        expandedSpellId,
        toggleExpand,
        filteredSpells,
        availableLevels,
        searchQuery,
        setSearchQuery,
    } = useSpells(spells);

    return (
        <div className="h-full flex flex-col space-y-4">
            <SpellFilterBar
                levels={availableLevels}
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
                selectedLanguage={selectedLanguage}
                onToggleLanguage={toggleLanguage}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <SpellList
                spells={filteredSpells}
                expandedSpellId={expandedSpellId}
                language={selectedLanguage}
                onToggleExpand={toggleExpand}
                onCast={onCast}
            />
        </div>
    );
}
