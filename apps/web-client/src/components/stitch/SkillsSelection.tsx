import React, { useState } from 'react';
import { mockSkillsSelectionData, Skill } from '../../data/stitch/skillsSelectionData';

export interface SkillsSelectionProps {
    onConfirm?: () => void;
    onNavigate?: (id: string) => void;
    skills: Skill[];
    remainingPoints: number;
    characterName: string;
    characterTitle: string;
    characterQuote: string;
    characterImage: string;
    compendium: { title: string, dropCap: string, content: string[] };
}

export function SkillsSelection({
    onConfirm,
    onNavigate,
    skills,
    remainingPoints,
    characterName,
    characterTitle,
    characterQuote,
    characterImage,
    compendium
}: SkillsSelectionProps) {
    const [activeSkillId, setActiveSkillId] = useState<string | null>(skills[0].id);

    const activeSkill = skills.find((s: Skill) => s.id === activeSkillId) || skills[0];

    return (
        <div className="relative flex w-full h-screen overflow-hidden bg-[#181411] bg-leather-texture text-slate-200 font-display select-none">

            {/* Left Column: Navigation */}
            <aside className="w-64 h-full border-r border-[#3a2e26] flex flex-col bg-[#120f0d] shadow-2xl z-20 relative">
                <div className="p-6 border-b border-[#3a2e26]/50">
                    <h1 className="text-[#f26c0d] text-xl font-bold tracking-wider text-glow-primary">DRAGONS &<br />DUNGEONS</h1>
                    <p className="text-[#8c7b6d] text-xs mt-1 italic font-medium">Hoja de Personaje</p>
                </div>

                <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'raza', label: 'Raza', icon: 'groups' },
                        { id: 'clase', label: 'Clase', icon: 'swords' },
                        { id: 'atributos', label: 'Atributos', icon: 'psychology' },
                        { id: 'habilidades', label: 'Habilidades', icon: 'history_edu', active: true },
                        { id: 'equipo', label: 'Equipo', icon: 'backpack' },
                        { id: 'trasfondo', label: 'Trasfondo', icon: 'menu_book' },
                    ].map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onNavigate?.(item.id)}
                            className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all ${item.active
                                ? 'nav-item-active'
                                : 'group text-[#8c7b6d] hover:text-[#baa89c] hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${item.active ? 'text-[#f26c0d]' : ''}`}
                                style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {item.icon}
                            </span>
                            <span className={`text-sm tracking-wide ${item.active ? 'font-bold text-white drop-shadow-md' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-[#3a2e26]/50 text-center">
                    <p className="text-[#5c4d3c] text-[10px] uppercase tracking-widest font-bold font-mono">v.1.0.4 - Grim Dark</p>
                </div>
            </aside>

            {/* Middle Column: Character Visualization */}
            <main className="flex-1 relative border-r border-[#3a2e26] bg-[#0a0807] overflow-hidden group">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity transition-opacity duration-700 group-hover:opacity-80"
                    style={{ backgroundImage: `url('${characterImage}')` }}
                />
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#181411] via-transparent to-[#181411] opacity-90 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#181411] via-transparent to-[#181411] opacity-80 pointer-events-none" />

                {/* Content Overlay */}
                <div className="absolute bottom-10 left-0 right-0 text-center px-8 z-10">
                    <div className="inline-block p-1 border border-[#f26c0d]/30 rounded-full bg-[#181411]/80 backdrop-blur-sm mb-4">
                        <span className="px-4 py-1 text-xs uppercase tracking-widest text-[#f26c0d] font-bold">{characterTitle}</span>
                    </div>
                    <h2 className="text-4xl text-white font-bold tracking-tight drop-shadow-lg mb-2">{characterName}</h2>
                    <p className="text-[#baa89c] text-lg italic max-w-md mx-auto">{characterQuote}</p>
                </div>
            </main>

            {/* Right Column: Skills & Lore Bento Box */}
            <aside className="w-[480px] min-w-[400px] flex flex-col bg-[#1c1612] relative z-10 shadow-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#3a2e26] bg-[#181411] flex justify-between items-center">
                    <h3 className="text-2xl text-[#e3d5c5] font-bold border-b-2 border-[#f26c0d] pb-1 inline-block">Lista de Habilidades</h3>
                    <div className="flex items-center gap-2 text-[#8c7b6d] text-sm font-bold">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span>{remainingPoints} Puntos Restantes</span>
                    </div>
                </div>

                {/* Scrollable Skills List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#1c1612] relative custom-scrollbar">
                    {skills.map((skill) => (
                        <div
                            key={skill.id}
                            onClick={() => setActiveSkillId(skill.id)}
                            className={`group relative bg-[#2a221b] border rounded overflow-hidden shadow-lg transition-all cursor-pointer ${activeSkillId === skill.id
                                ? 'border-[#f26c0d]/50'
                                : 'border-[#3a2e26] hover:border-[#f26c0d]/50 hover:shadow-glow'
                                }`}
                        >
                            {activeSkillId === skill.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f26c0d]" />}

                            <div className={`p-4 transition-all ${activeSkillId === skill.id ? '' : 'p-3'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded border border-[#3a2e26] transition-colors ${activeSkillId === skill.id ? 'bg-[#181411] text-[#f26c0d]' : 'bg-[#181411] text-[#8c7b6d] group-hover:text-[#e3d5c5]'
                                            }`}>
                                            <span className="material-symbols-outlined">{skill.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className={`font-bold transition-colors ${activeSkillId === skill.id ? 'text-[#e3d5c5] text-lg' : 'text-[#e3d5c5] text-base group-hover:text-white'
                                                }`}>
                                                {skill.name}
                                            </h4>
                                            <p className="text-[#8c7b6d] text-[10px] uppercase tracking-wide mt-1 font-bold">
                                                {skill.attribute} • {skill.mastery}
                                            </p>
                                            {activeSkillId === skill.id && (
                                                <p className="text-[#baa89c] text-sm mt-2 leading-relaxed opacity-100 transition-all duration-300">
                                                    {skill.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span
                                            className={`material-symbols-outlined transition-all ${skill.rank ? 'text-[#f26c0d]' : 'text-[#8c7b6d] group-hover:text-[#f26c0d] opacity-30 group-hover:opacity-100'
                                                }`}
                                            style={{ fontVariationSettings: `'FILL' ${activeSkillId === skill.id || skill.rank ? 1 : 0}` }}
                                        >
                                            verified
                                        </span>
                                        {skill.rank && <span className="text-[10px] text-[#f26c0d] font-bold">Rango {skill.rank}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lore Panel */}
                <div className="h-1/3 min-h-[220px] bg-[#e3d5c5] bg-parchment-texture text-[#2a221b] p-6 relative border-t-4 border-[#3a2e26] shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-20">
                    <div className="absolute top-2 right-2 opacity-50 text-[#5c4d3c] pointer-events-none">
                        <span className="material-symbols-outlined text-[32px]">ink_pen</span>
                    </div>
                    <h5 className="text-[#5c4d3c] text-xs font-bold uppercase tracking-widest mb-3 border-b border-[#5c4d3c]/30 pb-1">
                        {compendium.title}
                    </h5>
                    <div className="prose prose-sm prose-p:text-[#2a221b] leading-relaxed overflow-y-auto h-[calc(100%-40px)] pr-2 custom-scrollbar-wide">
                        <p>
                            <span className="drop-cap">{compendium.dropCap}</span>
                            {compendium.content[0]}
                        </p>
                        {compendium.content.slice(1).map((para, i) => (
                            <p key={i} className="mt-2 indent-4">
                                {para}
                            </p>
                        ))}
                    </div>
                </div>

                {/* CTA Footer */}
                <div className="p-6 bg-[#181411] border-t border-[#3a2e26] flex justify-end">
                    <button
                        onClick={onConfirm}
                        className="group relative bg-[#2a221b] hover:bg-[#3a2e26] text-[#e3d5c5] pl-6 pr-12 py-3 rounded border border-[#5c4d3c] transition-all hover:border-[#f26c0d] shadow-lg active:scale-95"
                    >
                        <span className="relative z-10 font-bold tracking-widest uppercase text-sm group-hover:text-[#f26c0d] transition-colors">
                            Sellar Pacto
                        </span>
                        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-[#8c1c1c] group-hover:text-[#f26c0d] transition-all drop-shadow-md">
                            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>approval</span>
                        </div>
                    </button>
                </div>
            </aside>
        </div>
    );
}
