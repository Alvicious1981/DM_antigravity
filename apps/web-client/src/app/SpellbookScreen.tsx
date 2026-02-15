import React from 'react';

export default function SpellbookScreen() {
    return (
        <div className="w-full h-full cavern-bg rounded-lg overflow-y-auto p-4 flex flex-col items-center">
            {/* Header: Spellbook Title */}
            <header className="w-full max-w-2xl text-center mb-8 relative">
                <h2 className="text-3xl font-bold tracking-[0.2em] text-primary runic-glow uppercase" style={{ fontFamily: 'Cinzel, serif' }}>Grimoire</h2>
                <div className="h-px w-32 mx-auto mt-2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            </header>

            <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {/* Left Page: Known Spells */}
                <div className="parchment-texture rounded-lg p-6 shadow-2xl relative min-h-[500px] deckle-edge transform -rotate-1">
                    <h3 className="text-stone-900 font-bold text-lg border-b border-stone-800/20 pb-2 mb-4 uppercase tracking-widest text-center">Incantations</h3>

                    <div className="space-y-4">
                        {/* Spell Slot 1 */}
                        <div className="group cursor-pointer">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-stone-900 font-bold font-serif group-hover:text-red-900 transition-colors">Eldritch Blast</span>
                                <span className="text-stone-500 text-xs font-bold">CANTTRIP</span>
                            </div>
                            <p className="text-stone-600 text-xs italic leading-tight">A beam of crackling energy streaks toward a creature within range.</p>
                        </div>

                        {/* Spell Slot 2 */}
                        <div className="group cursor-pointer">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-stone-900 font-bold font-serif group-hover:text-red-900 transition-colors">Hex</span>
                                <span className="text-stone-500 text-xs font-bold">LVL 1</span>
                            </div>
                            <p className="text-stone-600 text-xs italic leading-tight">You place a curse on a creature that you can see within range.</p>
                        </div>

                        {/* Spell Slot 3 */}
                        <div className="group cursor-pointer opacity-50">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-stone-900 font-bold font-serif">Misty Step</span>
                                <span className="text-stone-500 text-xs font-bold">LVL 2</span>
                            </div>
                            <p className="text-stone-600 text-xs italic leading-tight">Briefly surrounded by silvery mist, you teleport up to 30 feet.</p>
                            <span className="text-red-700 font-bold text-[10px] uppercase mt-1 block">Depleted</span>
                        </div>
                    </div>
                </div>

                {/* Right Page: Prepared / Rituals */}
                <div className="parchment-texture rounded-lg p-6 shadow-2xl relative min-h-[500px] deckle-edge transform rotate-1">
                    <h3 className="text-stone-900 font-bold text-lg border-b border-stone-800/20 pb-2 mb-4 uppercase tracking-widest text-center">Rituals & Runes</h3>

                    <div className="flex flex-col items-center justify-center h-full opacity-60">
                        <span className="text-4xl text-stone-400 mb-2">✦</span>
                        <p className="text-stone-500 text-sm italic text-center">No rituals prepared for this dusk.</p>
                    </div>

                    <div className="absolute bottom-6 right-6">
                        <div className="w-12 h-12 border-2 border-stone-800/30 rounded-full flex items-center justify-center">
                            <span className="text-stone-800 font-bold text-lg">3</span>
                        </div>
                        <span className="text-stone-500 text-[8px] font-bold uppercase block text-center mt-1">Slots</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
