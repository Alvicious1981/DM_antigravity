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
            { label: 'Inteligencia', value: '+2', icon: 'psychology', colorClass: 'text-[#40c4ff]', isMain: true },
            { label: 'Constitución', value: '+1', icon: 'favorite', colorClass: 'text-green-400' },
            { label: 'Dados de Golpe', value: '1d6', icon: 'casino', colorClass: 'text-white' }
        ],
        proficiencies: ['Dagas', 'Bastones', 'Ballestas ligeras', 'Armadura ligera'],
        lore: {
            dropCap: 'N',
            text: 'Necromancy is not merely the manipulation of the dead, but the understanding of the life force itself. Practitioners of this dark art are scholars of the ultimate truth: that death is but a doorway.',
            quote: '"To deny death is to deny half of existence. We merely... ensure the cycle continues."'
        }
    },
    {
        id: 'warrior',
        name: 'Guerrero',
        subtitle: 'Acero de la Vanguardia',
        difficulty: '★☆☆☆☆',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/class_fighter_1772207615279.png',
        imageAlt: 'Dark fantasy warrior fighter character concept art full body standing in mist',
        stats: [
            { label: 'Fuerza', value: '+2', icon: 'fitness_center', colorClass: 'text-orange-400', isMain: true },
            { label: 'Constitución', value: '+1', icon: 'favorite', colorClass: 'text-green-400' },
            { label: 'Dados de Golpe', value: '1d10', icon: 'casino', colorClass: 'text-white' }
        ],
        proficiencies: ['Todas las armas', 'Todas las armaduras', 'Escudos'],
        lore: {
            dropCap: 'E',
            text: 'l Guerrero es un maestro de las armas y la armadura, el pilar central de cualquier grupo de aventureros. Su fuerza no solo reside en su brazo, sino en su disciplina inquebrantable.',
            quote: '"El acero no miente. La victoria es para aquellos que tienen la voluntad de forjarla."'
        }
    },
    {
        id: 'rogue',
        name: 'Pícaro',
        subtitle: 'Sombra del Destino',
        difficulty: '★★☆☆☆',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/class_rogue_1772207627005.png',
        imageAlt: 'Dark fantasy rogue character concept art full body standing in mist',
        stats: [
            { label: 'Destreza', value: '+2', icon: 'bolt', colorClass: 'text-yellow-400', isMain: true },
            { label: 'Inteligencia', value: '+1', icon: 'psychology', colorClass: 'text-blue-400' },
            { label: 'Dados de Golpe', value: '1d8', icon: 'casino', colorClass: 'text-white' }
        ],
        proficiencies: ['Dagas', 'Arcos cortos', 'Herramientas de ladrón', 'Armadura ligera'],
        lore: {
            dropCap: 'L',
            text: 'os Pícaros confían en el sigilo, la astucia y los puntos débiles de sus enemigos. Son expertos en infiltración y en asestar golpes mortales antes de que el enemigo sepa que están allí.',
            quote: '"La mejor defensa es no estar allí cuando el golpe caiga."'
        }
    },
    {
        id: 'wizard',
        name: 'Mago',
        subtitle: 'Archivista de lo Arcano',
        difficulty: '★★★★☆',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/class_wizard_1772207640121.png',
        imageAlt: 'Dark fantasy wizard character concept art full body standing in mist',
        stats: [
            { label: 'Inteligencia', value: '+2', icon: 'psychology', colorClass: 'text-[#40c4ff]', isMain: true },
            { label: 'Sabiduría', value: '+1', icon: 'visibility', colorClass: 'text-purple-400' },
            { label: 'Dados de Golpe', value: '1d6', icon: 'casino', colorClass: 'text-white' }
        ],
        proficiencies: ['Bastones', 'Varitas', 'Libros de conjuros'],
        lore: {
            dropCap: 'E',
            text: 'l Mago es un estudioso de las leyes que rigen el cosmos. A través de años de investigación, ha aprendido a doblar la realidad a su voluntad mediante el uso de hechizos devastadores.',
            quote: '"El conocimiento es la única magia que realmente importa."'
        }
    },
    {
        id: 'paladin',
        name: 'Paladín',
        subtitle: 'Escudo de la Fe',
        difficulty: '★★★☆☆',
        imageUrl: 'file:///C:/Users/Alvicious/.gemini/antigravity/brain/c84977f5-0169-4c72-a990-4880dfcc97a6/class_paladin_1772207654612.png',
        imageAlt: 'Dark fantasy paladin character concept art full body standing in mist',
        stats: [
            { label: 'Carisma', value: '+2', icon: 'theater_comedy', colorClass: 'text-pink-400', isMain: true },
            { label: 'Fuerza', value: '+1', icon: 'fitness_center', colorClass: 'text-orange-400' },
            { label: 'Dados de Golpe', value: '1d10', icon: 'casino', colorClass: 'text-white' }
        ],
        proficiencies: ['Armas marciales', 'Armadura pesada', 'Canalizar divinidad'],
        lore: {
            dropCap: 'U',
            text: 'n Paladín es un guerrero sagrado vinculado por un juramento inquebrantable. Su poder proviene de su convicción, permitiéndoles castigar el mal y proteger a los inocentes con luz divina.',
            quote: '"Mi fe es mi escudo, y mi juramento es mi espada."'
        }
    }
];

export const creationSteps = [
    { id: 1, label: 'Raza', status: 'completed', value: 'Seleccionada', icon: 'check' },
    { id: 2, label: 'Clase', status: 'active', value: 'Seleccionando...', icon: 'swords' },
    { id: 3, label: 'Trasfondo', status: 'pending', value: '', icon: '3' },
    { id: 4, label: 'Atributos', status: 'pending', value: '', icon: '4' },
    { id: 5, label: 'Habilidades', status: 'pending', value: '', icon: '5' },
    { id: 6, label: 'Resumen', status: 'pending', value: '', icon: '6' }
];

export const classIcons = [
    { id: 'necromancer', icon: 'skull', active: true },
    { id: 'warrior', icon: 'shield', active: false },
    { id: 'rogue', icon: 'stadia_controller', active: false },
    { id: 'wizard', icon: 'auto_fix_high', active: false },
    { id: 'paladin', icon: 'flare', active: false }
];
