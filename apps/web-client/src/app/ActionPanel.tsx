'use client';
import React, { useState } from 'react';
import { Sword, Sparkles, Hand, Send, Sparkle, Command, XCircle } from 'lucide-react';
import { useAgentState } from '@/hooks/useAgentState';

interface ActionPanelProps {
    onAction: (actionType: string, payload?: string) => void;
    isProcessing?: boolean;
    suggestions?: string[];
}

export default function ActionPanel({ onAction, isProcessing = false, suggestions = [] }: ActionPanelProps) {
    const [inputValue, setInputValue] = useState('');
    const { inventory, spells, selectedTargetId, attackTarget, castSpell, setSelectedTarget } = useAgentState();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAction('text', inputValue);
            setInputValue('');
        }
    };

    // Filter equipped weapons
    const equippedWeapons = inventory.filter(item =>
        item.location === 'EQUIPPED' &&
        (item.slot_type === 'Main Hand' || item.slot_type === 'Off Hand') &&
        item.stats?.weapon_type
    );

    return (
        <div className="w-full h-full bg-obsidian flex flex-col p-4 md:p-6 gap-4 relative">

            {/* Target & AI Suggestions (Top Row) */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 items-center min-h-[44px]">
                {selectedTargetId && (
                    <div className="flex-shrink-0 flex items-center bg-red-900/30 border border-red-500/30 px-3 py-1.5 rounded text-xs">
                        <span className="text-red-400 mr-2 font-display tracking-wider">TARGET:</span>
                        <span className="text-stone-300 mr-2">{selectedTargetId.substring(0, 8)}...</span>
                        <button onClick={() => setSelectedTarget(null)} className="text-stone-500 hover:text-red-400">
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex-shrink-0 text-gold mr-2 flex items-center gap-2">
                    <Sparkle className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-display tracking-wider opacity-70">SUGGESTIONS</span>
                </div>
                {suggestions.map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAction('text', suggestion)}
                        className="flex-shrink-0 px-4 py-1.5 bg-iron hover:bg-hover border border-iron hover:border-gold/50 rounded text-xs text-bone hover:text-gold transition-all whitespace-nowrap shadow-sm group"
                    >
                        <span className="group-hover:translate-x-0.5 transition-transform inline-block">{suggestion}</span>
                    </button>
                ))}
            </div>

            {/* Main Controls Row */}
            <div className="flex flex-col md:flex-row items-stretch gap-4 flex-1">

                {/* Sovereign Verb Buttons (Weapons & Spells) */}
                <div className="flex gap-4 flex-wrap flex-shrink-0 justify-center md:justify-start overflow-y-auto no-scrollbar max-h-24 md:max-h-full">

                    {/* Weapons */}
                    {equippedWeapons.map(weapon => (
                        <button
                            key={weapon.instance_id}
                            disabled={!selectedTargetId}
                            onClick={() => selectedTargetId && attackTarget(selectedTargetId, weapon.instance_id)}
                            className={`group flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-lg border transition-all active:scale-95 shadow-md relative overflow-hidden
                                ${selectedTargetId
                                    ? 'bg-abyss border-iron hover:border-blood/60 hover:bg-blood/20 cursor-pointer'
                                    : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                            title={`Attack with ${weapon.name}`}
                        >
                            <Sword className={`w-6 h-6 transition-colors z-10 ${selectedTargetId ? 'text-ash group-hover:text-blood' : 'text-stone-600'}`} />
                            <span className="text-[10px] text-center uppercase font-bold text-ash group-hover:text-blood/80 z-10 font-display tracking-tight leading-none px-1 line-clamp-2">
                                {weapon.name}
                            </span>
                            {selectedTargetId && <div className="absolute inset-0 bg-blood/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                        </button>
                    ))}

                    {/* Generic Attack if no weapons equipped */}
                    {equippedWeapons.length === 0 && (
                        <button
                            disabled={!selectedTargetId}
                            onClick={() => selectedTargetId && attackTarget(selectedTargetId)}
                            className={`group flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-lg border transition-all active:scale-95 shadow-md relative overflow-hidden
                                ${selectedTargetId
                                    ? 'bg-abyss border-iron hover:border-blood/60 hover:bg-blood/20 cursor-pointer'
                                    : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                            title="Unarmed Strike"
                        >
                            <Sword className={`w-6 h-6 transition-colors z-10 ${selectedTargetId ? 'text-ash group-hover:text-blood' : 'text-stone-600'}`} />
                            <span className="text-[10px] uppercase font-bold text-ash group-hover:text-blood/80 z-10 font-display tracking-widest">Unarmed</span>
                        </button>
                    )}

                    {/* Spells */}
                    {spells.map(spell => (
                        <button
                            key={spell.id}
                            disabled={!selectedTargetId && spell.is_attack} // Support buffs later, for now require target for all
                            onClick={() => selectedTargetId && castSpell(selectedTargetId, spell.id)}
                            className={`group flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-lg border transition-all active:scale-95 shadow-md relative overflow-hidden
                                ${selectedTargetId
                                    ? 'bg-abyss border-iron hover:border-arcane/60 hover:bg-arcane/20 cursor-pointer'
                                    : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                            title={`Cast ${spell.name}`}
                        >
                            <Sparkles className={`w-6 h-6 transition-colors z-10 ${selectedTargetId ? 'text-ash group-hover:text-arcane' : 'text-stone-600'}`} />
                            <span className="text-[10px] text-center uppercase font-bold text-ash group-hover:text-arcane/80 z-10 font-display tracking-tight leading-none px-1 line-clamp-2">
                                {spell.name}
                            </span>
                            {selectedTargetId && <div className="absolute inset-0 bg-arcane/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                        </button>
                    ))}

                    <button
                        onClick={() => onAction('act')}
                        className="group flex flex-col items-center justify-center gap-2 w-20 h-20 bg-abyss rounded-lg border border-iron hover:border-gold/60 hover:bg-gold/10 transition-all active:scale-95 shadow-md relative overflow-hidden"
                        title="Interact / Use Item"
                    >
                        <Hand className="w-6 h-6 text-ash group-hover:text-gold transition-colors z-10" />
                        <span className="text-[10px] uppercase font-bold text-ash group-hover:text-gold z-10 font-display tracking-widest">Act</span>
                    </button>
                </div>

                {/* Text Input Field */}
                <form onSubmit={handleSubmit} className="flex-1 flex min-w-[200px] flex-col justify-end gap-0 h-16 md:h-20 shadow-inner rounded-xl overflow-hidden border border-iron hover:border-iron/80 transition-colors focus-within:border-gold/50">
                    <div className="relative flex-1 h-full bg-abyss">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={selectedTargetId ? "Or describe an action..." : "Select a target, or describe an action..."}
                            className="w-full h-full bg-transparent p-4 md:p-6 text-bone placeholder-iron focus:outline-none font-sans text-lg md:text-xl"
                            disabled={isProcessing}
                        />
                        {isProcessing && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="animate-spin block w-5 h-5 border-2 border-gold border-t-transparent rounded-full"></span>
                            </div>
                        )}
                        {!isProcessing && !inputValue && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ash pointer-events-none hidden md:block">
                                <Command className="w-4 h-4 inline mr-1 opacity-50" />
                                <span className="text-xs tracking-wider font-mono opacity-50">CMD+K</span>
                            </div>
                        )}
                    </div>
                    {/* The send button is appended to the right natively by flex row in original, changing this to flex-row and restoring structure */}
                </form>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isProcessing}
                    className="h-16 md:h-20 w-16 md:w-24 rounded-xl bg-obsidian hover:bg-iron text-ash hover:text-gold transition-colors flex items-center justify-center border border-iron shadow-md flex-shrink-0"
                >
                    <Send className="w-6 h-6" />
                </button>

            </div>
        </div>
    );
}
