import React, { useState } from 'react';
import { characterClassesData, classIcons, creationSteps } from '../../data/stitch/characterClassData';

export interface CharacterClassSelectionProps {
    onSelectClass?: (classId: string) => void;
    onSealPact?: () => void;
    playerName?: string;
}

export function CharacterClassSelection({
    onSelectClass,
    onSealPact,
    playerName = 'LordVerx'
}: CharacterClassSelectionProps) {
    const [activeIndex, setActiveIndex] = useState(characterClassesData.findIndex(c => c.id === 'necromancer') || 0);
    const activeClass = characterClassesData[activeIndex];

    const handleNext = () => {
        const next = (activeIndex + 1) % characterClassesData.length;
        setActiveIndex(next);
        onSelectClass?.(characterClassesData[next].id);
    };

    const handlePrev = () => {
        const prev = (activeIndex - 1 + characterClassesData.length) % characterClassesData.length;
        setActiveIndex(prev);
        onSelectClass?.(characterClassesData[prev].id);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden text-slate-100 font-display bg-[#0f0a0a]">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#39282b] px-8 py-4 bg-[#140e0f] z-20 shadow-lg">
                <div className="flex items-center gap-4 text-white">
                    <div className="size-6 text-[#ec1337]">
                        <span className="material-symbols-outlined !text-[28px]">token</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-widest text-white uppercase" style={{ letterSpacing: '0.15em' }}>
                        Dragons & Dungeons
                    </h2>
                </div>
                <div className="flex items-center gap-6">
                    <button className="transition-colors text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="w-px h-8 bg-[#39282b]"></div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm tracking-wider uppercase text-slate-400">Jugador:</span>
                        <span className="font-medium text-white">{playerName}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative flex flex-1 overflow-hidden">
                {/* Left Column: Navigation Stepper */}
                <aside className="w-64 flex flex-col border-r border-[#39282b] bg-[#140e0f] z-10 relative">
                    <div className="flex flex-col gap-2 p-6 border-b border-[#39282b]">
                        <h1 className="text-sm font-bold tracking-widest uppercase opacity-80 text-[#cfae70]">Creación</h1>
                        <p className="text-lg font-medium text-white">Nuevo Personaje</p>
                    </div>

                    <nav className="flex flex-col flex-1 gap-6 px-4 py-8">
                        {creationSteps.map(step => (
                            <div
                                key={step.id}
                                className={`group flex items-center gap-4 p-3 rounded cursor-pointer transition-colors ${step.status === 'active'
                                    ? 'bg-[#ec1337]/10 border border-[#ec1337]/30 shadow-[0_0_15px_rgba(236,19,55,0.15)] relative'
                                    : step.status === 'completed'
                                        ? 'hover:bg-white/5 opacity-60'
                                        : 'hover:bg-white/5 opacity-40 hover:opacity-70'
                                    }`}
                            >
                                {step.status === 'active' && (
                                    <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l shadow-[0_0_10px_#ec1337] bg-[#ec1337]"></div>
                                )}

                                <div className={`flex items-center justify-center size-8 rounded-full ${step.status === 'active'
                                    ? 'bg-[#ec1337] text-white shadow-lg shadow-[#ec1337]/40'
                                    : 'border border-slate-600 text-slate-400'
                                    }`}>
                                    {step.status === 'active' || step.status === 'completed' ? (
                                        <span className="material-symbols-outlined !text-[18px]">{step.icon}</span>
                                    ) : (
                                        <span className="text-xs font-bold font-sans">{step.icon}</span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold uppercase tracking-wider ${step.status === 'active' ? 'text-white' : 'text-slate-500'}`}>
                                        {step.label}
                                    </span>
                                    {step.value && (
                                        <span className={`text-xs font-sans ${step.status === 'active' ? 'text-[#ec1337] animate-pulse' : 'text-slate-500'}`}>
                                            {step.value}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-[#39282b] opacity-50">
                        <div className="flex items-center gap-2 text-xs font-sans text-slate-500">
                            <span className="material-symbols-outlined !text-[14px]">info</span>
                            <span>Progreso guardado</span>
                        </div>
                    </div>
                </aside>

                {/* Middle Column: Visual Showcase */}
                <section className="relative flex items-center justify-center flex-1 overflow-hidden bg-black border-r group border-[#39282b]">
                    <div className="absolute inset-0 z-10 opacity-80 bg-gradient-to-t from-black via-transparent to-black"></div>
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ec1337]/10 via-transparent to-transparent"></div>

                    {/* Character Image */}
                    <div
                        className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out transform bg-center bg-no-repeat bg-contain group-hover:scale-110 scale-105"
                        title={activeClass.imageAlt}
                        style={{ backgroundImage: `url('${activeClass.imageUrl}')` }}
                    />

                    <div className="absolute left-0 right-0 z-20 text-center pointer-events-none bottom-20">
                        <h2 className="text-[120px] font-bold text-white/5 tracking-[0.2em] uppercase leading-none select-none">
                            Necro
                        </h2>
                    </div>
                </section>

                {/* Right Column: Bento Box Details */}
                <aside className="w-[480px] bg-[#181112] flex flex-col h-full overflow-y-auto custom-scrollbar relative">
                    <div className="flex flex-col gap-6 p-8 pb-24">

                        {/* Module 1: Class Selector Carousel */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-slate-400">
                                <span>Clase</span>
                                <span>Dificultad: {activeClass.difficulty}</span>
                            </div>

                            <div className="relative flex items-center justify-between bg-[#221013] border border-[#39282b] p-2 rounded-lg">
                                <button
                                    onClick={handlePrev}
                                    className="p-2 transition-colors rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <div className="flex flex-col items-center gap-1">
                                    <h2
                                        className="text-3xl font-bold tracking-wide uppercase drop-shadow-md"
                                        style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)' }}
                                    >
                                        {activeClass.name}
                                    </h2>
                                    <span className="text-xs text-[#ec1337] font-sans uppercase tracking-widest font-bold">
                                        {activeClass.subtitle}
                                    </span>
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="p-2 transition-colors rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>

                            <div className="flex justify-center gap-2 py-2 overflow-x-auto no-scrollbar mask-gradient">
                                {classIcons.map(icon => (
                                    <div
                                        key={icon.id}
                                        className={`flex items-center justify-center rounded transition-all cursor-pointer size-10 ${icon.active
                                            ? 'border border-[#ec1337] bg-[#ec1337]/20 text-white shadow-[0_0_10px_rgba(236,19,55,0.3)]'
                                            : 'border border-[#39282b] bg-[#2a1d20] text-slate-500 hover:border-slate-400'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">{icon.icon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Module 2: Stats (Bento Grid) */}
                        <div className="grid grid-cols-2 gap-3">
                            {activeClass.stats.map((stat, idx) => stat.isMain ? (
                                <div key={idx} className="col-span-2 p-4 bg-[#221013] border border-[#39282b] rounded flex items-center justify-between group hover:border-[#ec1337]/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#39282b] rounded text-[#ec1337]">
                                            <span className="material-symbols-outlined">{stat.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Atributo Principal</span>
                                            <span className="text-lg font-medium text-white">{stat.label}</span>
                                        </div>
                                    </div>
                                    <span className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</span>
                                </div>
                            ) : (
                                <div key={idx} className="p-4 bg-[#221013] border border-[#39282b] rounded flex flex-col gap-2 group hover:border-slate-600 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-wider uppercase text-slate-400">{stat.label}</span>
                                        <span className="text-sm material-symbols-outlined text-slate-500">{stat.icon}</span>
                                    </div>
                                    <span className={`text-xl font-bold ${stat.colorClass}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Module 3: Proficiencies List */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Dominio</span>
                            <div className="flex flex-wrap gap-2">
                                {activeClass.proficiencies.map((prof, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-[#2a1d20] border border-[#39282b] rounded text-xs text-slate-300 font-sans">
                                        {prof}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Module 4: Lore Panel (Parchment Style) */}
                        <div className="relative flex-1 mt-2">
                            <div className="absolute px-2 text-xs font-bold tracking-widest uppercase z-10 -top-3 left-4 bg-[#181112] text-[#cfae70]">
                                Compendio Arcano
                            </div>
                            <div className="relative h-full overflow-hidden p-6 border rounded shadow-inner bg-[#241f18] border-[#4a3e2a]">
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <span className="text-4xl material-symbols-outlined text-[#cfae70]">menu_book</span>
                                </div>
                                <div className="relative z-10 text-lg text-justify opacity-90 leading-relaxed text-[#d4cbb8] font-display">
                                    <span className="float-left mr-2 font-bold text-5xl text-[#ec1337] mt-[-8px] font-display">
                                        {activeClass.lore.dropCap}
                                    </span>
                                    {activeClass.lore.text.split('\n\n').map((paragraph, i) => (
                                        <React.Fragment key={i}>
                                            {paragraph}
                                            {i < activeClass.lore.text.split('\n\n').length - 1 && <><br /><br /></>}
                                        </React.Fragment>
                                    ))}

                                    <span className="block pl-4 mt-4 text-sm italic border-l-2 text-[#a39885] border-[#ec1337]">
                                        {activeClass.lore.quote}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Fixed Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-end p-6 border-t backdrop-blur-sm bg-gradient-to-t from-[#0f0a0a] via-[#0f0a0a] to-transparent border-[#39282b]/30">
                        <button
                            onClick={onSealPact}
                            className="relative flex items-center gap-3 px-8 py-3 font-bold text-white transition-all transform rounded shadow-[0_0_20px_rgba(236,19,55,0.4)] overflow-hidden group bg-[#ec1337] hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span className="relative z-10 text-sm tracking-widest uppercase">Sellar Pacto</span>
                            <span className="relative z-10 text-lg material-symbols-outlined">ink_pen</span>
                            <div className="absolute inset-0 transition-transform duration-700 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full"></div>
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}
