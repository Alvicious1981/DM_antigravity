'use client';

import React, { useState } from 'react';
import { mockLevelUpData, LevelUpAttribute, Talent } from '../../data/stitch/levelUpData';

export interface LevelUpScreenProps {
    onConfirm?: () => void;
}

export function LevelUpScreen({ onConfirm }: LevelUpScreenProps) {
    const [data, setData] = useState(mockLevelUpData);
    const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);

    const handleIncreaseAttribute = (id: string) => {
        if (data.remainingPoints <= 0) return;

        setData(prev => ({
            ...prev,
            remainingPoints: prev.remainingPoints - 1,
            attributes: prev.attributes.map(attr =>
                attr.id === id ? { ...attr, value: attr.value + 1 } : attr
            )
        }));
    };

    const handleReset = () => {
        setData(mockLevelUpData);
    };

    return (
        <div className="relative flex h-screen w-full flex-col bg-[#1a120b] overflow-hidden text-slate-100 font-serif selection:bg-[#ec5b13]/40">
            {/* Atmospheric Background Layer */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-transparent to-[#1a120b]" />
            </div>

            {/* Layout Container */}
            <div className="relative z-10 flex h-full flex-col px-8 py-6">
                {/* Top Navigation / Header */}
                <header className="flex items-center justify-between border-b border-[#ec5b13]/20 pb-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="size-6 text-[#d4af37] [text-shadow:0_0_15px_rgba(212,175,55,0.6)]">
                            <span className="material-symbols-outlined !text-3xl">flare</span>
                        </div>
                        <h2 className="font-['Cinzel'] text-xl font-bold tracking-widest text-[#d4af37] uppercase">Dragons and Dungeons</h2>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#2d241e] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#ec5b13]/20 transition-all">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#2d241e] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#ec5b13]/20 transition-all">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                </header>

                {/* Main Title */}
                <div className="text-center mb-8">
                    <h1 className="font-['Cinzel'] text-6xl font-black text-[#d4af37] [text-shadow:0_0_15px_rgba(212,175,55,0.6)] tracking-[0.2em] uppercase">Level Up</h1>
                    <p className="text-[#d4af37]/60 font-serif italic text-lg mt-2">The gods favor your journey, mortal.</p>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 grid grid-cols-12 gap-8 items-stretch min-h-0">
                    {/* Left Panel: Attributes */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="bg-[#2d241e] border-2 border-[#3d342e] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] p-6 rounded-xl flex-1 border-t-4 border-t-[#d4af37]/50">
                            <h3 className="font-['Cinzel'] text-2xl text-[#d4af37] border-b border-[#d4af37]/20 pb-2 mb-6 text-center">Attributes</h3>
                            <div className="space-y-6">
                                {data.attributes.map((attr) => (
                                    <div key={attr.id} className="flex items-center justify-between group">
                                        <div>
                                            <p className="font-['Cinzel'] text-lg text-slate-100 uppercase">{attr.name}</p>
                                            <p className="text-xs text-slate-400">{attr.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-['Cinzel'] text-2xl text-[#d4af37]">{attr.value.toString().padStart(2, '0')}</span>
                                            {attr.canIncrease && data.remainingPoints > 0 ? (
                                                <button
                                                    onClick={() => handleIncreaseAttribute(attr.id)}
                                                    className="flex items-center justify-center size-8 bg-[#ec5b13] text-slate-100 rounded border border-[#d4af37]/50 hover:scale-110 transition-transform active:scale-95 hover:shadow-[0_0_20px_#ec5b13]"
                                                >
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            ) : (
                                                <button className="flex items-center justify-center size-8 bg-[#2d241e]/50 text-slate-500 rounded border border-slate-700 cursor-not-allowed">
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 p-4 bg-black/40 rounded border border-[#d4af37]/10">
                                <p className="text-center text-[#d4af37]/80 font-['Cinzel'] text-sm mb-2">Points Remaining</p>
                                <p className="text-center text-4xl font-['Cinzel'] text-[#d4af37] [text-shadow:0_0_15px_rgba(212,175,55,0.6)]">{data.remainingPoints.toString().padStart(2, '0')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Central Hero Bust */}
                    <div className="col-span-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full max-w-lg bg-gradient-to-t from-[#ec5b13]/20 via-transparent to-transparent blur-3xl rounded-full"></div>
                        </div>
                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end">
                            <div
                                className="w-full h-[600px] bg-no-repeat bg-contain bg-bottom drop-shadow-[0_0_50px_rgba(236,91,19,0.4)]"
                                style={{ backgroundImage: `url('${data.heroImage}')` }}
                            />
                            <div className="mt-4 bg-[#2d241e] border border-[#d4af37]/30 px-12 py-3 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                                <p className="font-['Cinzel'] text-2xl tracking-widest text-[#d4af37] uppercase">Lvl {data.level} {data.characterClass}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Skills & Perks Bento */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="bg-[#2d241e] border-2 border-[#3d342e] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] p-6 rounded-xl flex-1 border-t-4 border-t-[#d4af37]/50 flex flex-col">
                            <h3 className="font-['Cinzel'] text-2xl text-[#d4af37] border-b border-[#d4af37]/20 pb-2 mb-6 text-center">New Talents</h3>
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {data.talents.map((talent) => (
                                    <div
                                        key={talent.id}
                                        onClick={() => talent.isSelectable && setSelectedTalentId(talent.id)}
                                        className={`p-4 rounded-lg cursor-pointer transition-all group ${talent.isAcquired
                                            ? 'bg-[#ec5b13]/10 border-[#ec5b13]/50 ring-1 ring-[#ec5b13]/50'
                                            : selectedTalentId === talent.id
                                                ? 'bg-[#ec5b13]/20 border-[#ec5b13]'
                                                : 'bg-black/40 border-[#d4af37]/20 hover:border-[#ec5b13] ' + (talent.isSelectable ? 'opacity-100' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100')
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-10 flex items-center justify-center border transition-colors ${talent.isAcquired
                                                    ? 'bg-[#ec5b13]/30 border-[#ec5b13] text-[#d4af37]'
                                                    : 'bg-[#2d241e] border-[#d4af37]/40 text-[#d4af37] group-hover:bg-[#ec5b13]/20'
                                                    }`}>
                                                    <span className="material-symbols-outlined">{talent.icon}</span>
                                                </div>
                                                <h4 className={`font-['Cinzel'] ${talent.isAcquired ? 'text-[#ec5b13] font-bold' : 'text-[#d4af37]'}`}>{talent.name}</h4>
                                            </div>
                                            {talent.isAcquired && (
                                                <span className="material-symbols-outlined text-[#ec5b13]">check_circle</span>
                                            )}
                                        </div>
                                        <p className={`text-xs italic ${talent.isAcquired ? 'text-slate-100' : 'text-slate-300'}`}>{talent.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full bg-[#ec5b13] py-4 font-['Cinzel'] text-xl text-slate-100 rounded-lg border-2 border-[#d4af37]/50 shadow-[0_0_20px_rgba(236,91,19,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    Confirm Level Up
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-[#2d241e] py-2 font-['Cinzel'] text-sm text-[#d4af37]/50 rounded-lg border border-[#d4af37]/20 hover:text-[#d4af37] transition-colors uppercase tracking-widest"
                                >
                                    Reset Points
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Info */}
                <footer className="mt-4 flex justify-between items-center text-[#d4af37]/40 text-xs font-serif italic border-t border-[#ec5b13]/20 pt-2">
                    <div>XP Progress: {data.xpProgress}</div>
                    <div className="flex gap-4">
                        <span>Gold: {data.gold}</span>
                        <span>Fame: {data.fame}</span>
                    </div>
                </footer>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ec5b13;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
