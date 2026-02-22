import React from 'react';
import { mockCharacterBackgroundData, NavStep } from '../../data/stitch/characterBackgroundData';

export interface CharacterBackgroundProps {
    onConfirm?: () => void;
    onNavigate?: (id: string) => void;
    characterSummary: {
        name: string;
        title: string;
        imageUrl: string;
        race: { name: string, icon: string, subtitle: string };
        class: { name: string, icon: string, subtitle: string };
        stats: { label: string, value: number, isPrimary?: boolean }[];
        history: { title: string, dropCap: string, content: string[] };
        alignment: string;
        deity: string;
    };
    navSteps: NavStep[];
}

export function CharacterBackground({
    onConfirm,
    onNavigate,
    characterSummary,
    navSteps
}: CharacterBackgroundProps) {
    return (
        <div className="flex-1 flex w-full h-screen relative bg-[#221012] font-display text-slate-100 overflow-hidden selection:bg-primary selection:text-white select-none">

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-40 pointer-events-none z-0 bg-leather-texture mix-blend-overlay" />

            {/* Left Column: Navigation Index */}
            <aside className="relative z-10 w-64 bg-[#181112] border-r border-[#3a282a] flex flex-col justify-between shadow-xl">
                <div className="p-8 border-b border-[#3a282a]">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-3xl">swords</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-wide text-[#b99d9f] uppercase">Dragons &<br /><span className="text-white">Dungeons</span></h1>
                </div>

                <nav className="flex-1 px-6 py-10 flex flex-col gap-6">
                    {navSteps.map((step) => (
                        <div
                            key={step.id}
                            onClick={() => step.status !== 'locked' && onNavigate?.(step.id)}
                            className={`flex flex-col gap-1 relative ${step.status === 'locked' ? 'opacity-40 cursor-default' : 'cursor-pointer hover:opacity-100 transition-opacity'}`}
                        >
                            {step.status === 'active' && (
                                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_rgba(212,17,33,0.8)]" />
                            )}

                            <div className={`flex items-center justify-between ${step.status === 'active' ? 'text-primary' : 'text-[#b99d9f]'}`}>
                                <span className={`text-xs uppercase tracking-widest font-sans ${step.status === 'active' ? 'font-bold' : ''}`}>Paso {step.stepNum}</span>
                                <span className={`material-symbols-outlined text-sm ${step.status === 'active' ? 'animate-pulse' : ''}`}>
                                    {step.status === 'completed' ? 'check_circle' : step.status === 'active' ? 'edit' : 'lock'}
                                </span>
                            </div>
                            <div className={`${step.status === 'active' ? 'text-2xl text-white font-bold text-glow-red' : 'text-lg text-slate-300 font-medium'} border-l-2 border-[#3a282a] pl-3 py-1`}>
                                {step.label}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-[#3a282a]">
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-[#3a282a] flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-[#b99d9f]">Jugador</span>
                            <span className="text-sm text-white">Guest_01</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Middle Column: Visual Hero */}
            <main className="relative z-0 flex-1 bg-[#120d0e] flex items-end justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(168,48,30,0.15),transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(212,17,33,0.1),transparent_60%)]" />

                <div className="relative h-[90%] w-full max-w-2xl flex items-end justify-center">
                    <img
                        src={characterSummary.imageUrl}
                        alt={characterSummary.name}
                        className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] mask-image-gradient-b"
                    />
                    <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#120d0e] via-[#120d0e]/80 to-transparent" />
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#b99d9f] to-transparent mb-2" />
                    <h2 className="text-3xl font-display font-bold text-white tracking-widest uppercase text-shadow-sm">{characterSummary.name}</h2>
                    <span className="text-[#b99d9f] text-sm tracking-[0.3em] uppercase mt-1">{characterSummary.title}</span>
                </div>
            </main>

            {/* Right Column: Character Sheet Bento */}
            <aside className="relative z-10 w-[480px] bg-[#1c1617] border-l border-[#3a282a] flex flex-col shadow-2xl overflow-y-auto custom-scrollbar">
                <div className="p-8 flex flex-col gap-6 h-full">
                    <div className="flex items-baseline justify-between border-b border-[#3a282a] pb-4">
                        <h3 className="text-2xl text-white font-bold uppercase tracking-wide">Hoja de Personaje</h3>
                        <span className="text-primary text-sm font-sans font-bold uppercase tracking-wider">Borrador</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Module icon={characterSummary.race.icon} label="Raza" value={characterSummary.race.name} sub={characterSummary.race.subtitle} />
                        <Module icon={characterSummary.class.icon} label="Clase" value={characterSummary.class.name} sub={characterSummary.class.subtitle} />
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                        {characterSummary.stats.map((stat) => (
                            <div
                                key={stat.label}
                                className={`flex flex-col items-center bg-[#181112] border border-[#3a282a] rounded p-2 border-stone ${stat.isPrimary ? 'ring-1 ring-primary/30' : ''}`}
                            >
                                <span className={`text-[10px] uppercase font-sans font-bold ${stat.isPrimary ? 'text-primary' : 'text-[#b99d9f]'}`}>{stat.label}</span>
                                <span className={`text-lg font-bold ${stat.isPrimary ? 'text-primary' : 'text-white'}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[#b99d9f] text-xs uppercase tracking-wider font-sans">{characterSummary.history.title}</p>
                            <span className="material-symbols-outlined text-[#b99d9f] text-sm">history_edu</span>
                        </div>
                        <div className="flex-1 bg-parchment-dark rounded border border-[#3a282a] p-6 parchment-texture relative shadow-inner overflow-hidden flex flex-col">
                            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#543b3d]"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#543b3d]"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#543b3d]"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#543b3d]"></div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="prose prose-invert prose-p:text-slate-300 prose-p:font-display prose-p:text-lg prose-p:leading-relaxed">
                                    <p>
                                        <span className="float-left text-6xl font-bold text-primary mr-3 mt-[-10px] font-display drop-shadow-md">{characterSummary.history.dropCap}</span>
                                        {characterSummary.history.content[0]}
                                    </p>
                                    {characterSummary.history.content.slice(1).map((para, i) => (
                                        <p key={i} className="mt-2 indent-4">{para}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SmallModule icon="balance" label="Alineamiento" value={characterSummary.alignment} />
                        <SmallModule icon="church" label="Deidad" value={characterSummary.deity} />
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#3a282a]">
                        <button
                            onClick={onConfirm}
                            className="w-full group relative flex items-center justify-center gap-3 bg-[#181112] hover:bg-[#250e10] text-white py-5 px-6 rounded-sm border-gold transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none"
                        >
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"></div>
                            <span className="material-symbols-outlined text-[#c5a059] group-hover:text-primary transition-colors text-2xl">verified_user</span>
                            <span className="text-xl font-bold tracking-[0.2em] uppercase font-display text-[#e3dacb] group-hover:text-white transition-colors relative z-10 text-shadow-sm">Sellar Pacto</span>
                            <span className="material-symbols-outlined text-[#c5a059] group-hover:text-primary transition-colors text-2xl">edit_document</span>
                        </button>
                        <p className="text-center text-[10px] text-[#543b3d] mt-3 font-sans uppercase tracking-widest font-bold">
                            ESTA ACCIÓN ES IRREVERSIBLE
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function Module({ icon, label, value, sub }: { icon: string, label: string, value: string, sub: string }) {
    return (
        <div className="bg-[#261e1f] border border-[#3a282a] p-4 rounded border-stone relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-4xl">{icon}</span>
            </div>
            <p className="text-[#b99d9f] text-xs uppercase tracking-wider font-sans mb-1">{label}</p>
            <p className="text-white text-xl font-bold">{value}</p>
            <p className="text-xs text-[#b99d9f]/60 mt-1 italic">{sub}</p>
        </div>
    );
}

function SmallModule({ icon, label, value }: { icon: string, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded border border-[#3a282a] bg-[#181112] border-stone">
            <span className="material-symbols-outlined text-[#b99d9f]">{icon}</span>
            <div className="flex flex-col">
                <span className="text-[10px] text-[#b99d9f] uppercase font-bold leading-none mb-1">{label}</span>
                <span className="text-sm text-white font-medium">{value}</span>
            </div>
        </div>
    );
}
