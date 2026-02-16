'use client';
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export interface StoryEntry {
    id: string;
    type: 'narrative' | 'dialogue' | 'combat' | 'info';
    text: string;
    speaker?: string;
    timestamp?: string;
}

interface StoryLogProps {
    entries: StoryEntry[];
}

export default function StoryLog({ entries }: StoryLogProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new entries
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    return (
        <div className="w-full h-full bg-abyss text-bone flex flex-col">
            <div className="border-b border-iron bg-obsidian px-6 py-3 shadow-md z-10">
                <h2 className="font-display text-lg tracking-[0.2em] text-gold text-center">
                    THE CHRONICLE
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 font-sans leading-relaxed no-scrollbar scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8">
                    {entries.map((entry) => (
                        <LogEntryItem key={entry.id} entry={entry} />
                    ))}
                    <div ref={bottomRef} className="h-12" />
                </div>
            </div>
        </div>
    );
}

function LogEntryItem({ entry }: { entry: StoryEntry }) {
    // Render based on type
    if (entry.type === 'narrative') {
        return (
            <div className="animate-fade-in border-l-2 border-transparent pl-4 hover:border-iron transition-colors duration-500">
                <ReactMarkdown
                    components={{
                        p: ({ node, ...props }) => <p className="text-lg md:text-xl leading-relaxed text-bone mb-4" {...props} />,
                        strong: ({ node, ...props }) => <strong className="text-gold font-bold" {...props} />,
                        em: ({ node, ...props }) => <em className="text-ash italic" {...props} />,
                    }}
                >
                    {entry.text}
                </ReactMarkdown>
            </div>
        );
    }

    if (entry.type === 'dialogue') {
        return (
            <div className="animate-fade-in flex flex-col gap-2 border-l-4 border-gold pl-6 py-2 bg-obsidian/50 rounded-r-lg my-4 shadow-inner">
                <span className="text-xs uppercase tracking-widest text-gold font-bold font-display">{entry.speaker || 'Unknown'}</span>
                <p className="text-xl md:text-2xl text-white italic font-serif">
                    "{entry.text}"
                </p>
            </div>
        );
    }

    if (entry.type === 'combat') {
        const damageTypes = ['fire', 'cold', 'lightning', 'acid', 'poison', 'necrotic', 'radiant', 'force', 'psychic', 'thunder'];
        let highlightedText: React.ReactNode = entry.text;

        // Simple regex-based highlighting for prototype polish
        // Format: "10 fire damage" -> "10 <span class='text-damage-fire'>fire</span> damage"
        const parts = entry.text.split(/(\d+\s+(?:fire|cold|lightning|acid|poison|necrotic|radiant|force|psychic|thunder)\s+damage)/gi);

        return (
            <div className="animate-fade-in bg-abyss border border-blood/30 p-4 rounded text-sm font-mono my-2 shadow-[0_0_10px_rgba(139,26,26,0.1)]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-blood font-bold text-lg">⚔</span>
                    <span className="uppercase text-blood/80 text-xs tracking-wider font-bold">Combat Action</span>
                </div>
                <div className="text-ash/90">
                    {parts.map((part, i) => {
                        const match = part.match(/(\d+)\s+(fire|cold|lightning|acid|poison|necrotic|radiant|force|psychic|thunder)\s+damage/i);
                        if (match) {
                            const [_, amount, type] = match;
                            return (
                                <span key={i} className={`font-bold text-damage-${type.toLowerCase()}`}>
                                    {amount} {type} damage
                                </span>
                            );
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            </div>
        );
    }

    if (entry.type === 'info') {
        return (
            <div className="animate-fade-in text-ash text-sm italic text-center py-4 flex items-center justify-center gap-4 opacity-70">
                <span className="h-px w-12 bg-iron"></span>
                <span className="font-display tracking-widest">{entry.text}</span>
                <span className="h-px w-12 bg-iron"></span>
            </div>
        );
    }

    return null;
}
