'use client';
import React, { useState } from 'react';
import { Sword, Sparkles, Hand, Send, Sparkle, Command } from 'lucide-react';

interface ActionPanelProps {
    onAction: (actionType: string, payload?: string) => void;
    isProcessing?: boolean;
    suggestions?: string[];
}

export default function ActionPanel({ onAction, isProcessing = false, suggestions = [] }: ActionPanelProps) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAction('text', inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="w-full h-full bg-obsidian flex flex-col p-4 md:p-6 gap-4 relative">

            {/* 1. AI Suggestions (Top) */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 items-center min-h-[44px]">
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

            {/* 2. Main Controls Row */}
            <div className="flex flex-col md:flex-row items-stretch gap-4 flex-1">

                {/* Standard Action Buttons */}
                <div className="flex gap-4 flex-shrink-0 justify-center md:justify-start">
                    <button
                        onClick={() => onAction('attack')}
                        className="group flex flex-col items-center justify-center gap-2 w-20 h-20 bg-abyss rounded-lg border border-iron hover:border-blood/60 hover:bg-blood/20 transition-all active:scale-95 shadow-md relative overflow-hidden"
                        title="Attack"
                    >
                        <Sword className="w-6 h-6 text-ash group-hover:text-blood transition-colors z-10" />
                        <span className="text-[10px] uppercase font-bold text-ash group-hover:text-blood/80 z-10 font-display tracking-widest">Attack</span>
                        <div className="absolute inset-0 bg-blood/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                        onClick={() => onAction('cast')}
                        className="group flex flex-col items-center justify-center gap-2 w-20 h-20 bg-abyss rounded-lg border border-iron hover:border-arcane/60 hover:bg-arcane/20 transition-all active:scale-95 shadow-md relative overflow-hidden"
                        title="Cast Spell"
                    >
                        <Sparkles className="w-6 h-6 text-ash group-hover:text-arcane transition-colors z-10" />
                        <span className="text-[10px] uppercase font-bold text-ash group-hover:text-arcane/80 z-10 font-display tracking-widest">Cast</span>
                        <div className="absolute inset-0 bg-arcane/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                        onClick={() => onAction('act')}
                        className="group flex flex-col items-center justify-center gap-2 w-20 h-20 bg-abyss rounded-lg border border-iron hover:border-gold/60 hover:bg-gold/10 transition-all active:scale-95 shadow-md relative overflow-hidden"
                        title="Interact / Use Item"
                    >
                        <Hand className="w-6 h-6 text-ash group-hover:text-gold transition-colors z-10" />
                        <span className="text-[10px] uppercase font-bold text-ash group-hover:text-gold z-10 font-display tracking-widest">Act</span>
                    </button>
                </div>

                {/* 3. Text Input Field (Expands to fill) */}
                <form onSubmit={handleSubmit} className="flex-1 flex gap-0 h-16 md:h-20 shadow-inner rounded-xl overflow-hidden border border-iron hover:border-iron/80 transition-colors focus-within:border-gold/50">
                    <div className="relative flex-1 h-full bg-abyss">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Describe your action..."
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
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isProcessing}
                        className="h-full w-16 md:w-24 bg-obsidian hover:bg-iron text-ash hover:text-gold transition-colors flex items-center justify-center border-l border-iron"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </form>

            </div>
        </div>
    );
}
