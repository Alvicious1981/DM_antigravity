import React, { useState } from 'react';

interface CharacterCreatorProps {
    onCreate: (data: { name: string; classId: string; backgroundId: string }) => void;
    onCancel: () => void;
}

const CLASSES = [
    { id: 'class_fighter', name: 'Fighter', icon: '⚔️', desc: 'Master of martial combat.' },
    { id: 'class_wizard', name: 'Wizard', icon: '🔮', desc: 'Scholar capable of manipulating the fabric of reality.' },
    { id: 'class_rogue', name: 'Rogue', icon: '🗡️', desc: 'Scoundrel who uses stealth and trickery.' },
    { id: 'class_cleric', name: 'Cleric', icon: '🙏', desc: 'Priest wielding divine magic.' },
];

const BACKGROUNDS = [
    { id: 'bg_soldier', name: 'Soldier', desc: 'War is all you know.' },
    { id: 'bg_acolyte', name: 'Acolyte', desc: 'You have spent your life in service to a temple.' },
    { id: 'bg_criminal', name: 'Criminal', desc: 'You have a history of breaking the law.' },
    { id: 'bg_sage', name: 'Sage', desc: 'You spent years learning the lore of the multiverse.' },
];

export default function CharacterCreator({ onCreate, onCancel }: CharacterCreatorProps) {
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
    const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0].id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate({ name, classId: selectedClass, backgroundId: selectedBackground });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-stone-300 font-serif p-8 relative">
            <div className="absolute inset-0 bg-[url('/assets/textures/parchment-dark.jpg')] opacity-10 pointer-events-none" />

            <div className="z-10 w-full max-w-2xl bg-stone-900/80 border border-stone-700 p-8 rounded shadow-2xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-center mb-8 text-stone-100 tracking-widest border-b border-stone-800 pb-4">Define Your Avatar</h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-widest text-stone-500">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-stone-700 p-4 text-xl text-stone-200 focus:border-red-800 focus:outline-none transition-colors"
                            placeholder="Enter name..."
                            autoFocus
                        />
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-widest text-stone-500">Class</label>
                        <div className="grid grid-cols-2 gap-4">
                            {CLASSES.map((cls) => (
                                <button
                                    key={cls.id}
                                    type="button"
                                    onClick={() => setSelectedClass(cls.id)}
                                    className={`
                    flex flex-col items-center p-4 border transition-all
                    ${selectedClass === cls.id
                                            ? 'border-red-800 bg-red-950/20 text-red-100'
                                            : 'border-stone-800 bg-stone-900/40 text-stone-500 hover:border-stone-600'
                                        }
                  `}
                                >
                                    <span className="text-2xl mb-2">{cls.icon}</span>
                                    <span className="font-bold uppercase tracking-wider">{cls.name}</span>
                                    <span className="text-xs text-center mt-1 opacity-70">{cls.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-widest text-stone-500">Background</label>
                        <div className="grid grid-cols-2 gap-4">
                            {BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    type="button"
                                    onClick={() => setSelectedBackground(bg.id)}
                                    className={`
                    text-left p-3 border transition-all text-sm
                    ${selectedBackground === bg.id
                                            ? 'border-red-800 bg-red-950/20 text-stone-200'
                                            : 'border-stone-800 bg-stone-900/40 text-stone-500 hover:border-stone-600'
                                        }
                  `}
                                >
                                    <span className="font-bold block">{bg.name}</span>
                                    <span className="opacity-70 text-xs">{bg.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-8 border-t border-stone-800">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-stone-500 hover:text-stone-300 transition-colors uppercase tracking-widest text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className={`
                px-8 py-3 bg-red-900/20 border border-red-900/50 text-red-500 uppercase tracking-widest font-bold
                hover:bg-red-900/40 hover:text-red-400 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]
                transition-all disabled:opacity-30 disabled:cursor-not-allowed
              `}
                        >
                            Begin Journey
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
