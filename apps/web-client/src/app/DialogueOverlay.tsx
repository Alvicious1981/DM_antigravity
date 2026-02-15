'use client';
import React, { useState, useEffect } from 'react';

interface DialogueOption {
    id: string;
    text: string;
    action?: () => void;
}

interface DialogueProps {
    speakerName: string;
    text: string;
    options?: DialogueOption[];
    onClose?: () => void;
    portraitUrl?: string; // Optional, can use placeholder
}

export default function DialogueOverlay({ speakerName, text, options, onClose, portraitUrl }: DialogueProps) {
    const [displayedText, setDisplayedText] = useState('');

    // Simple typewriter effect
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30); // Speed of typewriter
        return () => clearInterval(interval);
    }, [text]);

    return (
        <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Cinematic Letterboxing backdrop (optional, or just gradient) */}
            <div className="absolute inset-0 bg-stone-950/80 pointer-events-auto"></div>

            {/* Dialogue Container */}
            <div className="relative w-full max-w-4xl mb-8 mx-4 pointer-events-auto flex items-end gap-4">

                {/* Portrait */}
                <div className="hidden md:block w-48 h-64 shrink-0 relative z-10 -mb-4">
                    <div className="absolute inset-0 bg-stone-800 border-2 border-stone-600 rounded-lg transform -rotate-2 overflow-hidden shadow-2xl">
                        {/* Placeholder Portrait */}
                        <div className="w-full h-full bg-gradient-to-b from-stone-700 to-black flex items-center justify-center">
                            <span className="text-6xl grayscale opacity-50">🧙‍♂️</span>
                        </div>
                    </div>
                </div>

                {/* Text & Options Box */}
                <div className="flex-1 bg-black/90 border-t-2 border-primary/30 p-6 md:p-8 rounded-t-lg shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                    <h3 className="text-primary font-bold tracking-widest uppercase text-sm mb-2 font-serif">{speakerName}</h3>

                    <p className="text-stone-200 text-lg md:text-xl font-serif leading-relaxed mb-6 min-h-[4rem]">
                        {displayedText}
                        <span className="animate-pulse inline-block ml-1">_</span>
                    </p>

                    {/* Responses */}
                    <div className="flex flex-col items-end gap-2">
                        {options && options.length > 0 ? (
                            options.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={opt.action || onClose}
                                    className="px-6 py-2 bg-stone-800/50 hover:bg-stone-700 border border-stone-600/30 hover:border-primary/50 text-stone-300 hover:text-white transition-all rounded text-sm uppercase tracking-wider font-bold"
                                >
                                    {opt.text} ➤
                                </button>
                            ))
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-stone-800/50 hover:bg-stone-700 border border-stone-600/30 text-stone-400 text-xs uppercase"
                            >
                                (Click to Continue)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
