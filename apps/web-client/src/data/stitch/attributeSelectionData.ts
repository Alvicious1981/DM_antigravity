export interface AttributeData {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    value: number;
    isSecondary?: boolean;
    color?: string;
    glowClass?: string;
    bgGlowClass?: string;
}

export interface AttributeSelectionData {
    characterName: string;
    characterTitle: string;
    characterInfo: string;
    characterImage: string;
    remainingPoints: number;
    maxPoints: number;
    attributes: AttributeData[];
    lore: {
        title: string;
        description: string;
        highlightWord: string;
    };
}

export const mockAttributeSelectionData: AttributeSelectionData = {
    characterName: 'Malakai, El Erudito',
    characterTitle: 'Mago Tiefling',
    characterInfo: 'Mago Tiefling • Nivel 1',
    characterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvBx3KzHdxJy7R0m-0QV0x6OmzPWhWyFnshHavaU21oz0T0OqXYKiP9eLIQFb348nPNjDCJJOQAXsNq5MjTuZ6dTO7gyXj9MAbMbigjEb7D6Y2xFVY7gCi_k5HQXFEHeki6t9auFgEaS58FUSaqWkklZpn5MH2p_OnUedGLw0qyEqU7JISul5uS3vXFQ2cwLkIikEkUxdxlhz6NxKJ1o9-3IxaJWd6r-nshUEupItJaDjpIl0o95DJo_9c47E3EdRCoa07qVIeKg',
    remainingPoints: 5,
    maxPoints: 27,
    attributes: [
        { id: 'str', name: 'FUERZA', shortName: 'FUE', icon: 'fitness_center', value: 8 },
        { id: 'dex', name: 'DESTREZA', shortName: 'DES', icon: 'sprint', value: 12 },
        { id: 'con', name: 'CONSTITUCIÓN', shortName: 'CON', icon: 'shield', value: 13 },
        {
            id: 'int',
            name: 'INTELIGENCIA',
            shortName: 'INT',
            icon: 'auto_stories',
            value: 17,
            color: 'text-[#40c4ff]', // rune-blue
            glowClass: 'text-glow-rune text-[#40c4ff]',
            bgGlowClass: 'bg-[#40c4ff]/5 border-[#40c4ff]/40 shadow-[0_0_8px_rgba(64,196,255,0.4)]'
        },
        { id: 'wis', name: 'SABIDURÍA', shortName: 'SAB', icon: 'visibility', value: 10 },
        { id: 'cha', name: 'CARISMA', shortName: 'CAR', icon: 'theater_comedy', value: 14 }
    ],
    lore: {
        title: 'Compendio Arcano',
        highlightWord: 'Inteligencia:',
        description: 'Mide la agudeza mental, la exactitud de los recuerdos y la capacidad de razonar. Es crucial para los Magos, pues determina cuántos hechizos pueden memorizar y la potencia de su magia arcana.'
    }
};
