import React, { useState, useMemo } from 'react';
import { useAgentState } from '../../hooks/useAgentState';
import { CharacterClassSelection } from './CharacterClassSelection';
import { AttributeSelection } from './AttributeSelection';
import { CharacterBackground } from './CharacterBackground';
import { SkillsSelection } from './SkillsSelection';
import { characterClassesData } from '../../data/stitch/characterClassData';

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
        race: 'Elfo Oscuro',
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
        skills: [] as string[]
    });

    const activeClass = characterClassesData.find(c => c.id === character.classId) || characterClassesData[0];

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

    const handleNextStep = () => {
        if (step < 5) setStep(step + 1);
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
            'habilidades': 4, // Mapping both for now
            'resumen': 5
        };
        if (stepMap[targetStep]) setStep(stepMap[targetStep]);
    };

    const navSteps = [
        { id: 'raza', stepNum: 1, label: 'Raza', status: step === 1 ? 'active' as const : step > 1 ? 'completed' as const : 'locked' as const, icon: 'groups' },
        { id: 'clase', stepNum: 2, label: 'Clase', status: step === 2 ? 'active' as const : step > 2 ? 'completed' as const : 'locked' as const, icon: 'swords' },
        { id: 'trasfondo', stepNum: 3, label: 'Trasfondo', status: step === 3 ? 'active' as const : step > 3 ? 'completed' as const : 'locked' as const, icon: 'menu_book' },
        { id: 'atributos', stepNum: 4, label: 'Atributos', status: step === 4 ? 'active' as const : step > 4 ? 'completed' as const : 'locked' as const, icon: 'psychology' },
        { id: 'resumen', stepNum: 5, label: 'Resumen', status: step === 5 ? 'active' as const : 'locked' as const, icon: 'verified' }
    ];

    const characterSummary = {
        name: character.name,
        title: activeClass.subtitle,
        imageUrl: activeClass.imageUrl,
        race: { name: character.race, icon: 'person', subtitle: 'Hijo de las Sombras' },
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
                <div className="flex items-center justify-center h-full bg-[#0f0a0a] text-white">
                    <div className="text-center p-12 border border-[#39282b] bg-[#140e0f] rounded-lg shadow-2xl">
                        <h2 className="text-4xl font-bold mb-4 tracking-widest uppercase">Selecciona tu Raza</h2>
                        <p className="text-slate-400 mb-8 max-w-md">Elfos Oscuros, Enanos de Hierro, Humanos del Norte... Elige tu origen.</p>
                        <button
                            onClick={() => setStep(2)}
                            className="px-10 py-4 bg-[#ec1337] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(236,19,55,0.4)]"
                        >
                            Empezar (Elfo Oscuro)
                        </button>
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
                    characterInfo={`${character.race} ${activeClass.name}`}
                />
            )}

            {step === 5 && (
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
