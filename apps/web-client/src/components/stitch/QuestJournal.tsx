import React, { useState } from 'react';
import { Quest, questsData } from '../../data/stitch/questJournalData';

export interface QuestJournalProps {
    quests?: Quest[];
    onClose?: () => void;
    onSettings?: () => void;
    onNavigate?: (tab: string) => void;
}

export function QuestJournal({
    quests = questsData,
    onClose,
    onSettings,
    onNavigate
}: QuestJournalProps) {
    const [activeQuestId, setActiveQuestId] = useState<string>(quests[0]?.id || '');
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    const activeQuest = quests.find(q => q.id === activeQuestId);

    return (
        <div className="flex flex-col h-screen overflow-hidden text-paper font-display bg-leather dark selection:bg-primary/30 selection:text-ink">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-overlay bg-leather-texture"></div>

            {/* Top Navigation */}
            <header className="relative z-10 w-full px-6 py-3 border-b border-[#393328] bg-[#181611]/90 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between mx-auto max-w-7xl">
                    <div className="flex items-center gap-4">
                        <div className="size-8 text-primary">
                            <span className="material-symbols-outlined !text-[32px]">auto_stories</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-wide text-white font-display">Diario de Historia</h1>
                    </div>

                    <nav className="items-center hidden gap-8 md:flex">
                        {['Inventario', 'Mapa', 'Habilidades'].map(tab => (
                            <button key={tab} onClick={() => onNavigate?.(tab)} className="text-[#b9b09d] hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase">
                                {tab}
                            </button>
                        ))}
                        <button className="pb-1 text-sm font-bold tracking-wide uppercase border-b-2 text-primary border-primary">
                            Gesta
                        </button>
                        <button onClick={() => onNavigate?.('Bestiario')} className="text-[#b9b09d] hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase">
                            Bestiario
                        </button>
                    </nav>

                    <div className="flex gap-3">
                        <button onClick={onSettings} className="flex items-center justify-center rounded size-9 bg-[#393328] text-[#b9b09d] hover:text-white hover:bg-[#4a4233] transition-colors">
                            <span className="material-symbols-outlined !text-[20px]">settings</span>
                        </button>
                        <button onClick={onClose} className="flex items-center justify-center rounded size-9 bg-[#393328] text-[#b9b09d] hover:text-white hover:bg-[#8a1c1c] transition-colors">
                            <span className="material-symbols-outlined !text-[20px]">close</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area: The Open Book */}
            <main className="relative z-10 flex items-center justify-center flex-1 p-4 lg:p-10">
                <div className="relative flex w-full h-full overflow-hidden border rounded-lg max-w-6xl max-h-[850px] bg-[#2c221a] shadow-book border-[#3e3226]">
                    {/* Book Binding/Spine Effect */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-8 -ml-4 z-20 pointer-events-none bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
                    <div className="absolute top-0 bottom-0 z-20 w-[1px] opacity-50 left-1/2 bg-[#1a1310]"></div>

                    {/* Left Page: Quest Index */}
                    <section className="relative flex flex-col w-1/2 group bg-paper shadow-page-left">
                        <div className="absolute inset-0 opacity-60 pointer-events-none mix-blend-multiply bg-paper-texture"></div>

                        <div className="relative z-10 flex flex-col h-full p-8">
                            {/* Decorative Header */}
                            <div className="flex flex-col items-center pb-4 mb-6 border-b-2 border-ink/20">
                                <h2 className="text-3xl font-bold tracking-tight text-ink">Crónicas</h2>
                                <span className="mt-1 text-sm italic font-serif text-ink-light">Registro de hazañas y penurias</span>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex px-2 mb-6 space-x-4">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className="relative group/tab"
                                >
                                    <span className={`relative z-10 pb-1 text-lg font-bold transition-colors ${activeTab === 'active' ? 'text-ink border-b-2 border-primary' : 'text-ink-light'}`}>
                                        Misiones Activas
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className="relative group/tab"
                                >
                                    <span className={`relative z-10 pb-1 text-lg font-bold transition-colors ${activeTab === 'completed' ? 'text-ink border-b-2 border-primary' : 'text-ink-light'}`}>
                                        Relatos Completados
                                    </span>
                                </button>
                            </div>

                            {/* Quest List */}
                            <div className="flex-1 pr-2 space-y-4 overflow-y-auto journal-scroll">
                                {quests.filter(q => activeTab === 'active' ? q.status !== 'completed' : q.status === 'completed').map((quest) => {
                                    const isActive = quest.id === activeQuestId;

                                    // Icon configuration based on status
                                    let icon = 'pending';
                                    let iconColorClass = 'text-ink-light/50';
                                    let fill = 0;

                                    if (quest.status === 'active') { icon = 'verified'; iconColorClass = 'text-primary drop-shadow-md'; fill = 1; }
                                    else if (quest.status === 'danger') { icon = 'local_fire_department'; iconColorClass = 'text-danger drop-shadow-md'; fill = 1; }

                                    return (
                                        <div key={quest.id} onClick={() => setActiveQuestId(quest.id)} className={`relative group cursor-pointer rounded-sm transition-colors ${isActive ? '' : 'hover:bg-ink/5 p-2'}`}>
                                            {isActive && <div className="absolute inset-0 transition-opacity rounded transform -skew-x-1 opacity-100 bg-ink/5 torn-paper"></div>}

                                            <div className={`relative flex items-start gap-4 pl-3 transition-opacity border-l-4 ${isActive ? 'p-4 border-primary' : 'p-2 border-transparent opacity-70 group-hover:opacity-100'}`}>
                                                <div className={`shrink-0 mt-1 ${iconColorClass}`}>
                                                    <span className="material-symbols-outlined !text-[28px]" style={{ fontVariationSettings: `'FILL' ${fill}` }}>
                                                        {icon}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold leading-tight text-ink ${isActive ? 'text-xl group-hover:underline decoration-ink/50 decoration-2 underline-offset-2' : 'text-lg'}`}>
                                                        {quest.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm italic font-serif text-ink-light">{quest.region}</p>

                                                    {isActive && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-0.5 text-xs font-bold tracking-wider uppercase rounded-sm text-paper bg-ink">
                                                                {quest.type}
                                                            </span>
                                                            {quest.lastUpdated && <span className="text-xs text-ink-light">Actualizado: {quest.lastUpdated}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Decoration */}
                            <div className="flex justify-center mt-4 opacity-40">
                                <span className="material-symbols-outlined text-ink !text-[24px]">stylus</span>
                            </div>
                        </div>
                    </section>

                    {/* Right Page: Quest Details */}
                    <section className="relative flex flex-col w-1/2 bg-paper shadow-page-right">
                        <div className="absolute inset-0 opacity-60 pointer-events-none mix-blend-multiply bg-paper-texture"></div>

                        <div className="relative z-10 h-full p-8 overflow-y-auto journal-scroll">
                            {activeQuest ? (
                                <>
                                    {/* Sketch/Illustration Area */}
                                    {activeQuest.imageUrl && (
                                        <div className="relative w-full p-1 mb-6 border-4 border-double transform rotate-1 shadow-sm h-48 border-ink/20 bg-paper-dark">
                                            <div className="relative w-full h-full overflow-hidden bg-[#2a2a2a] grayscale contrast-125 sepia-[.3]">
                                                <div
                                                    className="absolute inset-0 opacity-80 mix-blend-multiply bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${activeQuest.imageUrl}')` }}
                                                ></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            </div>
                                            <div className="absolute bottom-2 right-4 text-xs italic text-white/90 drop-shadow-md font-serif">
                                                {activeQuest.imageCaption}
                                            </div>
                                            {/* Tape effect */}
                                            <div className="absolute h-6 -translate-x-1/2 border shadow-sm w-24 bg-[#e8dec0] -top-3 left-1/2 opacity-80 rotate-1 border-black/10"></div>
                                        </div>
                                    )}

                                    {/* Quest Title */}
                                    <div className="mb-6 text-center">
                                        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-ink" style={{ fontFeatureSettings: "'swsh' 1" }}>
                                            {activeQuest.title}
                                        </h1>
                                        <div className="flex items-center justify-center gap-2 text-sm italic text-ink-light">
                                            <span className="material-symbols-outlined !text-[16px]">location_on</span>
                                            <span>Región: {activeQuest.region}</span>
                                        </div>
                                    </div>

                                    {/* Narrative Text */}
                                    {activeQuest.narrativeParagraphs.length > 0 && (
                                        <article className="mb-8 prose prose-p:text-ink prose-headings:text-ink">
                                            {activeQuest.narrativeParagraphs.map((text, idx) => (
                                                <p key={idx} className={`${idx === 0 ? 'drop-cap ' : 'mt-4 '}text-lg leading-relaxed text-justify text-ink/90 font-serif`}>
                                                    {text}
                                                </p>
                                            ))}
                                        </article>
                                    )}

                                    {/* Objectives */}
                                    {activeQuest.objectives.length > 0 && (
                                        <div className="pl-2 mb-8">
                                            <h3 className="inline-block pb-1 mb-4 text-xl font-bold border-b text-ink border-ink/30">Objetivos</h3>
                                            <ul className="space-y-4">
                                                {activeQuest.objectives.map((obj) => (
                                                    <li key={obj.id} className={`flex items-start gap-3 group ${obj.status === 'pending' ? 'opacity-80' : ''}`}>
                                                        <div className="relative mt-1">
                                                            {obj.status === 'completed' && (
                                                                <div className="flex items-center justify-center border-2 rounded-sm size-5 border-ink">
                                                                    <span className="material-symbols-outlined text-ink !text-[20px] font-bold">close</span>
                                                                </div>
                                                            )}
                                                            {obj.status === 'active' && (
                                                                <div className="border-2 rounded-sm size-5 border-primary bg-paper shadow-inner"></div>
                                                            )}
                                                            {obj.status === 'pending' && (
                                                                <div className="border-2 rounded-sm size-5 border-ink/40"></div>
                                                            )}
                                                        </div>
                                                        <span className={`text-lg 
                              ${obj.status === 'completed' ? 'text-ink line-through decoration-ink/60 decoration-2 opacity-70' : ''}
                              ${obj.status === 'active' ? 'text-ink font-semibold' : ''}
                              ${obj.status === 'pending' ? 'text-ink/80 italic' : ''}
                            `}>
                                                            {obj.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Rewards & Margin Notes */}
                                    {(activeQuest.rewards.length > 0 || activeQuest.handwrittenNote) && (
                                        <div className="relative pt-6 mt-auto border-t border-dashed border-ink/30">
                                            {activeQuest.rewards.length > 0 && (
                                                <>
                                                    <h4 className="mb-2 text-sm font-bold tracking-widest uppercase text-ink/70">Recompensas Estimadas</h4>
                                                    <div className="flex gap-4">
                                                        {activeQuest.rewards.map((reward, idx) => (
                                                            <div key={idx} className="flex flex-col items-center p-2 border rounded w-20 bg-ink/5 border-ink/10">
                                                                <span className={`material-symbols-outlined !text-[24px] mb-1 ${reward.type === 'gold' ? 'text-primary' : 'text-ink'}`}>
                                                                    {reward.icon}
                                                                </span>
                                                                <span className="text-xs font-bold text-ink">{reward.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            {activeQuest.handwrittenNote && (
                                                <div className="absolute bottom-4 right-0 max-w-[150px] -rotate-2 text-right">
                                                    <p className="text-sm italic leading-tight font-serif text-danger">
                                                        {activeQuest.handwrittenNote}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full opacity-50 text-ink-light">
                                    <p className="font-serif italic text-center">Selecciona un relato para ver los detalles...</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
