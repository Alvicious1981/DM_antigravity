export interface CharacterRace {
    id: string;
    name: string;
    subtitle: string;
    imageUrl: string;
    stats: {
        label: string;
        value: string;
        icon: string;
    }[];
    lore: string[];
}

export const characterRacesData: CharacterRace[] = [
    {
        id: 'human',
        name: 'Humano',
        subtitle: 'El Forjador de Destinos',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/race_human_portrait_1772207673500.png',
        stats: [
            { label: 'Todo', value: '+1', icon: 'stars' }
        ],
        lore: [
            'Los humanos son la más joven de las razas comunes, llegando tarde a la escena mundial y teniendo vidas cortas en comparación con los enanos y los elfos.',
            'Su ambición y capacidad para adaptarse a casi cualquier entorno los ha convertido en la raza dominante en muchas partes del mundo.'
        ]
    },
    {
        id: 'drow',
        name: 'Elfo Oscuro',
        subtitle: 'Hijo de las Sombras',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/race_drow_portrait_1772207690302.png',
        stats: [
            { label: 'Destreza', value: '+2', icon: 'bolt' },
            { label: 'Carisma', value: '+1', icon: 'theater_comedy' }
        ],
        lore: [
            'Provenientes de las profundidades de la Infraoscuridad, los Drow son maestros del sigilo y la magia oscura.',
            'Incomprendidos por los de la superficie, caminan entre dos mundos, llevando consigo el peso de su linaje.'
        ]
    },
    {
        id: 'hill_dwarf',
        name: 'Enano de las Colinas',
        subtitle: 'Corazón de Hierro',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/race_dwarf_portrait_1772207704478.png',
        stats: [
            { label: 'Constitución', value: '+2', icon: 'favorite' },
            { label: 'Sabiduría', value: '+1', icon: 'visibility' }
        ],
        lore: [
            'Como enano de las colinas, tienes sentidos agudos, una profunda intuición y una resistencia notable.',
            'Tus antecesores forjaron reinos bajo las colinas, protegiendo sus tradiciones con la misma tenacidad que el acero.'
        ]
    },
    {
        id: 'high_elf',
        name: 'Alto Elfo',
        subtitle: 'Guardian del Saber',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/race_highelf_portrait_1772207722154.png',
        stats: [
            { label: 'Destreza', value: '+2', icon: 'bolt' },
            { label: 'Inteligencia', value: '+1', icon: 'psychology' }
        ],
        lore: [
            'Los altos elfos consideran que tienen un derecho natural sobre el mundo, habiendo cultivado las artes y la magia durante milenios.',
            'Su longevidad les permite dominar disciplinas que otros apenas logran comprender en una vida entera.'
        ]
    },
    {
        id: 'tiefling',
        name: 'Tiefling',
        subtitle: 'Linaje Infernal',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/race_tiefling_portrait_1772207733893.png',
        stats: [
            { label: 'Carisma', value: '+2', icon: 'theater_comedy' },
            { label: 'Inteligencia', value: '+1', icon: 'psychology' }
        ],
        lore: [
            'Para ser recibidos con desconfianza y miedo, los tieflings caminan por el mundo sabiendo que su linaje infernal los precede.',
            'Su apariencia diabólica suele ocultar una voluntad de hierro y una astucia que pocos pueden igualar.'
        ]
    }
];
