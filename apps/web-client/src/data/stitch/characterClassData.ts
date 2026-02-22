export interface ClassStat {
    label: string;
    value: string;
    icon: string;
    colorClass?: string;
    isMain?: boolean;
}

export interface CharacterClass {
    id: string;
    name: string;
    subtitle: string;
    difficulty: string;
    imageUrl: string;
    imageAlt: string;
    stats: ClassStat[];
    proficiencies: string[];
    lore: {
        dropCap: string;
        text: string;
        quote: string;
    };
}

export const characterClassesData: CharacterClass[] = [
    {
        id: 'necromancer',
        name: 'Necromante',
        subtitle: 'Maestro de la Muerte',
        difficulty: '★★★☆☆',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmECiewZ5J1L_5T_0KpqFOPIW2WvExxPiVXg-m_7oPUhTvirbqygI-ixT_8w2-GO_qCiq7ycoXR6ld6jr6tDlYFo1JjwTWOSs8N2_KKm8W-NG-u7QxU0ffK9KXRf8Dugg41uf-ZjDjfhbNC_ikZDp6w9psxOrNB79_Lx2byZoaPGl8QnIbLRGhocAD1OnG1qP5jwqPD8bM6CKMFQN96PvShDWFzg-YyD9rcf37BboR9Aq28dCQFrO8rllZgjgj4UFkItIryx16xQ',
        imageAlt: 'Dark fantasy necromancer character concept art full body standing in mist',
        stats: [
            {
                label: 'Inteligencia',
                value: '+2',
                icon: 'psychology',
                colorClass: 'text-[#ec1337]',
                isMain: true
            },
            {
                label: 'Constitución',
                value: '+1',
                icon: 'fitness_center',
                colorClass: 'text-green-400'
            },
            {
                label: 'Dados de Golpe',
                value: '1d6',
                icon: 'casino',
                colorClass: 'text-white'
            }
        ],
        proficiencies: ['Dagas', 'Bastones', 'Ballestas ligeras', 'Armadura ligera'],
        lore: {
            dropCap: 'N',
            text: 'ecromancy is not merely the manipulation of the dead, but the understanding of the life force itself. Practitioners of this dark art, often misunderstood as villains, are scholars of the ultimate truth: that death is but a doorway. \n\nUnlike the crude animators of flesh, a true Necromancer weaves spells that sap the vitality of their foes to bolster their own, commanding spirits to confuse and terrify. They walk the thin line between the mortal realm and the Shadowfell, their very presence causing the temperature to drop and shadows to lengthen.',
            quote: '"To deny death is to deny half of existence. We merely... ensure the cycle continues."'
        }
    }
];

export const creationSteps = [
    { id: 1, label: 'Raza', status: 'completed', value: 'Elfo Oscuro', icon: 'check' },
    { id: 2, label: 'Clase', status: 'active', value: 'Seleccionando...', icon: 'swords' },
    { id: 3, label: 'Trasfondo', status: 'pending', value: '', icon: '3' },
    { id: 4, label: 'Atributos', status: 'pending', value: '', icon: '4' },
    { id: 5, label: 'Resumen', status: 'pending', value: '', icon: '5' }
];

export const classIcons = [
    { id: 'warrior', icon: 'shield', active: false },
    { id: 'necromancer', icon: 'skull', active: true },
    { id: 'mage', icon: 'auto_fix_high', active: false },
    { id: 'rogue', icon: 'stadia_controller', active: false },
    { id: 'bard', icon: 'music_note', active: false }
];
