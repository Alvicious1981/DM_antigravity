import React from 'react';

interface MainMenuProps {
    onNewGame: () => void;
    onLoadGame: (saveId: string) => void;
    onSettings: () => void;
    saves: { save_id: string; created_at: string }[];
}

export default function MainMenu({ onNewGame, onLoadGame, onSettings, saves }: MainMenuProps) {
    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-black overflow-hidden font-serif">
            {/* Background (Overlay) */}
            <div className="absolute inset-0 bg-[url('/assets/textures/parchment-dark.jpg')] opacity-20 pointer-events-none" />

            <h1 className="text-5xl md:text-7xl text-stone-300 font-bold mb-12 tracking-widest drop-shadow-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                CHRONICLE
            </h1>

            <div className="flex flex-col gap-6 w-full max-w-md z-10">
                <MenuButton onClick={onNewGame} label="Forge New Legend" icon="⚔️" />

                {saves.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h3 className="text-stone-500 text-sm uppercase tracking-widest text-center mt-4 mb-2">Resurrect Memory</h3>
                        {saves.map((save) => (
                            <button
                                key={save.save_id}
                                onClick={() => onLoadGame(save.save_id)}
                                className="
                  text-left px-6 py-3 bg-stone-900/50 border border-stone-800 
                  text-stone-400 hover:text-stone-200 hover:border-red-900/50 hover:bg-red-950/20
                  transition-all duration-300 rounded text-sm group flex justify-between items-center
                "
                            >
                                <span>{new Date(save.created_at).toLocaleDateString()} - {new Date(save.created_at).toLocaleTimeString()}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-red-500">▶</span>
                            </button>
                        ))}
                    </div>
                )}

                <MenuButton onClick={onSettings} label="Grimoire (Settings)" icon="⚙️" secondary />
            </div>
        </div>
    );
}

function MenuButton({ onClick, label, icon, secondary = false }: { onClick: () => void; label: string; icon: string; secondary?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`
        relative px-8 py-4 border transition-all duration-300 group
        ${secondary
                    ? 'border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600'
                    : 'border-stone-700 bg-stone-900/40 text-stone-300 hover:border-red-800 hover:bg-red-950/30 hover:text-red-100 hover:shadow-[0_0_20px_rgba(153,27,27,0.2)]'
                }
      `}
        >
            <div className="flex items-center justify-center gap-4">
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${secondary ? '' : 'text-red-500'}`}>{icon}</span>
                <span className="uppercase tracking-[0.15em] font-medium">{label}</span>
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${secondary ? '' : 'text-red-500'}`}>{icon}</span>
            </div>
        </button>
    );
}
