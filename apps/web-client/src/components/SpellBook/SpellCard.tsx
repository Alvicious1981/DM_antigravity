import { motion, AnimatePresence } from "framer-motion";
import { Spell } from "../../hooks/useAgentState";
import { Flame, Skull, Zap, Cross, Wind, Sparkles, Scroll } from "lucide-react";
import SpellCardDetails from "./SpellCardDetails";

interface SpellCardProps {
    spell: Spell;
    isExpanded: boolean;
    language: "en" | "es";
    onToggleExpand: () => void;
    onCast: (spellId: string) => void;
}

const SCHOOL_ICONS: Record<string, any> = {
    Evocation: Flame,
    Necromancy: Skull,
    Conjuration: Zap,
    Abjuration: Cross,
    Transmutation: Wind,
    Divination: Sparkles,
    Enchantment: Sparkles,
    Illusion: Sparkles,
};

export default function SpellCard({
    spell,
    isExpanded,
    language,
    onToggleExpand,
    onCast,
}: SpellCardProps) {
    const Icon = SCHOOL_ICONS[spell.school] || Scroll;
    const isEs = language === "es";
    const displayName = (isEs && spell.name_es) || spell.name;
    const displayDesc = (isEs && spell.description_es) || spell.description;

    const containerStyle = isExpanded
        ? "border-[#c5a059]/50 bg-[#1a1a1d]"
        : "border-[#2a2a2d] bg-[#141416]";

    return (
        <motion.div
            layout
            className={`rounded-lg border ${containerStyle} overflow-hidden transition-colors`}
            data-testid={`spell-card-${spell.id}`}
        >
            <SpellCardHeader
                spell={spell}
                displayName={displayName}
                language={language}
                Icon={Icon}
                onToggle={onToggleExpand}
            />

            <AnimatePresence>
                {isExpanded && (
                    <SpellCardDetails
                        spell={spell}
                        displayDescription={displayDesc}
                        language={language}
                        onCast={onCast}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SpellCardHeader({
    spell,
    displayName,
    language,
    Icon,
    onToggle,
}: {
    spell: Spell;
    displayName: string;
    language: "en" | "es";
    Icon: any;
    onToggle: () => void;
}) {
    return (
        <div
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1d]"
            onClick={onToggle}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-[#0a0a0c] border border-[#2a2a2d] text-[#c5a059]`}>
                    <Icon size={16} />
                </div>
                <div>
                    <h4 className="font-bold text-[#e4e4e7] text-sm font-cinzel">
                        {displayName}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#6b6b75] uppercase tracking-wider">
                        <span>
                            {language === "es"
                                ? (spell.level === 0 ? "Truco" : `Nvl ${spell.level}`)
                                : (spell.level === 0 ? "Cantrip" : `Lvl ${spell.level}`)
                            }
                        </span>
                        <span>•</span>
                        <span>{spell.school}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-1">
                {spell.is_attack && <Tag type="attack" />}
                {spell.is_save && <Tag type="save" />}
            </div>
        </div>
    );
}

function Tag({ type }: { type: "attack" | "save" }) {
    const isAttack = type === "attack";
    const colors = isAttack
        ? "border-red-900/50 bg-red-900/20 text-red-400"
        : "border-blue-900/50 bg-blue-900/20 text-blue-400";

    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors} font-mono`}>
            {isAttack ? "ATK" : "SAVE"}
        </span>
    );
}
