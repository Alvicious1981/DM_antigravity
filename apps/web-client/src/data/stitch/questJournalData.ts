export interface QuestObjective {
    id: string;
    text: string;
    status: 'completed' | 'active' | 'pending';
}

export interface QuestReward {
    type: 'gold' | 'xp' | 'item';
    value: string;
    icon: string;
}

export interface Quest {
    id: string;
    title: string;
    region: string;
    type: string;
    status: 'active' | 'danger' | 'pending' | 'completed';
    lastUpdated?: string;
    imageUrl?: string;
    imageCaption?: string;
    narrativeParagraphs: string[];
    objectives: QuestObjective[];
    rewards: QuestReward[];
    handwrittenNote?: string;
}

export const questsData: Quest[] = [
    {
        id: 'quest-1',
        title: 'La Bestia de Blackwood',
        region: 'Bosque de los Lamentos',
        type: 'Principal',
        status: 'active',
        lastUpdated: 'Hace 2 días',
        imageUrl: 'https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?q=80&w=2069&auto=format&fit=crop',
        imageCaption: 'Fig 1. Avistamiento en el linde norte.',
        narrativeParagraphs: [
            'Los aldeanos hablan de una sombra que acecha la linde del bosque. No es un lobo común, dicen; sus ojos arden como brasas de un fuego olvidado y su aullido hiela la sangre incluso de los veteranos más curtidos. El anciano del pueblo, Ealdred, afirma que la criatura es un castigo por profanar el antiguo santuario de piedra. Debo investigar la cresta norte antes del anochecer, pues es allí donde se han encontrado los rastros más recientes.',
            'He preparado mis aceites y afilado la plata. Si las leyendas son ciertas, el acero común apenas rasguñará su piel.'
        ],
        objectives: [
            { id: 'obj-1', text: 'Hablar con el Anciano Ealdred', status: 'completed' },
            { id: 'obj-2', text: 'Encontrar el rastro de la bestia', status: 'active' },
            { id: 'obj-3', text: 'Dar caza a la criatura o purificar el santuario', status: 'pending' },
        ],
        rewards: [
            { type: 'gold', value: '150 Oro', icon: 'paid' },
            { type: 'xp', value: 'Exp', icon: 'swords' }
        ],
        handwrittenNote: '"¡Cuidado con la luna llena! Sus poderes aumentan."'
    },
    {
        id: 'quest-2',
        title: 'Susurros en la Cripta',
        region: 'Catacumbas Reales',
        type: 'Secundaria',
        status: 'danger',
        narrativeParagraphs: [],
        objectives: [],
        rewards: []
    },
    {
        id: 'quest-3',
        title: 'Suministros de Alquimia',
        region: 'Aldea de Piedra',
        type: 'Encargo',
        status: 'pending',
        narrativeParagraphs: [],
        objectives: [],
        rewards: []
    },
    {
        id: 'quest-4',
        title: 'La Espada Rota',
        region: 'Herrería Antigua',
        type: 'Secundaria',
        status: 'pending',
        narrativeParagraphs: [],
        objectives: [],
        rewards: []
    }
];
