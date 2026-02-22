'use client';
import React, { useState, useEffect } from 'react';
import { Book, Map as MapIcon, Shield, Backpack, Sparkles, Skull, MessageSquare, Coins, Menu } from 'lucide-react';
import InventoryScreen from './InventoryScreen';
import WorldMap from './WorldMap';
import SpellbookScreen from './SpellbookScreen';
import BestiaryScreen from './BestiaryScreen';
import DialogueOverlay from './DialogueOverlay';
import LootModal, { LootItem } from './LootModal';
import ActionPanel from './ActionPanel';
import StoryLog, { StoryEntry } from './StoryLog';
import { useAgentState } from '../hooks/useAgentState';
import InitiativeSidebar from '../components/InitiativeSidebar';

interface DashboardProps {
    initialSession?: {
        save_id: string;
        character: any;
        location: string;
        scene: string;
    };
}

export default function Dashboard({ initialSession }: DashboardProps) {
    const {
        connect,
        connected,
        narrative,
        inventory,
        spells,
        monsterSearchResults,
        toasts,
        currentNarrative,
        isStreaming,
        screenShake,
        removeToast,
        sendAction,
        getSpells,
        clearScreenShake,
        combatants,
        activeWidgets
    } = useAgentState();

    const [activeTab, setActiveTab] = useState('story'); // story, inventory, map, spellbook, party, bestiary
    const [showDialogue, setShowDialogue] = useState(false);
    const [showLoot, setShowLoot] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate player health for vignette — continuous scale, not binary
    const player = combatants.find(c => c.isPlayer);
    const hpPct = (player?.hp_max && player?.hp_current != null)
        ? player.hp_current / player.hp_max
        : 1;
    const vignetteIntensity = Math.max(0, 1 - hpPct);          // 0 = full HP, 1 = dead
    const isCriticalHealth = hpPct <= 0.25 && vignetteIntensity > 0;

    // Handle screen shake reset
    useEffect(() => {
        if (screenShake) {
            const timer = setTimeout(() => {
                clearScreenShake();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [screenShake, clearScreenShake]);

    // Auto-connect if session is provided
    useEffect(() => {
        if (initialSession?.save_id && !connected) {
            connect(initialSession.save_id);
        }
    }, [initialSession, connected, connect]);

    // Convert narrative strings to StoryEntries
    const storyEntries: StoryEntry[] = [
        // Seed initial session scene if present
        ...(initialSession?.scene ? [{
            id: 'init-scene',
            type: 'narrative' as const,
            text: initialSession.scene,
            timestamp: new Date().toISOString()
        }] : []),
        ...narrative.map((text, index) => ({
            id: `nar-${index}`,
            type: (text.startsWith('>') ? 'combat' : 'narrative') as 'combat' | 'narrative',
            text: text,
            timestamp: new Date().toISOString() // Approximate
        }))
    ];

    // Add streaming entry if active
    if (isStreaming && currentNarrative) {
        storyEntries.push({
            id: 'current-narrative',
            type: 'narrative' as const,
            text: currentNarrative,
            timestamp: new Date().toISOString()
        });
    }

    const handleAction = (actionType: string, payload?: string) => {
        console.log(`Action: ${actionType}, Payload: ${payload}`);
        if (actionType === 'text') {
            sendAction({ type: 'narrative_action', content: payload });
        } else {
            sendAction({ type: 'action', action: actionType });
        }
    };

    // Mock Data for Demo
    const mockLoot: LootItem[] = [
        { id: '1', name: 'Blade of the Fallen King', description: 'A wicked longsword infused with necrotic energy.', icon: '⚔️', rarity: 'legendary' },
        { id: '2', name: 'Elixir of Shadow Walk', description: 'Grants ability to move unseen for a brief period.', icon: '🧪', rarity: 'rare', quantity: 2 },
        { id: '3', name: 'Draconic Gold Coins', description: 'Coins minted in the hoard of a dragon.', icon: '💰', rarity: 'common', quantity: 150 }
    ];

    const TabButton = ({ id, icon: Icon }: { id: string; icon: React.ElementType }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300 ${activeTab === id
                ? 'bg-[#c5a059]/20 text-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.3)]'
                : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
                }`}
        >
            <Icon className="w-6 h-6" />
        </button>
    );

    return (
        <div className={`flex h-screen w-full bg-[#0f0f12] text-[#e0e0e4] font-serif overflow-hidden relative selection:bg-[#c5a059]/30 selection:text-white ${screenShake ? 'animate-shake' : ''}`}>

            {/* 0. Diegetic Overlays */}
            {vignetteIntensity > 0 && (
                <div
                    className={`blood-vignette${isCriticalHealth ? ' animate-pulse' : ''}`}
                    style={{ opacity: vignetteIntensity }}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className="hidden md:flex flex-col items-center gap-4 py-6 w-20 border-r border-[#2a2a2d] bg-[#141416] z-20">
                <div className="mb-4">
                    <div className="h-10 w-10 rounded bg-gradient-to-br from-[#c5a059] to-[#8a6e3e] flex items-center justify-center shadow-lg">
                        <span className="font-cinzel text-black font-bold text-xl">A</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full px-2">
                    <TabButton id="story" icon={Book} />
                    <TabButton id="inventory" icon={Backpack} />
                    <TabButton id="spellbook" icon={Sparkles} />
                    <TabButton id="party" icon={Shield} />
                    <TabButton id="bestiary" icon={Skull} />
                    <TabButton id="map" icon={MapIcon} />
                </div>

                <div className="mt-auto pb-4 flex flex-col gap-4">
                    <div
                        className={`w-2 h-2 rounded-full mx-auto animate-pulse shadow-[0_0_5px] ${connected ? 'bg-green-500 shadow-lime-500' : 'bg-red-500 shadow-red-500'}`}
                        title={connected ? "Server Connected" : "Disconnected"}
                    />
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#141416] border-b border-[#2a2a2d] z-50 flex items-center px-4 justify-between">
                <span className="font-cinzel text-[#c5a059] font-bold tracking-widest">ANTIGRAVITY</span>
                <button onClick={() => setActiveTab(activeTab === 'story' ? 'menu' : 'story')} className="text-stone-400">
                    <Menu />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative z-10 pt-14 md:pt-0">
                {/* 1. Content Area (Story Log takes priority) */}
                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-[#0f0f12]">
                    {activeTab === 'story' ? (
                        <StoryLog entries={storyEntries} />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-4xl mx-auto bg-[#141416] border border-[#2a2a2d] rounded-lg p-6 shadow-2xl min-h-[500px]">
                                {activeTab === 'inventory' && <InventoryScreen />}
                                {activeTab === 'spellbook' && <SpellbookScreen />}
                                {activeTab === 'bestiary' && <BestiaryScreen />}
                                {activeTab === 'map' && <WorldMap />}
                                {activeTab === 'party' && (
                                    <div className="text-center py-20 text-stone-500 italic">
                                        The party gathers in the shadows... <br />(Party Screen Implementation Pending)
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Action Panel (Fixed at bottom) */}
                <div className="h-auto min-h-[200px] z-40 relative border-t border-[#2a2a2d] shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    <ActionPanel
                        onAction={handleAction}
                        isProcessing={isProcessing}
                        suggestions={["Investigate the Altar", "Look for traps", "Cast 'Detect Magic'", "Stealth check"]}
                    />
                </div>
            </main>

            {/* 3. Initiative Sidebar (Slides in during combat) */}
            <InitiativeSidebar />

            {/* Overlays */}
            {showDialogue && (
                <DialogueOverlay
                    speakerName="Mysterious Figure"
                    text="The stars do not align for your kind here, traveler. Turn back, or become part of the void."
                    options={[
                        { id: '1', text: 'Who are you?', action: () => console.log('Option 1') },
                        { id: '2', text: 'Draw weapon', action: () => setShowDialogue(false) }
                    ]}
                    onClose={() => setShowDialogue(false)}
                />
            )}

            {activeWidgets.find(w => w.widget_type === 'LOOT_MODAL') && (
                <LootModal
                    items={(activeWidgets.find(w => w.widget_type === 'LOOT_MODAL')?.data.items as any[]) || []}
                    onClose={() => sendAction({ type: 'close_widget', widget_type: 'LOOT_MODAL' })}
                    onTakeAll={() => {
                        const widget = activeWidgets.find(w => w.widget_type === 'LOOT_MODAL');
                        const itemIds = (widget?.data.items as any[] || []).map(i => i.id);
                        const charId = combatants.find(c => c.isPlayer)?.id || "player_1";
                        sendAction({
                            action: 'distribute_loot',
                            item_ids: itemIds,
                            target_character_id: charId
                        });
                        sendAction({ type: 'close_widget', widget_type: 'LOOT_MODAL' });
                    }}
                />
            )}
        </div>
    );
}
