import React from 'react';
import { mockDeathStats } from '../../data/stitch/deathScreenData';

export interface DeathScreenProps {
    onRetry?: () => void;
    onQuit?: () => void;
    stats?: typeof mockDeathStats;
    version?: string;
}

export function DeathScreen({
    onRetry,
    onQuit,
    stats = mockDeathStats,
    version = 'Engine v.4.0.2 - Build: FINAL_BREATH'
}: DeathScreenProps) {
    return (
        <div className="flex flex-col min-h-screen overflow-hidden text-slate-100 font-display bg-[#0f0a0a] selection:bg-[#d41132] selection:text-white">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                {/* Main Atmospheric Image */}
                <div
                    className="absolute inset-0 bg-center bg-cover opacity-40 grayscale contrast-125"
                    title="Foggy dark graveyard with ancient tombstones"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDa_iKiT7ufTJanCApomoxDRu7qJh-ulRcX8Ge0JB_XzYZ2tTfjgvMWhe-o-8qS_vG1y5zH7ayfR89L_hIAAADZX0AehjYRknAd_UlNkYm1aELMMmnm4kYDc0-3CRiJPtYy_qQgfZvE6OMlD_TyXgIuW0N1g2ngs6URZxweyPDWlnlMueF45M1GK18z25pFubKXmXXJV9ZLzn0A4tgS0Dko_E7ZXv3UA624e303y2btRgiQ_EldPyJYm5CHCK7ACaHMNBQPL3d9Cg')" }}
                />
                {/* Fog Overlay */}
                <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog1.png')] opacity-30 animate-[fog-drift_60s_linear_infinite] bg-repeat-x w-[200%] h-full pointer-events-none" />
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f0505_90%)] z-10" />
            </div>

            {/* Ember Particle System */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                <div className="ember-particle w-1 h-1 left-[10%]" style={{ animationDuration: '7s', animationDelay: '0s' }}></div>
                <div className="ember-particle w-1.5 h-1.5 left-[20%]" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
                <div className="ember-particle w-1 h-1 left-[35%]" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
                <div className="ember-particle w-2 h-2 left-[50%]" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
                <div className="ember-particle w-1 h-1 left-[65%]" style={{ animationDuration: '8s', animationDelay: '3s' }}></div>
                <div className="ember-particle w-1.5 h-1.5 left-[80%]" style={{ animationDuration: '6s', animationDelay: '1.5s' }}></div>
                <div className="ember-particle w-1 h-1 left-[90%]" style={{ animationDuration: '9s', animationDelay: '5s' }}></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">

                {/* Tombstone Monument */}
                <div className="relative flex flex-col items-center w-full max-w-2xl">
                    {/* Basalt Stone Header */}
                    <div className="tombstone-shape w-full bg-[#1a1616] p-1 pt-12 pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_60px_rgba(0,0,0,1)] border-t border-white/5 relative overflow-hidden group">
                        {/* Texture/Cracks pattern (inline here for simplicity, could use bg-stone-texture) */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cracked-concrete.png')" }}></div>

                        {/* Title */}
                        <div className="relative z-10 px-6 text-center">
                            <span className="material-symbols-outlined text-[#d41132]/60 text-5xl mb-4 drop-shadow-[0_0_10px_rgba(212,17,50,0.6)]">skull</span>
                            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight tracking-widest text-[#d41132] glowing-text-death uppercase mb-2">
                                Tu Destino <br /> Ha Sido Sellado
                            </h1>
                            <div className="h-px mx-auto my-4 w-32 opacity-50 bg-gradient-to-r from-transparent via-[#d41132] to-transparent"></div>
                        </div>
                    </div>

                    {/* Charred Parchment (Stats) */}
                    <div className="torn-paper relative w-[95%] -mt-4 bg-[#cbbfa3] text-[#2c1810] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform rotate-[0.5deg]">
                        <div className="absolute inset-0 opacity-60 pointer-events-none bg-paper-texture mix-blend-multiply"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(46,26,18,0.6)] pointer-events-none"></div>

                        <h2 className="pb-2 mx-8 mb-6 text-2xl font-bold text-center border-b-2 font-display border-[#543b3f]/30 text-[#543b3f]">
                            Últimas Memorias
                        </h2>

                        <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 border rounded-full bg-[#543b3f]/10 border-[#543b3f]/20">
                                    <span className="material-symbols-outlined text-[#8a1c1c] text-2xl">hourglass_bottom</span>
                                </div>
                                <div>
                                    <p className="text-sm italic font-serif text-[#543b3f]">Tiempo Sobrevivido</p>
                                    <p className="text-xl font-bold font-display">{stats.timeSurvived}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 border rounded-full bg-[#543b3f]/10 border-[#543b3f]/20">
                                    <span className="material-symbols-outlined text-[#8a1c1c] text-2xl">swords</span>
                                </div>
                                <div>
                                    <p className="text-sm italic font-serif text-[#543b3f]">Enemigos Abatidos</p>
                                    <p className="text-xl font-bold font-display">{stats.enemiesDefeated}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 border rounded-full bg-[#543b3f]/10 border-[#543b3f]/20">
                                    <span className="material-symbols-outlined text-[#8a1c1c] text-2xl">savings</span>
                                </div>
                                <div>
                                    <p className="text-sm italic font-serif text-[#543b3f]">Oro Saqueado</p>
                                    <p className="text-xl font-bold font-display">{stats.goldLooted}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 border rounded-full bg-[#543b3f]/10 border-[#543b3f]/20">
                                    <span className="material-symbols-outlined text-[#8a1c1c] text-2xl">military_tech</span>
                                </div>
                                <div>
                                    <p className="text-sm italic font-serif text-[#543b3f]">Nivel Alcanzado</p>
                                    <p className="text-xl font-bold font-display">{stats.levelReached}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-4 mt-8 text-center border-t border-[#543b3f]/20">
                            <p className="mb-1 text-sm italic font-serif text-[#543b3f]">Causa de la Defunción</p>
                            <p className="text-lg font-bold tracking-wide text-[#8a1c1c] font-display">
                                {stats.causeOfDeath}
                            </p>
                        </div>
                    </div>

                    {/* Action Slabs */}
                    <div className="flex flex-col items-center justify-center w-full gap-6 px-4 mt-10 md:flex-row">
                        <button
                            onClick={onRetry}
                            className="relative flex items-center justify-center w-full gap-3 px-8 py-4 overflow-hidden rounded-sm md:w-auto stone-btn group"
                        >
                            <span className="text-gray-400 transition-colors material-symbols-outlined group-hover:text-[#d41132]">restart_alt</span>
                            <span className="text-sm font-bold tracking-wider text-gray-300 uppercase transition-colors font-display group-hover:text-white">
                                Reintentar desde el Último Suspiro
                            </span>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#d41132]/10 to-transparent group-hover:animate-[shimmer_1s_infinite]"></div>
                        </button>
                        <button
                            onClick={onQuit}
                            className="relative flex items-center justify-center w-full gap-3 px-8 py-4 overflow-hidden rounded-sm grayscale hover:grayscale-0 md:w-auto stone-btn group"
                        >
                            <span className="text-gray-500 transition-colors material-symbols-outlined group-hover:text-[#d41132]">logout</span>
                            <span className="text-sm font-bold tracking-wider text-gray-400 uppercase transition-colors font-display group-hover:text-white">
                                Regresar al Vacío
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Version */}
            <div className="fixed z-50 transition-opacity opacity-20 bottom-4 right-4 hover:opacity-50">
                <p className="font-mono text-xs text-white">{version}</p>
            </div>
        </div>
    );
}
