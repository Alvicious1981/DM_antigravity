'use client';
import React, { useState } from 'react';

// Interfaces for component props/state
interface Creature {
    id: string;
    name: string;
    type: string;
    description: string;
    stats: {
        hp: number;
        ac: number;
        cr: string;
    };
    traits: string[];
    imagePlaceholder: string;
}

const SAMPLE_CREATURES: Creature[] = [
    {
        id: '1',
        name: 'Void Stalker',
        type: 'Aberration',
        description: 'A shifting mass of shadows that mimics the shape of its prey before striking. Its eyes are not eyes, but windows into a dead galaxy.',
        stats: { hp: 45, ac: 14, cr: '3' },
        traits: ['Shadow Blend', 'Amorphous Form'],
        imagePlaceholder: '🌑'
    },
    {
        id: '2',
        name: 'Ashen Knight',
        type: 'Undead',
        description: 'A warrior clad in armor fused with volcanic glass. It remembers only the orders of a king long turned to dust.',
        stats: { hp: 80, ac: 18, cr: '5' },
        traits: ['Cursed Blade', 'Undying Resilience'],
        imagePlaceholder: '🛡️'
    },
    {
        id: '3',
        name: 'Gloom Spider',
        type: 'Beast',
        description: 'Weaves webs of tangibility from the darkness itself.',
        stats: { hp: 22, ac: 12, cr: '1' },
        traits: ['Web Sense', 'Spider Climb'],
        imagePlaceholder: '🕷️'
    }
];

export default function BestiaryScreen() {
    const [selectedCreature, setSelectedCreature] = useState<Creature>(SAMPLE_CREATURES[0]);

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 bg-stone-900/50 rounded-lg overflow-hidden">
            {/* Left Panel: Creature List */}
            <aside className="w-full md:w-1/3 flex flex-col gap-4">
                <header className="parchment-texture p-3 rounded shadow-md border-b-2 border-stone-800/20 transform -rotate-1">
                    <h2 className="text-xl font-bold tracking-widest text-stone-900 uppercase font-serif text-center">Hunter's Notes</h2>
                </header>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {SAMPLE_CREATURES.map(creature => (
                        <div
                            key={creature.id}
                            onClick={() => setSelectedCreature(creature)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border border-transparent ${selectedCreature.id === creature.id ? 'wood-texture border-primary/40 shadow-lg scale-[1.02]' : 'bg-black/20 hover:bg-black/40 border-stone-800/30'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl opacity-70 filter drop-shadow">{creature.imagePlaceholder}</span>
                                <div className="flex flex-col">
                                    <span className={`font-bold font-serif ${selectedCreature.id === creature.id ? 'text-stone-200' : 'text-stone-400'}`}>{creature.name}</span>
                                    <span className="text-[10px] text-stone-500 uppercase tracking-widest">{creature.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Right Panel: Creature Detail */}
            <main className="w-full md:w-2/3 parchment-texture rounded-lg p-6 md:p-8 shadow-2xl relative deckle-edge overflow-y-auto">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="text-9xl text-stone-900 rotate-12 block">❖</span>
                </div>

                <div className="flex justify-between items-start border-b-2 border-stone-800/10 pb-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-stone-900 font-serif mb-1">{selectedCreature.name}</h1>
                        <span className="text-sm font-bold text-red-900 uppercase tracking-[0.2em] bg-stone-900/5 px-2 py-1 rounded">Challenge Rating {selectedCreature.stats.cr}</span>
                    </div>
                    <div className="p-4 border-2 border-stone-800/20 rounded-lg bg-stone-300/50 transform rotate-2 shadow-inner">
                        <span className="text-6xl filter grayscale contrast-125">{selectedCreature.imagePlaceholder}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-stone-900/5 p-3 rounded border border-stone-900/10 text-center">
                        <span className="text-xs uppercase text-stone-500 font-bold block mb-1">Health Points</span>
                        <span className="text-xl font-bold text-red-900">{selectedCreature.stats.hp}</span>
                    </div>
                    <div className="bg-stone-900/5 p-3 rounded border border-stone-900/10 text-center">
                        <span className="text-xs uppercase text-stone-500 font-bold block mb-1">Armor Class</span>
                        <span className="text-xl font-bold text-stone-900">{selectedCreature.stats.ac}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest border-b border-stone-400/30 pb-1 mb-2">Description</h3>
                    <p className="text-stone-900 leading-relaxed italic font-serif text-lg opacity-90">
                        "{selectedCreature.description}"
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest border-b border-stone-400/30 pb-1 mb-2">Traits</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {selectedCreature.traits.map(trait => (
                            <li key={trait} className="text-stone-900 font-medium">{trait}</li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}
