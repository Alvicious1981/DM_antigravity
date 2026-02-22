import React, { useState } from 'react';
import { useAgentState } from '../../hooks/useAgentState';
import { StoryLogEntry } from '../../data/stitch/gameplayHudData';

export interface GameplayHudProps {
    onAction?: (actionId: string) => void;
    onSendMessage?: (message: string) => void;
}

export function GameplayHud({
    onAction,
    onSendMessage
}: GameplayHudProps) {
    const {
        narrative,
        currentNarrative,
        isStreaming,
        combatants,
        sendAction,
        inventory
    } = useAgentState() as any;

    const [inputText, setInputText] = useState('');

    const player = combatants.find((c: any) => c.isPlayer) || {
        name: 'Player',
        stats: { hp: { current: 10, max: 10 }, spellSlots: { current: 0, max: 0 } },
        class: 'Adventurer',
        level: 1,
        portraitUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=2069&auto=format&fit=crop'
    };

    const logEntries: StoryLogEntry[] = narrative.map((text: string, i: number) => ({
        id: `nar-${i}`,
        type: 'narrative' as const,
        content: text
    }));

    if (isStreaming && currentNarrative) {
        logEntries.push({
            id: 'streaming',
            type: 'narrative' as const,
            content: currentNarrative
        });
    }

    // Default actions if none provided
    const actions = [
        { id: 'attack', label: 'Ataque', type: 'combat', category: 'Acción Principal', icon: 'swords', subtext: '85% Prob.', colorClass: 'bg-red-600', borderColorClass: 'border-red-900/40', outcome: '-2d8 HP' },
        { id: 'dodge', label: 'Esquivar', type: 'investigation', category: 'Reacción', icon: 'shield', subtext: '+4 CA', colorClass: 'bg-amber-600', borderColorClass: 'border-amber-900/40' },
        { id: 'cast', label: 'Conjurar', type: 'charisma', category: 'Hechizo', icon: 'auto_stories', subtext: 'Consumo: 1', colorClass: 'bg-blue-600', borderColorClass: 'border-blue-900/40' }
    ];

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage?.(inputText);
            setInputText('');
        }
    };

    return (
        <div className="relative flex flex-col h-screen w-full bg-[#1a1110] bg-leather-texture font-body text-slate-200 overflow-hidden border-[6px] border-[#2d1b19] shadow-inner select-none">

            {/* Header */}
            <header className="z-50 h-20 shrink-0 bg-[#0f0a0a] border-b-4 border-[#4a3b32] flex items-end justify-between px-8 relative shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 z-0"></div>
                <div className="flex items-center gap-4 pb-4 self-center relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#b91c1c] blur-md opacity-40 rounded-full"></div>
                        <span className="material-symbols-outlined text-[#d4af37] text-4xl drop-shadow-md">shield_with_house</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-display font-bold tracking-widest text-[#e5e5e5] uppercase text-engraved">Dragons & Dungeons</h1>
                        <span className="text-[10px] text-[#b91c1c] font-bold tracking-[0.3em] uppercase">Gilded Edition</span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex h-12 items-end gap-1 relative z-10 translate-y-[2px]">
                    <Tab active label="Historia" icon="history_edu" />
                    <Tab label="Personaje" icon="badge" />
                    <Tab label="Grimorio" icon="auto_stories" />
                    <Tab label="Inventario" icon="backpack" />
                </nav>

                {/* Character Quick Info */}
                <div className="pb-4 self-center flex items-center gap-4 relative z-10">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest font-display">Lvl {player.level || 1} {player.class || 'Clave'}</span>
                        <span className="text-white text-sm font-medium tracking-wide">{player.name}</span>
                    </div>
                    <div
                        className="size-12 rounded-full border-[3px] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)] bg-cover bg-center relative"
                        style={{ backgroundImage: `url('${player.portraitUrl}')` }}
                    >
                        <div className="absolute -bottom-1 -right-1 bg-[#b91c1c] text-[10px] font-bold text-white px-1.5 py-0.5 rounded border border-[#7f1d1d]">HP</div>
                    </div>
                </div>
            </header>

            {/* Main Body */}
            <main className="flex flex-1 overflow-hidden relative">

                {/* Story Area (Left 80%) */}
                <section className="flex flex-col w-4/5 h-full relative border-r-8 border-[#1a1110] shadow-[10px_0_20px_rgba(0,0,0,0.5)] z-10">
                    <div className="absolute inset-2 top-0 bottom-0 bg-parchment-scroll z-0 overflow-hidden shadow-inner border-x-[12px] border-double border-[#d4af37]">
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#cbbfae] to-transparent z-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#cbbfae] to-transparent z-10"></div>
                    </div>

                    {/* Log Content */}
                    <div className="relative z-10 flex-1 overflow-y-auto px-20 py-12 scroll-smooth custom-scrollbar-wide bg-transparent">
                        <div className="max-w-4xl mx-auto flex flex-col gap-10 pb-32">
                            <div className="flex items-center justify-center gap-4 opacity-70">
                                <div className="h-px w-16 bg-[#5c4d3c]"></div>
                                <span className="text-[#5c4d3c] font-display text-sm font-bold uppercase tracking-[0.2em]">Ocasion Actual</span>
                                <div className="h-px w-16 bg-[#5c4d3c]"></div>
                            </div>

                            {logEntries.map((entry) => (
                                <LogEntry key={entry.id} entry={entry} />
                            ))}
                        </div>
                    </div>

                    {/* Action Input Bar */}
                    <div className="relative z-20 shrink-0 bg-[#1c1c1c] border-t-[6px] border-[#4a3b32] p-8 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] bg-basalt-texture">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2d1b19] border border-[#d4af37] rounded-full flex justify-center items-center z-30">
                            <div className="w-2 h-2 rotate-45 bg-[#d4af37]"></div>
                        </div>
                        <div className="max-w-4xl mx-auto flex gap-6 items-stretch h-20">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-0 bg-[#0a0a0a] rounded border-2 border-[#3d2b25] group-focus-within:border-[#d4af37] group-focus-within:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300"></div>
                                <input
                                    className="relative w-full h-full bg-transparent border-none text-2xl text-[#eaddcf] placeholder-[#5c4d3c] focus:ring-0 px-8 font-body italic"
                                    placeholder="Describe your action..."
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                className="relative w-24 shrink-0 group perspective-1000"
                            >
                                <div className="absolute inset-0 bg-magma-glow rounded-xl transform transition-transform group-hover:translate-y-[-4px] group-active:translate-y-[2px] shadow-[0_0_20px_rgba(255, 69, 0, 0.6)] border-2 border-[#ffaa00] flex items-center justify-center overflow-hidden magma-pulse">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cracked-ground.png')] opacity-60 mix-blend-multiply"></div>
                                    <svg className="w-12 h-12 text-[#fff5e6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] relative z-10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 7l10 5 10-5M2 7v10l10 5 10-5V7"></path>
                                        <path d="M12 22V12"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>
                        <div className="max-w-4xl mx-auto mt-3 flex justify-between text-xs text-[#8a7e57] uppercase tracking-[0.2em] font-bold font-display">
                            <span>Free Action Mode</span>
                            <span>Press Enter to roll</span>
                        </div>
                    </div>
                </section>

                {/* Actions Sidebar (Right 20%) */}
                <aside className="w-1/5 bg-[#1c1c1c] flex flex-col border-l border-[#2d1b19] bg-basalt-texture relative shadow-[inset_15px_0_30px_rgba(0,0,0,0.7)] z-20">
                    <div className="p-6 border-b-2 border-[#333] bg-gradient-to-r from-[#141414] to-transparent sticky top-0 z-10 backdrop-blur-md">
                        <h2 className="text-[#e5e5e5] text-sm font-display font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-2 text-gold-glow">
                            <span className="material-symbols-outlined text-[#d4af37] text-lg">bolt</span>
                            Actions
                        </h2>
                        <div className="h-0.5 w-full bg-gradient-to-r from-[#d4af37] via-transparent to-transparent opacity-50"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => onAction?.(action.id)}
                                className={`group flex flex-col gap-2 w-full p-0 bg-[#242424] border ${action.borderColorClass} rounded-sm hover:border-white/20 transition-all text-left relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${action.colorClass} group-hover:bg-white h-full transition-all`} />
                                <div className="p-4 relative z-10">
                                    <div className="flex justify-between items-start w-full mb-1">
                                        <span className="text-slate-200 font-bold text-lg leading-tight font-display tracking-wide group-hover:text-white uppercase">
                                            {action.label}
                                        </span>
                                    </div>
                                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider mb-3 font-bold border ${getCategoryStyle(action.type)}`}>
                                        {action.category}
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm group-hover:text-gray-200">
                                        <span className="material-symbols-outlined text-base">{action.icon}</span>
                                        <span className="italic">{action.subtext}</span>
                                    </div>
                                    {action.outcome && (
                                        <div className="mt-3 pt-2 border-t border-[#333] flex justify-between items-center">
                                            <span className="text-xs text-red-500 font-bold group-hover:text-red-400 transition-colors">{action.outcome}</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats Footer */}
                    <div className="p-4 bg-[#141414] border-t-2 border-[#333] grid grid-cols-2 gap-3 text-center">
                        <div className="flex flex-col bg-[#2d1b19] p-2 rounded border border-[#b91c1c]/30 shadow-inner">
                            <span className="text-[10px] text-[#e5e5e5] uppercase tracking-widest font-bold mb-1">Hit Points</span>
                            <span className="text-[#b91c1c] font-display font-bold text-xl drop-shadow-sm">{(player.stats?.hp?.current ?? 0)} / {(player.stats?.hp?.max ?? 0)}</span>
                        </div>
                        <div className="flex flex-col bg-[#1a1a1a] p-2 rounded border border-[#333] shadow-inner">
                            <span className="text-[10px] text-[#e5e5e5] uppercase tracking-widest font-bold mb-1">Spell Slots</span>
                            <span className="text-blue-400 font-display font-bold text-xl drop-shadow-sm">{(player.stats?.spellSlots?.current ?? 0)} / {(player.stats?.spellSlots?.max ?? 0)}</span>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

function Tab({ active = false, label, icon }: { active?: boolean, label: string, icon: string }) {
    if (active) {
        return (
            <a className="group relative px-8 py-2 bg-gradient-to-b from-[#e8e8e8] to-[#999999] rounded-t-lg shadow-[0_-2px_5px_rgba(0,0,0,0.5)] border-x border-t border-[#666] transform scale-105 z-20" href="#">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30 rounded-t-lg"></div>
                <div className="relative flex items-center gap-2 text-[#1a1a1a]">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                    <span className="font-display font-bold text-sm uppercase tracking-wider text-engraved">{label}</span>
                </div>
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#555] shadow-inner"></div>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#555] shadow-inner"></div>
            </a>
        );
    }
    return (
        <a className="group relative px-6 py-2 bg-gradient-to-b from-[#5a5a5a] to-[#2b2b2b] rounded-t-md hover:from-[#6a6a6a] hover:to-[#3b3b3b] transition-all border-x border-t border-[#1a1a1a] mt-2" href="#">
            <div className="relative flex items-center gap-2 text-[#a0a0a0] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">{icon}</span>
                <span className="font-display font-bold text-xs uppercase tracking-wider">{label}</span>
            </div>
        </a>
    );
}

function LogEntry({ entry }: { entry: StoryLogEntry }) {
    switch (entry.type) {
        case 'narrative':
            return (
                <div className="prose prose-xl prose-p:text-[#2c1810] prose-headings:text-[#1a0f0a] font-body">
                    <p className="first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:font-bold first-letter:text-[#8a0b20] leading-loose text-xl drop-shadow-sm">
                        {entry.content}
                    </p>
                </div>
            );
        case 'dialogue':
            return (
                <div className="flex gap-5 p-6 bg-[#d8cbb8]/40 rounded-sm border-l-4 border-[#8a0b20] shadow-sm backdrop-blur-[1px]">
                    {entry.actor && (
                        <div
                            className="size-14 min-w-[3.5rem] rounded-full bg-cover bg-center border-2 border-[#8a7e57] shadow-md grayscale-[0.2] sepia-[0.3]"
                            style={{ backgroundImage: `url('${entry.actor.imageUrl}')` }}
                        />
                    )}
                    <div className="flex flex-col gap-2">
                        <span className="text-[#5a2e2e] font-display font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            {entry.actor?.name || 'Unknown'}
                        </span>
                        <p className="text-[#2c1810] italic text-xl font-serif">{entry.content}</p>
                    </div>
                </div>
            );
        case 'combat':
            return (
                <div className="flex flex-col gap-3 bg-red-50/50 p-4 border border-red-900/10 rounded">
                    <div className="flex justify-between items-baseline border-b border-red-900/20 pb-2">
                        <h3 className="text-[#8a0b20] font-display font-bold text-xl uppercase tracking-wide">{entry.combatInfo?.title}</h3>
                        <span className="bg-[#8a0b20] text-[#eaddcf] px-2 py-0.5 text-xs font-bold rounded-sm tracking-widest uppercase">
                            ROUND {entry.combatInfo?.round}
                        </span>
                    </div>
                    <p className="text-[#3d2b25] text-lg leading-relaxed">
                        {entry.content}
                        <br />
                        {entry.combatInfo?.hit && (
                            <span className="text-[#b91c1c] font-bold">Hit! </span>
                        )}
                        ({entry.combatInfo?.val1}). You take <span className="font-bold text-[#b91c1c] text-xl">{entry.combatInfo?.val2}</span> damage.
                    </p>
                </div>
            );
        case 'choice':
            return (
                <div className="self-end max-w-[85%] bg-white/60 p-6 rounded-tr-xl rounded-tl-xl rounded-bl-xl border border-[#d4af37]/30 shadow-md transform rotate-1">
                    <p className="text-[#8a7e57] text-xs font-bold uppercase mb-2 tracking-widest">{entry.choiceLabel}</p>
                    <p className="text-[#1a0f0a] text-xl font-medium font-display">{entry.content}</p>
                </div>
            );
        default:
            return null;
    }
}

function getCategoryStyle(type: string) {
    switch (type) {
        case 'combat': return 'bg-[#3a0a0a] text-red-400 border-red-900';
        case 'investigation': return 'bg-[#2a1a0a] text-amber-400 border-amber-900';
        case 'charisma': return 'bg-[#0a1a3a] text-blue-400 border-blue-900';
        default: return 'bg-gray-900 text-gray-400 border-gray-700';
    }
}
