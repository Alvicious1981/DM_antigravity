export interface Skill {
    id: string;
    name: string;
    attribute: string;
    mastery: 'Sin entrenar' | 'Principiante' | 'Entrenado' | 'Experto' | 'Maestro';
    rank?: number;
    description: string;
    icon: string;
    isActive?: boolean;
}

export interface SkillsSelectionData {
    characterName: string;
    characterTitle: string;
    characterQuote: string;
    characterImage: string;
    remainingPoints: number;
    skills: Skill[];
    compendium: {
        title: string;
        content: string[];
        dropCap: string;
    };
}

export const mockSkillsSelectionData: SkillsSelectionData = {
    characterName: 'Valerius El Erudito',
    characterTitle: 'Mago Humano Nvl 3',
    characterQuote: '"El conocimiento es poder, y yo pretendo ser omnipotente."',
    characterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUNFd9J1rKXntce6uZikmTPh3hBCC49Q3WK3wKbXh0lo3RfOiyFlyBSkABOEmwWGgNEiOsvrzGT-Gvnjdu86aoNtY4Sv3vOioP1jVeAwHsUmugss5RZDeoSoJz9B5-v7hcCI8Ql6N7OO9Do3xioKy6QaEFr4W3rAdmsD0iFNwBpGBrDEQCWFFQkeQ-Fx4_EK-Y2W4Nc0KGVtIC7Isvk4m6iA6e5ncrSPqxLGHimJtjWv5UNNvIr5H9bJ7wOpOgdivQmmrj5OrVCg',
    remainingPoints: 12,
    skills: [
        {
            id: 'arcanismo',
            name: 'Arcanismo',
            attribute: 'Inteligencia',
            mastery: 'Experto',
            rank: 2,
            description: 'Conocimiento sobre hechizos, objetos mágicos, símbolos eldritch y tradiciones mágicas.',
            icon: 'auto_fix_high',
            isActive: true
        },
        {
            id: 'sigilo',
            name: 'Sigilo',
            attribute: 'Destreza',
            mastery: 'Principiante',
            description: 'Habilidad para moverse sin ser detectado y esconderse de los enemigos.',
            icon: 'visibility_off'
        },
        {
            id: 'historia',
            name: 'Historia',
            attribute: 'Inteligencia',
            mastery: 'Entrenado',
            description: 'Conocimiento sobre eventos pasados, imperios caídos y linajes reales.',
            icon: 'history_edu'
        },
        {
            id: 'persuasion',
            name: 'Persuasión',
            attribute: 'Carisma',
            mastery: 'Sin entrenar',
            description: 'Habilidad para convencer a otros de tu punto de vista mediante el diálogo.',
            icon: 'diversity_3'
        },
        {
            id: 'investigacion',
            name: 'Investigación',
            attribute: 'Inteligencia',
            mastery: 'Sin entrenar',
            description: 'Habilidad para encontrar pistas y deducir información de tu entorno.',
            icon: 'search'
        },
        {
            id: 'atletismo',
            name: 'Atletismo',
            attribute: 'Fuerza',
            mastery: 'Sin entrenar',
            description: 'Habilidad física para escalar, nadar y realizar proezas de fuerza.',
            icon: 'fitness_center'
        }
    ],
    compendium: {
        title: 'Compendio de Conocimiento',
        dropCap: 'E',
        content: [
            'l estudio de lo arcano no es meramente la memorización de palabras y gestos, sino la profunda comprensión del tejido que une la realidad. Aquellos versados en Arcanismo pueden descifrar runas antiguas, sentir la presencia de magia residual y entender los complejos mecanismos de los planos de existencia.',
            'Se dice que los primeros magos aprendieron estos secretos susurrados por los dragones mismos, escribiéndolos en pergaminos de piel de demonio.'
        ]
    }
};
