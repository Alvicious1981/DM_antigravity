export interface LevelUpAttribute {
    id: string;
    name: string;
    description: string;
    value: number;
    canIncrease: boolean;
}

export interface Talent {
    id: string;
    name: string;
    description: string;
    icon: string;
    isAcquired: boolean;
    isSelectable: boolean;
}

export interface LevelUpData {
    characterClass: string;
    level: number;
    remainingPoints: number;
    xpProgress: string;
    gold: string;
    fame: string;
    heroImage: string;
    attributes: LevelUpAttribute[];
    talents: Talent[];
}

export const mockLevelUpData: LevelUpData = {
    characterClass: 'Paladin',
    level: 12,
    remainingPoints: 2,
    xpProgress: '12,450 / 15,000',
    gold: '1,420g',
    fame: 'Renowned',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtF6fWsaTKaU0rv_xy2Yx3XBVdJj0kqYb6vUWRU5nNIe3kD4vHZilXe5ato7TwPsZs8NAe052oe6SjgT6BjoiURJ5n5fg0nxkV4PNfGxdaPM-dkOuoySh4nwUiHLuAShkUSg8MDpmyHhAO3fOcV6BCQ6sdk5GI_cm59lH-rhVXk7vQ73YgBqK312jtXDMxDVBvQnvxsJUjFYxzuG5BTkVQ-7kDNJ1eeF4w7Srrh4Xzjz20adfRbKc9hU4-q9BTCOlYwiuILuufwQ',
    attributes: [
        { id: 'str', name: 'Strength', description: 'Physical power and carry load', value: 14, canIncrease: true },
        { id: 'dex', name: 'Dexterity', description: 'Reflexes and range accuracy', value: 10, canIncrease: true },
        { id: 'con', name: 'Constitution', description: 'Endurance and health pool', value: 16, canIncrease: true },
        { id: 'int', name: 'Intelligence', description: 'Spell power and knowledge', value: 8, canIncrease: false }
    ],
    talents: [
        {
            id: 'bastion',
            name: 'Bastion of Faith',
            description: 'Gain +5 Armor when standing still for more than 3 seconds.',
            icon: 'shield',
            isAcquired: false,
            isSelectable: true
        },
        {
            id: 'smite',
            name: 'Divine Smite',
            description: 'Your critical hits now deal an additional 2d6 Radiant damage.',
            icon: 'local_fire_department',
            isAcquired: true,
            isSelectable: false
        },
        {
            id: 'radiance',
            name: 'Holy Radiance',
            description: 'Heal all nearby allies for 10% of your missing health.',
            icon: 'auto_fix_normal',
            isAcquired: false,
            isSelectable: true
        },
        {
            id: 'second_wind',
            name: 'Second Wind',
            description: 'Once per battle, drop to 1 HP instead of dying.',
            icon: 'sword_rose',
            isAcquired: false,
            isSelectable: true
        }
    ]
};
