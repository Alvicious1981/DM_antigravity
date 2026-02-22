export interface SpellStat {
    label: string;
    value: string;
    icon: string;
}

export interface Spell {
    id: string;
    name: string;
    school: string;
    level: string; // e.g., 'Truco', 'Nivel 1', 'Nivel 3'
    circle: number;
    icon: string;
    imageUrl?: string;
    description: string[];
    dropCap: string;
    stats: SpellStat[];
    marginalNote?: string;
}

export interface SpellbookData {
    circles: { id: number; label: string; active: boolean }[];
    spells: Spell[];
}

export const mockSpellbookData: SpellbookData = {
    circles: [
        { id: 1, label: 'I', active: true },
        { id: 2, label: 'II', active: false },
        { id: 3, label: 'III', active: false },
        { id: 4, label: 'IV', active: false },
    ],
    spells: [
        {
            id: 'rayo-necrotico',
            name: 'Rayo Necrótico',
            school: 'Necromancia',
            level: 'Truco',
            circle: 1,
            icon: 'skull',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMrMCJb3NQNfBBJ317MNTBceS8SBgLqWIUEjTrhz5AVGrMDO_ZmQJ05I0OuuY1ajCq752BtJq3O7iNzddW8rz88NGp2EqtRyPY981naprQARZjmcHwlD8j4IMdn84ClLkBqy8Yfp8L33a4dqTB2wXSkkCFO7x1QZ_ckKcBz5pRUtVa63Vy7Ld_YNxwFbvburaIR6gBi_S6Lcv-FvpKPIOcNRfg9C94m0dSbVO7ZdFdQ9s6lFmnfAoORCoxMUkP6TPuh7JApS3t0g',
            dropCap: 'U',
            description: [
                'n haz de energía verdosa crepita hacia una criatura dentro del alcance. Haz un ataque de hechizo a distancia contra el objetivo. Si impactas, el objetivo recibe 1d8 de daño necrótico.',
                'La energía entropa la carne y marchita el espíritu. El daño de este hechizo aumenta en 1d8 cuando alcanzas el nivel 5 (2d8), el nivel 11 (3d8) y el nivel 17 (4d8).'
            ],
            marginalNote: '¡No usar en no-muertos!',
            stats: [
                { label: 'Tiempo', value: '1 Acción', icon: 'hourglass_top' },
                { label: 'Alcance', value: '120 Pies', icon: 'arrow_range' },
                { label: 'Componentes', value: 'V, S', icon: 'diamond' },
                { label: 'Duración', value: 'Instantánea', icon: 'history_edu' }
            ]
        },
        {
            id: 'bola-de-fuego',
            name: 'Bola de Fuego',
            school: 'Evocación',
            level: 'Nivel 3',
            circle: 3,
            icon: 'local_fire_department',
            dropCap: 'U',
            description: ['Una brillante chispa sale disparada de tu dedo índice hacia un punto que elijas dentro del alcance y luego estalla con un rugido sordo en una explosión de llamas.'],
            stats: [
                { label: 'Tiempo', value: '1 Acción', icon: 'hourglass_top' },
                { label: 'Alcance', value: '150 Pies', icon: 'arrow_range' },
                { label: 'Componentes', value: 'V, S, M', icon: 'diamond' },
                { label: 'Duración', value: 'Instantánea', icon: 'history_edu' }
            ]
        },
        {
            id: 'armadura-de-mago',
            name: 'Armadura de Mago',
            school: 'Abjuración',
            level: 'Nivel 1',
            circle: 1,
            icon: 'shield',
            dropCap: 'T',
            description: ['Tocas a una criatura dispuesta que no lleva armadura, y una fuerza mágica protectora la rodea hasta que el hechizo termina.'],
            stats: [
                { label: 'Tiempo', value: '1 Acción', icon: 'hourglass_top' },
                { label: 'Alcance', value: 'Toque', icon: 'arrow_range' },
                { label: 'Componentes', value: 'V, S, M', icon: 'diamond' },
                { label: 'Duración', value: '8 Horas', icon: 'history_edu' }
            ]
        }
    ]
};
