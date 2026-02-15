import React from 'react';

export interface LootItem {
    id: string;
    name: string;
    description?: string;
    icon: string; // Emoji or URL
    rarity: 'common' | 'rare' | 'legendary';
    quantity?: number;
}

interface LootModalProps {
    items: LootItem[];
    onClose: () => void;
    onTakeAll: () => void;
}

export default function LootModal({ items, onClose, onTakeAll }: LootModalProps) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md parchment-texture rounded-lg shadow-2xl overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-stone-900/10 p-4 border-b border-stone-800/20 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-serif text-stone-900 uppercase tracking-widest">Victory</h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-red-900 transition-colors">
                        ✖
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-stone-700 italic text-center mb-4">You found the following items among the remains:</p>

                    <div className="space-y-2">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded border border-stone-800/10 bg-white/30 hover:bg-white/50 transition-colors">
                                <div className={`w-10 h-10 rounded flex items-center justify-center text-xl shadow-inner ${item.rarity === 'legendary' ? 'bg-yellow-500/20 border border-yellow-500/40' : item.rarity === 'rare' ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-stone-500/20 border border-stone-500/40'}`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <span className={`font-bold block ${item.rarity === 'legendary' ? 'text-amber-700' : item.rarity === 'rare' ? 'text-blue-800' : 'text-stone-900'}`}>{item.name}</span>
                                    {item.quantity && <span className="text-xs text-stone-500">Qty: {item.quantity}</span>}
                                </div>
                                <button className="text-xs font-bold text-stone-600 hover:text-stone-900 uppercase">Take</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-900/5 border-t border-stone-800/10 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-2 text-stone-600 font-bold hover:bg-stone-800/10 rounded transition-colors">
                        Leave Info
                    </button>
                    <button onClick={onTakeAll} className="flex-1 py-2 bg-stone-800 text-stone-200 font-bold hover:bg-stone-900 shadow-lg rounded transition-colors border border-stone-600">
                        Take All
                    </button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
