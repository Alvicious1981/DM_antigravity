"use client";

import { useState, useMemo } from "react";
import { Spell } from "./useAgentState";

export type SpellLevelFilter = number | "all";

export function useSpells(spells: Spell[]) {
    const [selectedLevel, setSelectedLevel] = useState<SpellLevelFilter>("all");
    const [selectedLanguage, setSelectedLanguage] = useState<"en" | "es">("es");
    const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSpells = useMemo(() => {
        let list = spells;

        // Filter by level
        if (selectedLevel !== "all") {
            list = list.filter((s) => s.level === selectedLevel);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter((s) =>
                s.name.toLowerCase().includes(query) ||
                (s.name_es && s.name_es.toLowerCase().includes(query))
            );
        }

        return list;
    }, [spells, selectedLevel, searchQuery]);

    const availableLevels = useMemo(() => {
        return Array.from(new Set(spells.map((s) => s.level))).sort((a, b) => a - b);
    }, [spells]);

    const toggleLanguage = () => {
        setSelectedLanguage((prev) => (prev === "es" ? "en" : "es"));
    };

    const toggleExpand = (id: string) => {
        setExpandedSpellId((prev) => (prev === id ? null : id));
    };

    return {
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
    };
}
