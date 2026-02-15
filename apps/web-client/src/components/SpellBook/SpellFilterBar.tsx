import { Globe, Search } from "lucide-react";
import { SpellLevelFilter } from "../../hooks/useSpells";

interface SpellFilterBarProps {
    levels: number[];
    selectedLevel: SpellLevelFilter;
    onSelectLevel: (level: SpellLevelFilter) => void;
    selectedLanguage: "en" | "es";
    onToggleLanguage: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function SpellFilterBar({
    levels,
    selectedLevel,
    onSelectLevel,
    selectedLanguage,
    onToggleLanguage,
    searchQuery,
    onSearchChange,
}: SpellFilterBarProps) {
    return (
        <div className="flex flex-col gap-3 pb-2 border-b border-[#2a2a2d]">
            {/* Search Row */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b75]" size={14} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={selectedLanguage === "es" ? "Buscar hechizo..." : "Search spells..."}
                    className="w-full bg-[#1a1a1d] border border-[#2a2a2d] rounded-md py-1.5 pl-10 pr-4 text-sm text-[#e0e0e4] focus:border-[#c5a059] focus:outline-none transition-colors"
                    data-testid="spell-search-input"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <FilterButton
                        isActive={selectedLevel === "all"}
                        onClick={() => onSelectLevel("all")}
                        label={selectedLanguage === "es" ? "Todos" : "All"}
                    />
                    {levels.map((lvl) => (
                        <FilterButton
                            key={lvl}
                            isActive={selectedLevel === lvl}
                            onClick={() => onSelectLevel(lvl)}
                            label={
                                selectedLanguage === "es"
                                    ? (lvl === 0 ? "Trucos" : `Nivel ${lvl}`)
                                    : (lvl === 0 ? "Cantrips" : `Level ${lvl}`)
                            }
                        />
                    ))}
                </div>

                <LanguageToggle
                    lang={selectedLanguage}
                    onToggle={onToggleLanguage}
                />
            </div>
        </div>
    );
}

function FilterButton({
    isActive,
    onClick,
    label,
}: {
    isActive: boolean;
    onClick: () => void;
    label: string;
}) {
    const baseClasses = "px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors";
    const activeClasses = "bg-[#c5a059] text-[#141416]";
    const inactiveClasses = "bg-[#1a1a1d] text-[#6b6b75] hover:text-[#b0b0b8] border border-[#2a2a2d]";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
}

function LanguageToggle({
    lang,
    onToggle,
}: {
    lang: "en" | "es";
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="ml-2 p-1.5 rounded bg-[#1a1a1d] border border-[#2a2a2d] text-[#6b6b75] hover:text-[#c5a059] transition-colors"
            title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
        >
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold">
                <Globe size={12} />
                <span>{lang.toUpperCase()}</span>
            </div>
        </button>
    );
}
