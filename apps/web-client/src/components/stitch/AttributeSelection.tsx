import React from 'react';
import { mockAttributeSelectionData } from '../../data/stitch/attributeSelectionData';

export interface AttributeSelectionProps {
    attributes: { id: string, name: string, value: number, icon: string, glowClass?: string, bgGlowClass?: string }[];
    remainingPoints: number;
    onAttributeChange?: (id: string, delta: number) => void;
    onConfirm?: () => void;
    characterName?: string;
    characterInfo?: string;
    characterImage?: string;
    lore?: { title: string, highlightWord: string, description: string };
}

export function AttributeSelection({
    attributes,
    remainingPoints,
    onAttributeChange,
    onConfirm,
    characterName = 'Arcturus',
    characterInfo = 'Mago de la Academia de Sul',
    characterImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC3c6S5S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1S7-H38m2p5C9S7oH1r90S3_1',
    lore = { title: 'Inteligencia', highlightWord: 'Arcano', description: 'La Inteligencia mide el razonamiento y la memoria.' }
}: AttributeSelectionProps) {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden text-slate-100 font-display bg-[#181411] selection:bg-[#f26c0d] selection:text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 relative z-20 whitespace-nowrap border-b border-[#392f28] bg-[#181411] lg:px-10 shadow-lg">
                <div className="flex items-center gap-4 text-white">
                    <div className="size-8 text-[#f26c0d]">
                        <span className="text-3xl material-symbols-outlined">swords</span>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-widest text-white uppercase">
                        Dragons & Dungeons
                    </h2>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center justify-center overflow-hidden transition-colors border rounded size-10 bg-[#392f28] hover:bg-[#54453b] text-white border-[#54453b]">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <button className="flex items-center justify-center overflow-hidden transition-colors border rounded size-10 bg-[#392f28] hover:bg-[#54453b] text-white border-[#54453b]">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <main className="relative flex flex-col flex-1 overflow-hidden lg:flex-row h-[calc(100vh-64px)] bg-leather-texture">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>

                {/* Left Column: Navigation Index */}
                <nav className="flex flex-col z-10 p-6 border-r shadow-[4px_0_24px_rgba(0,0,0,0.5)] lg:w-64 border-[#392f28] bg-[#1a1612]/90 backdrop-blur-sm">
                    <div className="mb-8">
                        <h1 className="mb-1 text-sm font-bold tracking-widest uppercase opacity-70 text-[#baa89c]">
                            Grimorio del Jugador
                        </h1>
                        <h2 className="text-2xl font-bold leading-tight text-white">
                            Creación
                        </h2>
                    </div>
                    <ul className="flex flex-col gap-2 space-y-2">
                        <li className="flex items-center gap-3 px-3 py-2 cursor-pointer opacity-50 transition-opacity hover:opacity-100 group">
                            <span className="text-lg material-symbols-outlined">face</span>
                            <span className="text-lg">Raza</span>
                        </li>
                        <li className="flex items-center gap-3 px-3 py-2 cursor-pointer opacity-50 transition-opacity hover:opacity-100 group">
                            <span className="text-lg material-symbols-outlined">school</span>
                            <span className="text-lg">Clase</span>
                        </li>
                        {/* Active Item */}
                        <li className="relative flex items-center gap-3 px-4 py-3 border-l-4 rounded bg-gradient-to-r from-[#f26c0d]/20 to-transparent border-[#f26c0d] shadow-glow-ember">
                            <span className="material-symbols-outlined text-[#f26c0d] text-glow-ember">casino</span>
                            <span className="text-xl font-bold text-white text-glow-ember">Atributos</span>
                        </li>
                        <li className="flex items-center gap-3 px-3 py-2 cursor-pointer opacity-50 transition-opacity hover:opacity-100 group">
                            <span className="text-lg material-symbols-outlined">history_edu</span>
                            <span className="text-lg">Trasfondo</span>
                        </li>
                        <li className="flex items-center gap-3 px-3 py-2 cursor-pointer opacity-50 transition-opacity hover:opacity-100 group">
                            <span className="text-lg material-symbols-outlined">backpack</span>
                            <span className="text-lg">Equipo</span>
                        </li>
                    </ul>
                    <div className="pt-6 mt-auto text-center border-t border-[#392f28]">
                        <p className="text-xs italic text-[#baa89c]">
                            "El destino se forja en la piedra de la voluntad."
                        </p>
                    </div>
                </nav>

                {/* Middle Column: Character Bust */}
                <section className="relative z-0 flex flex-col items-center justify-center flex-1 p-8 overflow-hidden lg:p-12">
                    {/* Decorative Frame */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-[500px] h-[500px] rounded-full border border-[#54453b] scale-150"></div>
                        <div className="absolute w-[400px] h-[400px] rounded-full border border-[#54453b] border-dashed animate-[spin_60s_linear_infinite]"></div>
                    </div>

                    <div className="relative overflow-hidden border-2 rounded-b-lg shadow-2xl w-full max-w-md aspect-[3/4] rounded-t-full border-[#54453b] bg-[#110e0c] group">
                        <div
                            className="absolute inset-0 transition-transform duration-700 bg-center bg-no-repeat bg-cover group-hover:scale-105"
                            title="Dark fantasy portrait"
                            style={{ backgroundImage: `url('${characterImage}')` }}
                        />
                        <div className="absolute inset-0 opacity-80 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                        {/* Glowing Eyes Effect Mockup */}
                        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-32 h-10 flex justify-between px-6 opacity-60 mix-blend-screen pointer-events-none">
                            <div className="w-3 h-3 rounded-full blur-sm bg-blue-400 shadow-[0_0_15px_#60a5fa]"></div>
                            <div className="w-3 h-3 rounded-full blur-sm bg-blue-400 shadow-[0_0_15px_#60a5fa]"></div>
                        </div>

                        <div className="absolute bottom-0 w-full px-6 pt-20 pb-6 text-center bg-gradient-to-t from-[#0f0c0a] to-transparent">
                            <h2 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
                                {characterName}
                            </h2>
                            <p className="text-sm italic font-serif text-[#baa89c]">
                                {characterInfo}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Right Column: Attribute Grid */}
                <aside className="flex flex-col z-10 overflow-y-auto border-l shadow-[-4px_0_24px_rgba(0,0,0,0.5)] lg:w-[480px] bg-[#1c1815] border-[#392f28]">
                    <div className="flex flex-col h-full gap-6 p-6 lg:p-8">
                        <header className="flex items-center justify-between pb-4 border-b border-[#392f28]">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-white">Distribución</h2>
                                <p className="text-sm text-[#baa89c]">Define tus capacidades físicas y mentales.</p>
                            </div>
                        </header>

                        {/* Points Pool */}
                        <div className="relative flex items-center justify-between p-4 mb-2 overflow-hidden border-t rounded-lg stone-surface shadow-[0_4px_12px_rgba(0,0,0,0.3)] border-t-[#54453b]/50">
                            <div className="absolute top-0 right-0 p-10 rounded-full pointer-events-none bg-red-600/10 blur-3xl"></div>
                            <div>
                                <span className="block text-xs font-bold tracking-widest uppercase text-[#baa89c]">
                                    Puntos Restantes
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-red-600 crimson-pulse">
                                        {remainingPoints.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-xs italic text-red-600/80">
                                        Límite estándar
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center border-2 rounded-full size-12 shadow-[0_0_15px_rgba(220,38,38,0.2)] border-red-600/30 bg-black/40">
                                <span className="text-red-600 animate-pulse material-symbols-outlined">bolt</span>
                            </div>
                        </div>

                        {/* Attributes Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {attributes.map(attr => (
                                <div
                                    key={attr.id}
                                    className={`relative flex flex-col gap-3 p-4 transition-colors rounded stone-surface group ${attr.bgGlowClass ? `${attr.bgGlowClass} overflow-hidden` : 'hover:border-[#f26c0d]/50'
                                        }`}
                                >
                                    {/* Decorative background for highlighted attribute */}
                                    {attr.bgGlowClass && (
                                        <div className="absolute inset-0 pointer-events-none bg-[#40c4ff]/5"></div>
                                    )}

                                    <div className="relative z-10 flex items-start justify-between">
                                        <span className={`text-sm font-bold tracking-wide ${attr.glowClass ? attr.glowClass : 'text-[#baa89c]'}`}>
                                            {attr.name}
                                        </span>
                                        <span className={`text-lg transition-colors material-symbols-outlined ${attr.glowClass ? attr.glowClass : 'text-[#54453b] group-hover:text-[#f26c0d]'}`}>
                                            {attr.icon}
                                        </span>
                                    </div>

                                    <div className={`relative z-10 flex items-center justify-between p-1 rounded shadow-inset-stone ${attr.bgGlowClass ? 'bg-black/30' : 'bg-black/20'}`}>
                                        <button
                                            onClick={() => onAttributeChange?.(attr.id, -1)}
                                            className="flex items-center justify-center transition-all border rounded btn-rune size-8 bg-[#27201b] hover:border-[#40c4ff]/50 text-[#54453b] hover:text-[#40c4ff] border-[#392f28]"
                                        >
                                            <span className="text-sm material-symbols-outlined">remove</span>
                                        </button>
                                        <span className={`text-2xl font-bold ${attr.glowClass ? attr.glowClass : 'text-white'}`}>
                                            {attr.value.toString().padStart(2, '0')}
                                        </span>
                                        <button
                                            onClick={() => onAttributeChange?.(attr.id, 1)}
                                            className="flex items-center justify-center transition-all border rounded btn-rune size-8 bg-[#27201b] hover:border-[#40c4ff]/50 text-[#54453b] hover:text-[#40c4ff] border-[#392f28]"
                                        >
                                            <span className="text-sm material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Lore Panel */}
                        <div className="relative p-5 mt-auto border rounded shadow-lg bg-[#2a231d] border-[#392f28]">
                            {/* Parchment Texture Overlay */}
                            <div
                                className="absolute inset-0 rounded opacity-10 pointer-events-none"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA9YnkCwJSjRvGFDSdyufPEBbAImA9HwByJX2I4IXxrqKErKzag6eIPT9d0SmxDM6GS6I2QeAFSnWi5e414nwpAU9OBny4ogGsHzU7tFkFjNR1Y4uvcXq3vN1yPRv837-RYJlIhSzYp6y9sImaZh6GpD1dQAxEM0XtrM67l2uKMyEo386ALeqjUrOvz1RNYGIY9cbzd7hUkcjrEwXCClf9Z-geN9ENa_BFKbNXNZoYoCTlsvzLdM5KR-vZU0_3lrl4B745f4f7HjA')" }}
                            ></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2 text-[#baa89c]">
                                    <span className="text-sm material-symbols-outlined">info</span>
                                    <span className="text-xs font-bold tracking-widest uppercase">
                                        {lore.title}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-white font-serif">
                                    <strong className="text-[#40c4ff] text-glow-rune">
                                        {lore.highlightWord}
                                    </strong>{' '}
                                    {lore.description}
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 mt-2 text-lg font-bold text-white transition-all border-t rounded shadow-lg bg-gradient-to-r hover:from-orange-500 hover:to-orange-400 active:scale-[0.99] border-white/20 from-[#f26c0d] to-orange-600"
                        >
                            Confirmar Atributos
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}
