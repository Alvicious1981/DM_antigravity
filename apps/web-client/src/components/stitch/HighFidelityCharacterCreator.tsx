import React, { useState, useMemo } from 'react';
import { useAgentState } from '../../hooks/useAgentState';
import { CharacterClassSelection } from './CharacterClassSelection';
import { AttributeSelection } from './AttributeSelection';
import { CharacterBackground } from './CharacterBackground';
import { SkillsSelection } from './SkillsSelection';
import { characterClassesData } from '../../data/stitch/characterClassData';
import { characterRacesData } from '../../data/stitch/characterRaceData';

export interface HighFidelityCharacterCreatorProps {
    onComplete?: (data: any) => void;
    onCancel?: () => void;
}

export function HighFidelityCharacterCreator({
    onComplete,
    onCancel
}: HighFidelityCharacterCreatorProps) {
    const { createCharacter } = useAgentState() as any;
    const [step, setStep] = useState(1);

    // Character State
    const [character, setCharacter] = useState({
        name: 'Arcturus',
        raceId: 'drow',
        classId: 'necromancer',
        backgroundId: 'bg_soldier',
        attributes: [
            { id: 'str', name: 'Fuerza', value: 10, icon: 'fitness_center' },
            { id: 'dex', name: 'Destreza', value: 12, icon: 'bolt' },
            { id: 'con', name: 'Constitución', value: 14, icon: 'favorite' },
            { id: 'int', name: 'Inteligencia', value: 16, icon: 'psychology', glowClass: 'text-[#40c4ff] text-glow-rune', bgGlowClass: 'bg-[#001428]' },
            { id: 'wis', name: 'Sabiduría', value: 10, icon: 'visibility' },
            { id: 'cha', name: 'Carisma', value: 8, icon: 'theater_comedy' }
        ],
        remainingPoints: 15,
        skills: [
            { id: 'arcanismo', name: 'Arcanismo', attribute: 'Inteligencia', mastery: 'Experto', icon: 'auto_fix_high', description: 'Conocimiento sobre hechizos...' },
            { id: 'historia', name: 'Historia', attribute: 'Inteligencia', mastery: 'Entrenado', icon: 'history_edu', description: 'Conocimiento sobre eventos pasados...' }
        ] as any[]
    });

    const activeClass = characterClassesData.find(c => c.id === character.classId) || characterClassesData[0];
    const activeRace = characterRacesData.find(r => r.id === character.raceId) || characterRacesData[0];

    const handleAttributeChange = (id: string, delta: number) => {
        setCharacter(prev => {
            if (delta > 0 && prev.remainingPoints <= 0) return prev;

            const newAttributes = prev.attributes.map(attr => {
                if (attr.id === id) {
                    const newValue = Math.max(8, Math.min(20, attr.value + delta));
                    return { ...attr, value: newValue };
                }
                return attr;
            });

            // Very simple point buy logic for now
            const oldAttr = prev.attributes.find(a => a.id === id);
            const newAttr = newAttributes.find(a => a.id === id);
            const pointDiff = (newAttr?.value || 0) - (oldAttr?.value || 0);

            return {
                ...prev,
                attributes: newAttributes,
                remainingPoints: prev.remainingPoints - pointDiff
            };
        });
    };

    const handleSelectClass = (classId: string) => {
        setCharacter(prev => ({ ...prev, classId }));
    };

    const handleSelectRace = (raceId: string) => {
        const race = characterRacesData.find(r => r.id === raceId);
        if (!race) return;

        setCharacter(prev => {
            // Reset bonuses first
            const resetAttributes = prev.attributes.map(attr => ({ ...attr, bonus: 0 }));

            // Apply new bonuses
            const updatedAttributes = resetAttributes.map(attr => {
                const raceBonus = race.stats.find(s => s.label === attr.name || (s.label === 'Todo' && attr.id !== 'hp'));
                if (raceBonus) {
                    const bonusValue = parseInt(raceBonus.value.replace('+', ''));
                    return { ...attr, bonus: bonusValue };
                }
                // Special case for sub-race specific labels if needed
                if (race.id === 'drow' && attr.id === 'dex') return { ...attr, bonus: 2 };
                if (race.id === 'drow' && attr.id === 'cha') return { ...attr, bonus: 1 };
                if (race.id === 'hill_dwarf' && attr.id === 'con') return { ...attr, bonus: 2 };
                if (race.id === 'hill_dwarf' && attr.id === 'wis') return { ...attr, bonus: 1 };
                if (race.id === 'high_elf' && attr.id === 'dex') return { ...attr, bonus: 2 };
                if (race.id === 'high_elf' && attr.id === 'int') return { ...attr, bonus: 1 };
                if (race.id === 'tiefling' && attr.id === 'cha') return { ...attr, bonus: 2 };
                if (race.id === 'tiefling' && attr.id === 'int') return { ...attr, bonus: 1 };
                if (race.id === 'human') return { ...attr, bonus: 1 };

                return attr;
            });

            return { ...prev, raceId, attributes: updatedAttributes };
        });
    };

    const handleNextStep = () => {
        if (step < 6) setStep(step + 1);
        else {
            // Finalize
            createCharacter?.(character);
            onComplete?.(character);
        }
    };

    const handleNavigate = (targetStep: string) => {
        const stepMap: Record<string, number> = {
            'raza': 1,
            'clase': 2,
            'trasfondo': 3,
            'atributos': 4,
            'habilidades': 5,
            'resumen': 6
        };
        if (stepMap[targetStep]) setStep(stepMap[targetStep]);
    };

    const navSteps = [
        { id: 'raza', stepNum: 1, label: 'Raza', status: step === 1 ? 'active' as const : step > 1 ? 'completed' as const : 'locked' as const, icon: 'groups' },
        { id: 'clase', stepNum: 2, label: 'Clase', status: step === 2 ? 'active' as const : step > 2 ? 'completed' as const : 'locked' as const, icon: 'swords' },
        { id: 'trasfondo', stepNum: 3, label: 'Trasfondo', status: step === 3 ? 'active' as const : step > 3 ? 'completed' as const : 'locked' as const, icon: 'menu_book' },
        { id: 'atributos', stepNum: 4, label: 'Atributos', status: step === 4 ? 'active' as const : step > 4 ? 'completed' as const : 'locked' as const, icon: 'psychology' },
        { id: 'habilidades', stepNum: 5, label: 'Habilidades', status: step === 5 ? 'active' as const : step > 5 ? 'completed' as const : 'locked' as const, icon: 'history_edu' },
        { id: 'resumen', stepNum: 6, label: 'Resumen', status: step === 6 ? 'active' as const : 'locked' as const, icon: 'verified' }
    ];

    const characterSummary = {
        name: character.name,
        title: activeClass.subtitle,
        imageUrl: activeClass.imageUrl,
        race: { name: activeRace.name, icon: 'person', subtitle: activeRace.subtitle },
        class: { name: activeClass.name, icon: 'skull', subtitle: activeClass.subtitle },
        stats: character.attributes.map(a => ({ label: a.name.slice(0, 3).toUpperCase(), value: a.value, isPrimary: a.id === 'int' })),
        history: {
            title: 'Linaje Olvidado',
            dropCap: character.name.charAt(0),
            content: [
                `${character.name} nació en los túneles más profundos de la Infraoscuridad. Desde joven, mostró una afinidad antinatural por las energías que otros temían.`,
                'Tras años de estudio prohibido, emerge ahora a la superficie buscando el conocimiento definitivo sobre el alma y su persistencia más allá del velo.'
            ]
        },
        alignment: 'Neutral Auténtico',
        deity: 'La Reina Cuervo'
    };

    return (
        <div className="w-full h-full">
            {step === 1 && (
                <div className="flex flex-col h-full bg-[#0f0a0a] text-white overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
                        <div className="max-w-4xl w-full">
                            <h2 className="text-4xl font-bold mb-2 tracking-widest uppercase text-center">Selecciona tu Raza</h2>
                            <p className="text-slate-400 mb-12 text-center max-w-2xl mx-auto">
                                El origen define tu esencia. Los antiguos pactos y la sangre que corre por tus venas marcarán tu destino en las tierras sombrías.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {characterRacesData.map((race) => (
                                    <div
                                        key={race.id}
                                        onClick={() => handleSelectRace(race.id)}
                                        className={`group cursor-pointer relative p-1 rounded-lg transition-all transform hover:scale-[1.02] ${character.raceId === race.id
                                            ? 'bg-gradient-to-b from-[#ec1337] to-[#8a0a1d] shadow-[0_0_30px_rgba(236,19,55,0.3)]'
                                            : 'bg-[#1a1516] border border-[#39282b] hover:border-[#ec1337]/50'
                                            }`}
                                    >
                                        <div className="bg-[#140e0f] rounded-lg p-4 h-full flex flex-col gap-4">
                                            <div className="relative aspect-square overflow-hidden rounded-md border border-[#39282b]">
                                                <img
                                                    src={race.imageUrl}
                                                    alt={race.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                                {character.raceId === race.id && (
                                                    <div className="absolute top-2 right-2 bg-[#ec1337] text-white rounded-full p-1 shadow-lg">
                                                        <span className="material-symbols-outlined !text-[18px]">check</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold tracking-wider uppercase text-white group-hover:text-[#ec1337] transition-colors">{race.name}</h3>
                                                <span className="text-[10px] text-[#ec1337] font-bold uppercase tracking-widest">{race.subtitle}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {race.stats.map((stat, i) => (
                                                    <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-0.5" title={stat.label}>
                                                        <span className="material-symbols-outlined !text-[12px] text-[#cfae70]">{stat.icon}</span>
                                                        <span className="text-[10px] font-bold">{stat.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-6 pb-12">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-12 py-4 bg-[#ec1337] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(236,19,55,0.4)] hover:-translate-y-1 active:translate-y-0"
                                >
                                    Confirmar Raza
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-2 text-sm text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
                                >
                                    ← Volver al Menú
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <CharacterClassSelection
                    onSelectClass={handleSelectClass}
                    onSealPact={handleNextStep}
                    playerName="Jugador"
                />
            )}

            {step === 3 && (
                <div className="flex items-center justify-center h-full bg-[#181411] text-white">
                    <div className="text-center p-12 border border-[#3a2e26] bg-[#120f0d] rounded-lg shadow-2xl">
                        <h2 className="text-4xl font-bold mb-4 tracking-widest uppercase text-[#f26c0d]">Define tu Trasfondo</h2>
                        <p className="text-[#8c7b6d] mb-8 max-w-md">¿Fuiste un soldado, un sabio o un criminal? Tu pasado define tus habilidades iniciales.</p>
                        <button
                            onClick={() => setStep(4)}
                            className="px-10 py-4 bg-[#f26c0d] font-bold uppercase tracking-widest hover:bg-[#ff8c3d] transition-colors shadow-[0_0_20px_rgba(242,108,13,0.4)] text-black"
                        >
                            Siguiente Paso
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <AttributeSelection
                    attributes={character.attributes}
                    remainingPoints={character.remainingPoints}
                    onAttributeChange={handleAttributeChange}
                    onConfirm={handleNextStep}
                    characterName={character.name}
                    characterImage={activeClass.imageUrl}
                    characterInfo={`${activeRace.name} ${activeClass.name}`}
                />
            )}

            {step === 5 && (
                <SkillsSelection
                    skills={character.skills as any}
                    remainingPoints={character.remainingPoints}
                    onConfirm={handleNextStep}
                    onNavigate={handleNavigate}
                    characterName={character.name}
                    characterTitle={`${activeRace.name} ${activeClass.name}`}
                    characterQuote={activeClass.lore.quote}
                    characterImage={activeClass.imageUrl}
                    compendium={{
                        title: 'Compendio de Conocimiento',
                        dropCap: character.name.charAt(0),
                        content: [
                            `Como ${activeClass.name}, posees talentos únicos que te distinguen.`,
                            'Escribe tu propia historia a través de tus habilidades.'
                        ]
                    }}
                />
            )}

            {step === 6 && (
                <CharacterBackground
                    characterSummary={characterSummary}
                    navSteps={navSteps}
                    onNavigate={handleNavigate}
                    onConfirm={() => onComplete?.(character)}
                />
            )}
        </div>
    );
}
