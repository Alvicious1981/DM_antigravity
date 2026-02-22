import React, { useState } from 'react';
import { mockLoadGameData, SaveSlot } from '../../data/stitch/loadGameData';

export interface LoadGameScreenProps {
    onLoad?: (saveId: string) => void;
    onBack?: () => void;
    data?: typeof mockLoadGameData;
}

export function LoadGameScreen({
    onLoad,
    onBack,
    data = mockLoadGameData
}: LoadGameScreenProps) {
    const [selectedSaveId, setSelectedSaveId] = useState(data.saves[0].id);
    const selectedSave = data.saves.find(s => s.id === selectedSaveId) || data.saves[0];

    return (
        <div className="relative flex flex-col h-screen w-full overflow-hidden select-none bg-[#221310] font-display text-slate-100">
            {/* Background Image Layer */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrBz7VigHk5_t9CpXW7QK8za8j_eIgFytZnZS0ey0F0rDili0rpk9qGzwt_yxzymvXcPMsyuzrMpKg541n3i5CiXF28JzIx4MDOqgzmiaD69Tk52QXOmySP_B7XB08Z6noeycT0udByvfLrYt00YeD40OLy6Lu5wY1HWKoTS5KVPd0fHXK2996bX-wlz3FoOGxbtiQoVcth0x19xzy_XvAeVk-0wwdSgQ5Qld2W5n87A7SAdS1MFq7SSErDGL88NnfnjWesQhi8w')" }}
            />
            <div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

            {/* Embers Effect */}
            <div className="ember-container">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="ember" />
                ))}
            </div>

            {/* Main Container */}
            <div className="relative flex flex-col h-screen w-full z-10">

                {/* Header Section */}
                <header className="flex-none px-12 pt-10 pb-6 flex justify-between items-end border-b border-white/5 bg-gradient-to-b from-stone-900/90 to-transparent">
                    <div>
                        <h1 className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-orange-400 via-[#f2330d] to-stone-900 font-display drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase border-b-2 border-[#f2330d]/20 pb-2 mb-2">
                            Load Game
                        </h1>
                        <p className="text-orange-200/60 tracking-widest text-sm uppercase pl-1">Select a chronicle to resume your journey</p>
                    </div>

                    {/* Search / Filter */}
                    <div className="w-96 relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f2330d] to-orange-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-stone-900 border-2 border-stone-700 rounded-lg overflow-hidden shadow-inner">
                            <input
                                className="w-full bg-transparent border-none text-orange-100 placeholder-stone-500 px-4 py-3 focus:ring-0 tracking-wider focus:outline-none search-input-placeholder"
                                placeholder="Search Chronicles..."
                                type="text"
                            />
                            <span className="material-symbols-outlined text-stone-500 pr-3">search</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-grow flex overflow-hidden px-12 py-8 gap-12">

                    {/* Left: Save List */}
                    <div className="w-2/3 h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto custom-scrollbar-wide pr-4 space-y-4 pb-20">
                            {data.saves.map((save) => (
                                <div
                                    key={save.id}
                                    onClick={() => setSelectedSaveId(save.id)}
                                    className={`group relative cursor-pointer transform transition-all duration-300 hover:scale-[1.01] ${selectedSaveId === save.id ? 'z-10' : ''}`}
                                >
                                    {/* Selection Glow */}
                                    {selectedSaveId === save.id && (
                                        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#f2330d] via-orange-500 to-[#f2330d] rounded-xl blur opacity-60"></div>
                                    )}
                                    {selectedSaveId !== save.id && (
                                        <div className="absolute -inset-[1px] bg-[#f2330d]/40 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    )}

                                    {/* Card Content */}
                                    <div className={`relative flex items-stretch rounded-lg border-2 shadow-2xl overflow-hidden transition-colors ${selectedSaveId === save.id ? 'bg-stone-900 border-stone-600' : 'bg-stone-900/80 border-stone-700 group-hover:border-[#f2330d]/50'
                                        }`}>
                                        {/* Image */}
                                        <div className={`w-64 relative border-r-2 ${selectedSaveId === save.id ? 'border-stone-700' : 'border-stone-800'}`}>
                                            <div
                                                className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${selectedSaveId === save.id ? 'scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-110'}`}
                                                style={{ backgroundImage: `url('${save.imageUrl}')` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-stone-900/90" />
                                            {save.isAutosave && (
                                                <div className="absolute bottom-2 left-2 bg-stone-950/80 px-2 py-1 rounded border border-stone-600 text-xs text-orange-200 font-mono">AUTOSAVE</div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 p-6 flex flex-col justify-between bg-stone-texture bg-repeat">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className={`text-2xl font-bold tracking-wide transition-colors ${selectedSaveId === save.id ? 'magma-text' : 'text-stone-300 group-hover:text-orange-100'}`}>
                                                        {save.characterName}
                                                    </h3>
                                                    <span className={`font-mono text-lg font-bold transition-colors ${selectedSaveId === save.id ? 'text-[#f2330d]' : 'text-stone-500 group-hover:text-[#f2330d]'}`}>
                                                        Lvl {save.level}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mb-4 border-b pb-2 transition-colors ${selectedSaveId === save.id ? 'text-stone-400 border-stone-700' : 'text-stone-500 border-stone-800'}`}>
                                                    {save.characterClass}
                                                </p>
                                                <div className={`grid grid-cols-2 gap-4 text-sm transition-colors ${selectedSaveId === save.id ? 'text-stone-300' : 'text-stone-500 group-hover:text-stone-400'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[#f2330d] text-[18px]">location_on</span>
                                                        <span className="font-bold">{save.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-stone-500 text-[18px]">schedule</span>
                                                        <span>Playtime: {save.playtime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-stone-500 text-[18px]">calendar_today</span>
                                                        <span>{save.timestamp}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`material-symbols-outlined text-[18px] ${save.stateIcon === 'swords' ? 'text-red-700' : 'text-stone-500'}`}>{save.stateIcon}</span>
                                                        <span className={save.stateColorClass}>{save.state}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details / Preview Panel */}
                    <div className="w-1/3 flex flex-col h-full relative">
                        {/* Preview Image Frame */}
                        <div className="h-64 relative rounded-t-lg border-2 border-stone-600 border-b-0 overflow-hidden shadow-2xl">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${data.previewImage}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-3xl font-black text-white drop-shadow-md">{data.previewTitle}</h2>
                                <p className="text-orange-300/80 text-sm tracking-wider uppercase">Danger Level: {data.dangerLevel}</p>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="flex-grow bg-stone-900/90 border-2 border-stone-600 border-t-0 rounded-b-lg p-6 flex flex-col gap-6 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB183U6h3WS8K2BXsr6niVuY2BI73utfr51fx0aQq75mDDXgD1LByk9e7ACziouwA3VprxkQiO4t4NqZoe1FfrV70PVtOo09NP0QJNgCAQQYCTqcYV6yGIeiLyAAuGywlNhMN96Y0gxq2eao9yiddMbutcfrCC0fLewcdrKB80PmF2hrxQLfKKB_Y1bKhzcu3P5S5R37W5LhY_wPxPvgipdJbbIZ9dgrQUbBummGNjL5s2AwVwna7ELy_I50E5GkKoHeCnacKygtQ')" }}
                            />

                            {/* Party Roster */}
                            <div>
                                <h4 className="text-orange-400/70 uppercase tracking-widest text-xs mb-3 border-b border-stone-700 pb-1 font-bold">Current Party</h4>
                                <div className="flex gap-3">
                                    {data.partyMembers.map((member, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-12 h-12 rounded bg-stone-800 border border-stone-600 bg-cover bg-center shadow-lg transition-all ${member.isActive ? '' : 'grayscale opacity-50'}`}
                                            style={{ backgroundImage: `url('${member.url}')` }}
                                            title={member.alt}
                                        />
                                    ))}
                                    <div className="flex items-center justify-center w-12 h-12 rounded bg-stone-800/50 border border-stone-700 border-dashed text-stone-600">
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quest Info */}
                            <div>
                                <h4 className="text-orange-400/70 uppercase tracking-widest text-xs mb-2 border-b border-stone-700 pb-1 font-bold">Active Quest</h4>
                                <p className="text-white font-bold text-lg leading-tight mb-1">{data.activeQuest.title}</p>
                                <p className="text-stone-400 text-sm italic">{data.activeQuest.description}</p>
                            </div>

                            {/* Difficulty / Version */}
                            <div className="mt-auto pt-4 border-t border-stone-700/50">
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-stone-500 font-mono">
                                        GAME VERSION {data.gameVersion}<br />
                                        DIFFICULTY: {data.difficulty}
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-[#f2330d] text-sm">skull</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer / Action Bar */}
                <footer className="flex-none px-12 pb-10 pt-4 flex justify-between items-end relative z-20">
                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        className="group relative px-8 py-3 bg-stone-800 rounded overflow-hidden shadow-lg transform transition active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/rust.png')]" />
                        <div className="absolute inset-0 border border-stone-500 opacity-50 rounded" />
                        <div className="relative flex items-center gap-3">
                            <span className="material-symbols-outlined text-orange-200/50 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span className="font-bold text-orange-100/80 tracking-widest group-hover:text-white transition-colors uppercase">RETURN</span>
                        </div>
                    </button>

                    {/* Load Button */}
                    <button
                        onClick={() => onLoad?.(selectedSaveId)}
                        className="group relative px-16 py-5 bg-stone-900 rounded-lg overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(242,51,13,0.4)]"
                    >
                        <div className="absolute inset-0 bg-stone-800 bg-stone-texture opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#f2330d] via-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2330d] to-transparent opacity-50 blur-sm group-hover:h-full group-hover:opacity-20 transition-all duration-700" />
                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cracked-ground.png')] mix-blend-color-dodge" />
                        <div className="absolute inset-0 border-4 border-stone-600 rounded-lg group-hover:border-orange-500/50 transition-colors duration-300" />
                        <div className="relative flex flex-col items-center z-10">
                            <span className="text-2xl font-black text-stone-300 tracking-[0.2em] group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,100,0,0.8)] transition-all uppercase">LOAD GAME</span>
                            <div className="h-[1px] w-12 bg-stone-500 mt-1 group-hover:w-full group-hover:bg-orange-400 transition-all duration-500" />
                        </div>
                    </button>
                </footer>
            </div>
        </div>
    );
}
