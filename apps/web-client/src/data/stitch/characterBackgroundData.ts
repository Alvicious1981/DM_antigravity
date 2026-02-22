export interface NavStep {
    id: string;
    label: string;
    stepNum: number;
    status: 'completed' | 'active' | 'locked';
}

export interface CharacterStat {
    label: string;
    value: number;
    isPrimary?: boolean;
}

export interface CharacterBackgroundData {
    name: string;
    title: string;
    imageUrl: string;
    race: { name: string; subtitle: string; icon: string };
    class: { name: string; subtitle: string; icon: string };
    stats: CharacterStat[];
    history: {
        title: string;
        dropCap: string;
        content: string[];
    };
    alignment: string;
    deity: string;
    navSteps: NavStep[];
}

export const mockCharacterBackgroundData: CharacterBackgroundData = {
    name: 'Valeros',
    title: 'El Buscador',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhJNuGwbGi7UkTy0pUAwqqU_eJA2Hm8q6yX4h3BbrWDfOxDVtg3AC7zLjMv9diXrfvSNySH-n648DCsLfL65s5Yc0HRGUGguz1VAmfsh4QQrbCAz8pDBqUBlL59xOYrMnN2LMzAHpdfq4dyC6Yxd_G21Jrgal61e5_WgKr5lbuh-NOKK-VT921tpc6JGr0KCq86Zop3sSgKhuj6MJlplj90Lt0havipOrQMyWPc853vJDC5UOW6fnWllJx4N-GmSX8cFINYvin5Q',
    race: { name: 'Alto Elfo', subtitle: 'Linaje Antiguo', icon: 'psychology' },
    class: { name: 'Mago', subtitle: 'Escuela de Evocación', icon: 'auto_fix_high' },
    stats: [
        { label: 'FUE', value: 10 },
        { label: 'DES', value: 14 },
        { label: 'CON', value: 12 },
        { label: 'INT', value: 18, isPrimary: true },
        { label: 'SAB', value: 15 },
        { label: 'CAR', value: 8 }
    ],
    history: {
        title: 'Historia de Origen',
        dropCap: 'H',
        content: [
            'ace mucho tiempo, en las torres de marfil de Silverymoon, Valeros nació bajo una estrella funesta. Aunque bendecido con un intelecto agudo, su curiosidad siempre se inclinó hacia lo prohibido.',
            'Expulsado de la academia por experimentar con magia de sangre, vagó por las Tierras Salvajes buscando conocimientos que los archimagos temían pronunciar. Fue allí, en una ruina olvidada, donde encontró el tomo que cambiaría su destino para siempre.',
            'Ahora, perseguido por los inquisidores de su antigua orden y atormentado por visiones de un futuro apocalíptico, Valeros busca el poder no para gobernar, sino para sobrevivir a la oscuridad que se avecina.'
        ]
    },
    alignment: 'Caótico Bueno',
    deity: 'Mystra',
    navSteps: [
        { id: 'raza', label: 'Raza', stepNum: 1, status: 'completed' },
        { id: 'clase', label: 'Clase', stepNum: 2, status: 'completed' },
        { id: 'atributos', label: 'Atributos', stepNum: 3, status: 'completed' },
        { id: 'trasfondo', label: 'Trasfondo', stepNum: 4, status: 'active' },
        { id: 'equipo', label: 'Equipo', stepNum: 5, status: 'locked' }
    ]
};
