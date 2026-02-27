import React, { useState } from 'react';
import { useAgentState } from '../../hooks/useAgentState';
import { QuestJournal } from './QuestJournal';
import { Spellbook } from './Spellbook';
import { InventoryForge } from './InventoryForge';
import PaperDoll from '../PaperDoll';
import WorldMap from '../../app/WorldMap';
import InitiativeSidebar from '../InitiativeSidebar';
import LootModal from '../../app/LootModal';

export interface GameplayHudProps {
    onAction?: (actionId: string) => void;
    onSendMessage?: (message: string) => void;
}

type GameTab = 'historia' | 'personaje' | 'grimorio' | 'inventario' | 'diario' | 'mapa';

const TABS: { id: GameTab; label: string; icon: string }[] = [
    { id: 'historia', label: 'Historia', icon: 'history_edu' },
    { id: 'personaje', label: 'Personaje', icon: 'badge' },
    { id: 'grimorio', label: 'Grimorio', icon: 'auto_stories' },
    { id: 'inventario', label: 'Inventario', icon: 'backpack' },
    { id: 'diario', label: 'Gesta', icon: 'bookmark_star' },
    { id: 'mapa', label: 'Mapa', icon: 'map' },
];

export function GameplayHud({ onAction, onSendMessage }: GameplayHudProps) {
    const {
        narrative,
        currentNarrative,
        isStreaming,
        combatants,
        sendAction,
        inventory,
        equipItem,
        unequipItem,
        lastFactPacket,
        activeWidgets,
    } = useAgentState() as any;

    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState<GameTab>('historia');

    const player = combatants.find((c: any) => c.isPlayer) || null;

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage?.(inputText);
            setInputText('');
        }
    };

    return (
        <div className="relative flex flex-col h-screen w-full bg-[#1a1110] font-body text-slate-200 overflow-hidden select-none">

            {/* ── Compact Header ── */}
            <header className="z-50 h-14 shrink-0 bg-[#0d0808] border-b-2 border-[#4a3b32] flex items-center justify-between px-4 relative shadow-2xl gap-3">
                <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')" }} />

                {/* Logo — icon only */}
                <div className="flex items-center gap-2 shrink-0 relative z-10">
                    <span className="material-symbols-outlined text-[#d4af37] text-2xl">swords</span>
                    <span className="font-display font-bold text-sm tracking-widest text-[#d4af37] uppercase hidden sm:block">D&amp;D</span>
                </div>

                {/* Tabs — icon+label, centered */}
                <nav className="flex h-full items-end gap-0.5 relative z-10 flex-1 justify-center overflow-hidden">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            title={tab.label}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-t border-t border-x font-display text-[11px] font-bold tracking-wide transition-all transform uppercase whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-[#e8e0cc] text-[#1a1a1a] border-[#8a7a5a] z-20'
                                    : 'bg-gradient-to-b from-[#4a4040] to-[#2b2020] text-[#a09080] hover:text-[#e8d8b0] border-[#2b1a18] hover:from-[#5a4a40] hover:to-[#3b2b28] translate-y-1 hover:translate-y-0 z-10'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[13px]">{tab.icon}</span>
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Player HP badge */}
                {player && (
                    <div className="flex items-center gap-2 shrink-0 relative z-10">
                        <span className="text-[#d4af37] text-xs font-bold font-display hidden xl:block truncate max-w-[120px]">{player.name}</span>
                        <div className="flex items-center gap-1 bg-[#3a1a1a] border border-[#b91c1c] rounded px-2 py-1">
                            <span className="material-symbols-outlined text-[#ef4444] text-sm">favorite</span>
                            <span className="text-white text-xs font-bold font-mono">{(player as any).hp_current ?? '?'}</span>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Main Body ── */}
            <main className="flex flex-1 overflow-hidden relative">

                {/* Historia Tab */}
                {activeTab === 'historia' && (
                    <section className="flex flex-col w-full h-full relative">
                        <div className="flex-1 overflow-y-auto px-12 py-8 space-y-6 scroll-smooth bg-[#1a1110]">
                            <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-4">
                                {narrative.map((text: string, i: number) => (
                                    <p
                                        key={i}
                                        className={`leading-loose text-lg font-serif text-[#eaddcf] ${i === 0 ? 'first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:font-bold first-letter:font-display first-letter:text-[#8a0b20]' : ''}`}
                                    >
                                        {text}
                                    </p>
                                ))}
                                {isStreaming && currentNarrative && (
                                    <p className="leading-loose text-lg font-serif text-[#eaddcf] animate-pulse">{currentNarrative}</p>
                                )}
                                {narrative.length === 0 && !isStreaming && (
                                    <p className="text-center italic text-[#5c4d3c] mt-16">The story awaits your first action…</p>
                                )}
                            </div>
                        </div>

                        {/* Action input */}
                        <div className="relative z-20 shrink-0 bg-[#1c1c1c] border-t-[6px] border-[#4a3b32] p-6 shadow-[0_-10px_50px_rgba(0,0,0,0.8)]">
                            <div className="max-w-4xl mx-auto flex gap-4 items-stretch h-16">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-[#0a0a0a] rounded border-2 border-[#3d2b25] group-focus-within:border-[#d4af37] group-focus-within:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300" />
                                    <input
                                        className="relative w-full h-full bg-transparent border-none text-xl text-[#eaddcf] placeholder-[#5c4d3c] focus:ring-0 px-6 font-body italic"
                                        placeholder="Describe your action..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    className="w-24 bg-[#2d1b19] border-2 border-[#4a3b32] hover:border-[#d4af37] text-[#d4af37] rounded flex items-center justify-center transition-all"
                                    title="Send"
                                >
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Personaje */}
                {activeTab === 'personaje' && (
                    <div className="flex-1 overflow-y-auto bg-[#181112]">
                        <PaperDoll
                            inventory={inventory}
                            character={player}
                            lastFactPacket={lastFactPacket}
                            onEquip={equipItem}
                            onUnequip={unequipItem}
                        />
                    </div>
                )}

                {/* Grimorio */}
                {activeTab === 'grimorio' && (
                    <div className="flex-1 h-full overflow-hidden">
                        <Spellbook onNavigate={tab => setActiveTab(tab as GameTab)} />
                    </div>
                )}

                {/* Inventario */}
                {activeTab === 'inventario' && (
                    <div className="flex-1 h-full overflow-hidden">
                        <InventoryForge />
                    </div>
                )}

                {/* Diario / Gesta */}
                {activeTab === 'diario' && (
                    <div className="flex-1 h-full overflow-hidden">
                        <QuestJournal onNavigate={tab => setActiveTab(tab.toLowerCase() as GameTab)} />
                    </div>
                )}

                {/* Mapa */}
                {activeTab === 'mapa' && (
                    <div className="flex-1 h-full overflow-hidden">
                        <WorldMap />
                    </div>
                )}
            </main>

            {/* Initiative sidebar (combat only) */}
            <InitiativeSidebar />

            {/* Loot modal */}
            {activeWidgets?.find((w: any) => w.widget_type === 'LOOT_MODAL') && (
                <LootModal
                    items={activeWidgets.find((w: any) => w.widget_type === 'LOOT_MODAL')?.data?.items || []}
                    onClose={() => sendAction({ type: 'close_widget', widget_type: 'LOOT_MODAL' })}
                    onTakeAll={() => {
                        const widget = activeWidgets.find((w: any) => w.widget_type === 'LOOT_MODAL');
                        const itemIds = (widget?.data?.items || []).map((i: any) => i.id);
                        const charId = combatants.find((c: any) => c.isPlayer)?.id || 'player_1';
                        sendAction({ action: 'distribute_loot', item_ids: itemIds, target_character_id: charId });
                        sendAction({ type: 'close_widget', widget_type: 'LOOT_MODAL' });
                    }}
                />
            )}
        </div>
    );
}
