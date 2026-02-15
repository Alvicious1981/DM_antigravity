import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Spell } from "../../hooks/useAgentState";

interface SpellCardDetailsProps {
    spell: Spell;
    displayDescription: string;
    language: "en" | "es";
    onCast: (spellId: string) => void;
}

export default function SpellCardDetails({
    spell,
    displayDescription,
    language,
    onCast,
}: SpellCardDetailsProps) {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#2a2a2d] bg-[#0a0a0c]"
        >
            <div className="p-3 space-y-3 text-sm text-[#a1a1aa]">
                <StatsGrid spell={spell} language={language} />

                <p className="text-xs leading-relaxed italic border-l-2 border-[#2a2a2d] pl-2 text-[#8b8b93] whitespace-pre-wrap">
                    {displayDescription}
                </p>

                <CastButton language={language} onClick={() => onCast(spell.id)} />
            </div>
        </motion.div>
    );
}

function StatsGrid({ spell, language }: { spell: Spell; language: "en" | "es" }) {
    return (
        <div className="grid grid-cols-2 gap-2 text-xs">
            <StatItem
                label={language === "es" ? "Tiempo" : "Time"}
                value={spell.casting_time}
            />
            <StatItem
                label={language === "es" ? "Alcance" : "Range"}
                value={spell.range}
            />
            <StatItem
                label={language === "es" ? "Componentes" : "Components"}
                value={spell.components}
            />
            <StatItem
                label={language === "es" ? "Duración" : "Duration"}
                value={spell.duration}
            />
        </div>
    );
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[#52525b] uppercase tracking-wider text-[10px]">
                {label}
            </span>
            <span>{value}</span>
        </div>
    );
}

function CastButton({ language, onClick }: { language: "en" | "es"; onClick: (e: React.MouseEvent) => void }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className="w-full py-2 mt-2 bg-[#c5a059] hover:bg-[#d4b36e] text-[#141416] font-bold rounded flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs"
            data-testid="cast-spell-btn"
        >
            <Sparkles size={14} />
            {language === "es" ? "Lanzar Hechizo" : "Cast Spell"}
        </button>
    );
}
