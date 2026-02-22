import React from 'react';
import { mockEpicBattleMenuData, MenuItem } from '../../data/stitch/epicBattleMenuData';

export interface EpicBattleMenuProps {
    onMenuItemClick?: (id: string) => void;
    data?: typeof mockEpicBattleMenuData;
}

export function EpicBattleMenu({
    onMenuItemClick,
    data = mockEpicBattleMenuData
}: EpicBattleMenuProps) {
    return (
        <div className="relative h-screen w-screen bg-background-dark text-gray-200 font-body overflow-hidden select-none">

            {/* Background Image & Overlays */}
            <div className="absolute inset-0 z-0">
                <img
                    src={data.backgroundImage}
                    alt="Epic combat background"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 z-10" />
                <div className="absolute inset-0 bg-orange-900/10 mix-blend-overlay z-10 animate-pulse pointer-events-none" />
                {/* Vignette */}
                <div className="absolute inset-0 z-30 bg-[radial-gradient(circle,transparent_40%,#000_100%)] mix-blend-multiply opacity-60 pointer-events-none" />
            </div>

            <div className="relative z-20 h-full flex flex-col justify-between p-8 md:p-12 lg:p-16">

                {/* Logo Section */}
                <div className="flex justify-end w-full">
                    <div className="relative group cursor-default transform hover:scale-105 transition-transform duration-500">
                        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-[120%] h-32 bg-orange-900/40 blur-2xl rounded-full animate-pulse" />
                        <div className="logo-plate px-12 py-6 md:px-16 md:py-8 relative z-20 flex flex-col items-center justify-center min-w-[300px] md:min-w-[450px] heat-distortion border-orange-900/30">
                            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[#b91c1c] tracking-tighter uppercase text-center text-emboss leading-none relative">
                                <span className="block text-xl md:text-2xl text-gray-800 mb-1 tracking-widest font-bold">
                                    {data.logo.subtitle}
                                </span>
                                {data.logo.title.split(' & ')[0]}
                                <span className="text-orange-900 text-3xl align-middle mx-1" style={{ textShadow: '0 0 5px rgba(234,88,12,0.8)' }}>&</span>
                                {data.logo.title.split(' & ')[1]}
                            </h1>
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#f97316] to-transparent mt-2 shadow-glow animate-pulse" />
                            <p className="font-display font-bold text-gray-800 tracking-[0.3em] text-sm md:text-base mt-1 uppercase">
                                {data.logo.edition}
                            </p>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-30 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Menu & Embers Section */}
                <div className="flex flex-col lg:flex-row justify-between items-end lg:items-end w-full mt-auto relative">

                    {/* Animated Embers */}
                    <div className="ember-container w-full max-w-md h-96 absolute bottom-0 left-0 z-0 pointer-events-none overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-gradient-to-t from-[#fbbf24] to-[#ef4444] rounded-full opacity-0 ember-rise"
                                style={{
                                    left: `${10 + i * 15}%`,
                                    width: `${2 + (i % 3)}px`,
                                    height: `${2 + (i % 3)}px`,
                                    animationDelay: `${i * 0.7}s`,
                                    animationDuration: `${3 + (i % 4)}s`
                                }}
                            />
                        ))}
                    </div>

                    <nav className="flex flex-col gap-4 w-full max-w-md relative z-10">
                        {data.menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onMenuItemClick?.(item.id)}
                                className="group relative w-full text-left focus:outline-none"
                            >
                                {item.isActive && (
                                    <div className="absolute inset-0 bg-orange-600/20 blur-md transform skew-x-[-10deg] scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                                )}
                                <div className={`bg-stone-dark basalt-texture ${item.isActive ? 'h-16 md:h-20 border-l-4 border-copper' : 'h-14 md:h-16 border-l-4 border-gray-700'} flex items-center px-6 transition-all duration-300 group-hover:border-[#f97316] group-hover:pl-8 group-hover:bg-stone-800 shadow-lg transform skew-x-[-10deg] relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-orange-900/20 group-hover:via-red-600/10 group-hover:to-transparent transition-all duration-500" />
                                    <div className="transform skew-x-[10deg] flex items-center w-full justify-between relative z-10">
                                        <span className={`font-display font-bold ${item.isActive ? 'text-2xl md:text-3xl text-gray-300' : 'text-xl md:text-2xl text-gray-400'} group-hover:text-[#fff7ed] transition-all duration-300 uppercase tracking-wider group-hover:scale-105 ${item.isDanger ? 'group-hover:text-red-400' : ''}`}>
                                            {item.label}
                                        </span>
                                        <span className={`material-icons ${item.isDanger ? 'text-red-900 group-hover:text-red-400' : 'text-gray-600 group-hover:text-[#f97316]'} transition-colors opacity-0 group-hover:opacity-100 group-hover:drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]`}>
                                            {item.icon}
                                        </span>
                                    </div>
                                </div>
                                {item.isActive && (
                                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#f97316] group-hover:w-full transition-all duration-500 shadow-glow" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Build Info */}
                    <div className="mt-8 lg:mt-0 text-right opacity-60 hover:opacity-100 transition-opacity duration-300 relative z-20">
                        <div className="flex items-center justify-end gap-4 mb-2">
                            <button className="text-gray-400 hover:text-[#f97316] transition-colors hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
                                <i className="material-icons">forum</i>
                            </button>
                            <button className="text-gray-400 hover:text-[#f97316] transition-colors hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
                                <i className="material-icons">help</i>
                            </button>
                        </div>
                        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                            Build: {data.build.version} <span className="text-[#b91c1c] mx-2">|</span> Server: {data.build.server}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                            {data.build.copyright}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
