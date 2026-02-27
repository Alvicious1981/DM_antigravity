import React, { useState, useMemo } from 'react';
import { useAgentState, Spell as GameSpell } from '../../hooks/useAgentState';
import { Spell as StitchSpell, SpellbookData as StitchSpellbookData } from '../../data/stitch/spellbookData';

export interface SpellbookProps {
    onNavigate?: (path: string) => void;
}

export function Spellbook({
    onNavigate
}: SpellbookProps) {
    const { spells, castSpell } = useAgentState() as any;
    const [activeCircle, setActiveCircle] = useState(0); // 0 for Cantrips
    const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);

    const circles = useMemo(() => {
        const levels = Array.from(new Set(spells.map((s: GameSpell) => s.level))).sort() as number[];
        return levels.map(l => ({
            id: l,
            label: l === 0 ? '0' : l.toString(),
            active: activeCircle === l
        }));
    }, [spells, activeCircle]);

    const mapSpell = (s: GameSpell): StitchSpell => ({
        id: s.id,
        name: s.name,
        school: s.school,
        level: s.level === 0 ? 'Truco' : `Nivel ${s.level}`,
        circle: s.level,
        icon: s.is_attack ? 'bolt' : 'auto_awesome',
        description: [s.description],
        dropCap: s.name.charAt(0),
        stats: [
            { label: 'Tiempo', value: s.casting_time, icon: 'hourglass_top' },
            { label: 'Alcance', value: s.range, icon: 'arrow_range' },
            { label: 'Componentes', value: s.components, icon: 'diamond' },
            { label: 'Duración', value: s.duration, icon: 'history_edu' }
        ]
    });

    const filteredSpells = useMemo(() =>
        spells.filter((s: GameSpell) => s.level === activeCircle).map(mapSpell),
        [spells, activeCircle]);

    const selectedSpell = useMemo(() => {
        const found = spells.find((s: GameSpell) => s.id === selectedSpellId);
        return found ? mapSpell(found) : filteredSpells[0];
    }, [spells, selectedSpellId, filteredSpells]);

    // Update selected spell if it becomes null
    if (!selectedSpellId && filteredSpells.length > 0) {
        setSelectedSpellId(filteredSpells[0].id);
    }

    // Guard: render empty state when no spells available
    if (spells.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#1a120b] text-[#d4c5b0]">
                <div className="fixed inset-0 bg-leather-dark opacity-80 z-[-1]" />
                <span className="material-symbols-outlined text-6xl mb-4 opacity-30">auto_stories</span>
                <h2 className="font-display text-2xl font-bold tracking-widest uppercase mb-2">Grimorio Vacío</h2>
                <p className="text-sm italic opacity-60">Aún no tienes hechizos en tu grimorio.</p>
            </div>
        );
    }

    return (
        <div className="relative z-10 flex flex-col h-screen w-full max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10 font-body select-none">

            {/* Ambient Background / Desk Surface (handled by parent or top-level layout) */}
            <div className="fixed inset-0 bg-leather-dark bg-leather-texture opacity-80 z-[-1] pointer-events-none"></div>
            <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-[-1] pointer-events-none"></div>

            {/* Header Tabs */}
            <header className="flex justify-between items-end px-12 mb-[-10px] relative z-20 mx-auto w-full max-w-[1200px]">
                <div className="flex items-center gap-4 text-parchment opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-3xl">menu_book</span>
                    <h1 className="font-display font-bold text-xl tracking-widest hidden md:block text-[#d4c5b0]">GRIMORIO</h1>
                </div>
                <nav className="flex gap-2">
                    {['DIARIO', 'GRIMORIO', 'PERSONAJE', 'INVENTARIO'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onNavigate?.(tab.toLowerCase())}
                            className={`px-6 py-2 rounded-t-lg border-t border-x font-display text-sm font-bold tracking-wider transition-all transform ${tab === 'GRIMORIO'
                                ? 'bg-primary text-white py-3 border-primary-dark shadow-[0_0_15px_rgba(115,17,212,0.5)] z-20 translate-y-0'
                                : 'bg-[#2a1d15] text-[#d4c5b0] border-[#3e2b20] hover:bg-[#3e2b20] shadow-lg translate-y-2 hover:translate-y-0 z-10'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div className="w-24"></div>
            </header>

            {/* The Book Container */}
            <div className="flex-1 relative flex justify-center items-center perspective-1000">
                <div className="relative flex w-full max-w-[1200px] aspect-[1.4/1] bg-[#1a120b] rounded-lg shadow-book border-8 border-[#2a1d15] overflow-hidden">

                    {/* Center Binding/Spine Shadow */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-16 -ml-8 bg-gradient-to-r from-black/40 via-black/10 to-black/40 z-30 pointer-events-none mix-blend-multiply"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#1a0f05] z-40 opacity-50"></div>

                    {/* Bookmark Tabs (Vertical) */}
                    <div className="absolute -left-3 top-20 flex flex-col gap-3 z-50">
                        {circles.map((circle) => (
                            <button
                                key={circle.id}
                                onClick={() => setActiveCircle(circle.id)}
                                className={`flex items-center justify-center rounded-l-md shadow-md transition-all border-r border-black/20 group relative overflow-hidden font-display font-bold text-xs ${activeCircle === circle.id
                                    ? 'w-10 h-14 bg-primary text-white'
                                    : 'w-8 h-12 bg-[#5c5042] text-[#d4c5b0] hover:w-10 hover:bg-[#3e2b20]'
                                    }`}
                            >
                                <span className="rotate-[-90deg]">Círculo {circle.label}</span>
                                <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${activeCircle === circle.id ? 'from-white/10 to-black/10' : 'from-white/5 to-black/20'
                                    }`} />
                            </button>
                        ))}
                    </div>

                    {/* Left Page (List) */}
                    <div className="flex-1 bg-parchment bg-parchment-texture relative p-8 md:p-12 shadow-inner-page flex flex-col border-r border-[#d1c7b7]">
                        <div className="absolute top-4 left-4 right-12 h-px bg-ink opacity-10"></div>
                        <div className="absolute bottom-4 left-4 right-12 h-px bg-ink opacity-10"></div>

                        <Header title={`Círculo ${activeCircle === 0 ? '0' : activeCircle}`} subtitle="Hechizos Conocidos" />

                        <div className="spell-scroll overflow-y-auto pr-4 flex-1 space-y-3 custom-scrollbar">
                            {filteredSpells.length > 0 ? (
                                filteredSpells.map((spell: any) => (
                                    <SpellItem
                                        key={spell.id}
                                        spell={spell}
                                        active={selectedSpellId === spell.id}
                                        onClick={() => setSelectedSpellId(spell.id)}
                                    />
                                ))
                            ) : (
                                <p className="text-ink-light italic text-center mt-10">No hay hechizos en este círculo.</p>
                            )}
                        </div>
                        {filteredSpells.length > 5 && (
                            <div className="mt-4 flex justify-center opacity-40">
                                <span className="material-symbols-outlined text-ink text-2xl animate-bounce">more_horiz</span>
                            </div>
                        )}
                    </div>

                    {/* Right Page (Details) */}
                    <div className="flex-1 bg-parchment bg-parchment-texture relative p-8 md:p-12 shadow-inner-page-right flex flex-col overflow-hidden">
                        <div className="absolute top-4 left-12 right-4 h-px bg-ink opacity-10"></div>
                        <div className="absolute bottom-4 left-12 right-4 h-px bg-ink opacity-10"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col">
                                <h2 className="font-display text-4xl text-ink font-black tracking-tight leading-none mb-1 uppercase">
                                    {selectedSpell.name}
                                </h2>
                                <span className="font-display text-sm text-primary font-bold tracking-[0.2em] uppercase">
                                    {selectedSpell.school}
                                </span>
                            </div>
                            <div className="w-12 h-12 border-2 border-ink rounded-full flex items-center justify-center opacity-80 rotate-12 shrink-0">
                                <span className="font-display font-bold text-xl text-ink">
                                    {selectedSpell ? selectedSpell.circle : '?'}
                                </span>
                            </div>
                        </div>

                        {selectedSpell.imageUrl && (
                            <div className="relative w-full aspect-video mb-6 border-2 border-ink/80 rounded-sm overflow-hidden shadow-sm group">
                                <div className="absolute inset-0 bg-[#e3dac9] opacity-20 mix-blend-multiply z-10" />
                                <img
                                    src={selectedSpell.imageUrl}
                                    alt={selectedSpell.name}
                                    className="w-full h-full object-cover sepia-[.7] contrast-125 brightness-90 grayscale-[0.5] group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-ink z-20" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-ink z-20" />
                            </div>
                        )}

                        <div className="spell-scroll overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            <div className="prose prose-stone prose-sm max-w-none text-ink leading-relaxed font-serif relative">
                                {selectedSpell.marginalNote && (
                                    <div className="absolute -right-4 top-0 w-32 transform rotate-2 hidden lg:block z-10">
                                        <p className="font-handwriting text-[10px] text-primary font-bold border-l-2 border-primary pl-2 opacity-80 italic bg-[#e3dac9]/80 rounded-r shadow-sm py-1">
                                            {selectedSpell.marginalNote}
                                        </p>
                                    </div>
                                )}
                                <p>
                                    <span className="drop-cap">{selectedSpell.dropCap}</span>
                                    {selectedSpell.description[0]}
                                </p>
                                {selectedSpell.description.slice(1).map((para: string, i: number) => (
                                    <p key={i} className="mt-2 indent-4">
                                        {para}
                                    </p>
                                ))}
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-ink/40 to-transparent my-6" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {selectedSpell.stats.map((stat: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-ink-light text-lg">{stat.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-widest text-ink-light font-bold leading-none">{stat.label}</span>
                                            <span className="text-ink font-bold text-sm">{stat.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cast Button */}
                        <div className="flex justify-end mt-4 shrink-0">
                            <button
                                onClick={() => selectedSpell && castSpell("enemy", selectedSpell.id)}
                                className="relative group cursor-pointer overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#e3dac9]"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <div className="relative flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-dark px-8 py-3 rounded-full text-white shadow-lg group-hover:shadow-[0_0_25px_rgba(115,17,212,0.6)] transition-all duration-300 transform group-hover:-translate-y-1">
                                    <span className="material-symbols-outlined animate-pulse">auto_awesome</span>
                                    <span className="font-display font-bold tracking-[0.15em] text-sm uppercase">LANZAR HECHIZO</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center mt-4 opacity-40 hover:opacity-100 transition-opacity z-20">
                <p className="text-[#d4c5b0] text-xs font-serif italic">Presiona 'ESC' para cerrar el grimorio • Último guardado: Hace 5 minutos</p>
            </footer>
        </div>
    );
}

function Header({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="mb-6 flex flex-col items-center border-b-2 border-ink border-opacity-20 pb-4">
            <h2 className="font-display text-3xl text-ink font-bold tracking-widest uppercase">{title}</h2>
            <span className="text-ink-light italic text-sm font-serif mt-1">{subtitle}</span>
            <div className="w-16 h-1 bg-primary mt-2 rounded-full opacity-60"></div>
        </div>
    );
}

function SpellItem({ spell, active, onClick }: { spell: StitchSpell, active: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`group flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${active
                ? 'bg-ink/5 border-primary/30'
                : 'border-transparent hover:bg-ink/5 hover:border-ink/10'
                }`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center bg-parchment shadow-sm transition-colors shrink-0 ${active ? 'border-primary' : 'border-ink/20 group-hover:border-ink/40'
                }`}>
                <span className={`material-symbols-outlined text-xl ${active ? 'text-primary' : 'text-ink'}`}>
                    {spell.icon}
                </span>
            </div>
            <div className="flex-1">
                <h3 className={`font-display font-bold text-lg transition-colors ${active ? 'text-primary' : 'text-ink group-hover:text-ink-light'}`}>
                    {spell.name}
                </h3>
                <p className="text-xs text-ink-light italic">{spell.school} • {spell.level}</p>
            </div>
            {active && <span className="material-symbols-outlined text-primary/50 text-lg">ink_highlighter</span>}
        </div>
    );
}
