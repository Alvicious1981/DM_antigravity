import React from 'react';

export default function InventoryScreen() {
    return (
        <div className="w-full h-full cavern-bg rounded-lg overflow-y-auto p-4 flex flex-col items-center">
            {/* Header Stats */}
            <header className="w-full max-w-2xl relative pt-6 pb-6 px-4 z-10">
                <div className="parchment-texture rounded-sm p-3 relative flex justify-between items-center transform -rotate-1 border-b-2 border-stone-800/20 shadow-md">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-stone-700 font-bold uppercase tracking-widest opacity-70">Wealth</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-stone-900 tracking-tight">1,240</span>
                            <span className="text-gold text-sm font-bold">GP</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-stone-700 font-bold uppercase tracking-widest opacity-70">Burden</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-stone-900 tracking-tight">45 / 100</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-2xl flex-1 px-4 pb-12">
                {/* Equipped Section */}
                <section className="flex gap-6 items-center py-4 border-b border-iron/30 mb-6">
                    <div className="relative w-32 h-48 flex-shrink-0 bg-black/20 rounded-lg flex items-center justify-center border border-iron/50">
                        <span className="text-ash text-xs uppercase tracking-widest">Silhouette</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        <h3 className="text-ash text-xs uppercase tracking-widest mb-1">Equipped</h3>
                        {/* Slot: Main Hand */}
                        <div className="p-3 stone-texture rounded-lg border-l-4 border-l-gold/40 h-16 flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/30 rounded border border-iron/30 flex items-center justify-center">
                                <span className="text-xl">⚔️</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-bone font-bold text-sm">Iron Longsword</span>
                                <span className="text-ash text-[10px] uppercase">Main Hand</span>
                            </div>
                        </div>
                        {/* Slot: Off Hand */}
                        <div className="p-3 stone-texture rounded-lg opacity-80 h-16 flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/30 rounded border border-iron/30 flex items-center justify-center">
                                <span className="text-xl">🛡️</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-ash font-bold text-sm">Worn Buckler</span>
                                <span className="text-ash text-[10px] uppercase">Off Hand</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grid Inventory */}
                <h3 className="text-ash text-xs uppercase tracking-widest mb-3">Backpack</h3>
                <section className="grid grid-cols-4 md:grid-cols-5 gap-3">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="aspect-square stone-texture rounded-xl flex items-center justify-center hover:border-gold/50 transition-colors cursor-pointer group relative">
                            {i === 0 && <span className="text-2xl drop-shadow-md">🧪</span>}
                            {i === 1 && <span className="text-2xl drop-shadow-md">📜</span>}
                            {i === 2 && <span className="text-2xl drop-shadow-md">🍖</span>}
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors"></div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
