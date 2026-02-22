export interface StoryLogEntry {
    id: string;
    type: 'narrative' | 'combat' | 'dialogue' | 'choice' | 'system';
    timestamp?: string;
    content: string;
    actor?: {
        name: string;
        role: string;
        imageUrl: string;
    };
    combatInfo?: {
        round: number;
        title: string;
        hit?: boolean;
        val1?: string;
        val2?: string;
    };
    choiceLabel?: string;
}

export interface Action {
    id: string;
    label: string;
    type: 'combat' | 'investigation' | 'charisma';
    category: string;
    icon: string;
    subtext: string;
    outcome?: string;
    colorClass: string;
    borderColorClass: string;
    glowColorClass: string;
}

export interface GameplayHudData {
    worldTime: string;
    character: {
        name: string;
        level: string;
        class: string;
        portraitUrl: string;
    };
    stats: {
        hp: { current: number; max: number };
        spellSlots: { current: number; max: number };
    };
    log: StoryLogEntry[];
    actions: Action[];
}

export const mockGameplayHudData: GameplayHudData = {
    worldTime: 'Day 14, 10:42 AM',
    character: {
        name: 'Sir Gideon',
        level: 'Nvl 4',
        class: 'Paladin',
        portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbdpnp_vrn5zrQ69ESnGCZbZPz8MK0kt5GXcB9TjYkOjaZEUV_9gGZ7ddlGgDW71wVlYhvusjh2PoFzlqUmRT7btCSALLXjhgxxchMew8lupopBFOdH5d8rDLnaTKjebvUeTbVXB9grXSJJOw21CXoKQp5kodLe_sP5XaIvIyyfTJQISMzGV1_aDYr7ONv-L-A6tAMaLWlRbJ13l2o24XKJNyS3jrjnns0U14Tuz-6g-JAimNPft3i4_jAFHmdHkxmz5kmVSrkRA'
    },
    stats: {
        hp: { current: 42, max: 58 },
        spellSlots: { current: 3, max: 4 }
    },
    log: [
        {
            id: 'log-1',
            type: 'narrative',
            content: 'You stand before the ancient gates of the Sunken Citadel. The massive iron doors, slick with the moisture of the deep caves, loom overhead. The air is thick with the metallic tang of ozone and the sickly sweet smell of decay. A low, guttural growl echoes from within the shadows, vibrating through the stone floor beneath your boots.'
        },
        {
            id: 'log-2',
            type: 'dialogue',
            actor: {
                name: 'Game Master',
                role: 'Narrator',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr0doBlezGMcprtKWhrR2erytnpGie6q6r0tRmfBIMsapRZyJqjEQjXRbQjBjfdlzrHuMj3MR313tx2Ei631xiWmKR2_j3EZGNSDRpoZrPKa9k7X2hzBFCceEeb7TL9WCP0O3cdicfLrfl5nu2R8llvj0ve6dRv1UsM3R1P_DNaT5ehephlUnVdZBSv0ix69bjueZHLsWRgyjNyK-ZzLHAiI0kgKNaoKLpDkvLp0SF2CdT3DcfG0eJ-3jXbN8WFAJTGhyS72zRAg'
            },
            content: '"The shadows shift. Roll for initiative. The goblin archers have spotted you from the upper ledge."'
        },
        {
            id: 'log-3',
            type: 'combat',
            combatInfo: {
                round: 1,
                title: 'Combat Initiated',
                hit: true,
                val1: '18 vs AC 16',
                val2: '6'
            },
            content: 'Goblin Archer shoots a jagged arrow.'
        },
        {
            id: 'log-4',
            type: 'choice',
            choiceLabel: 'You chose',
            content: '"I raise my shield and charge towards the stairs!"'
        },
        {
            id: 'log-5',
            type: 'narrative',
            content: 'Your boots slam against the wet stone as you surge forward. The arrow glances off your pauldrons with a spark. The goblins screech in alarm, scrambling to reload. You are now at the base of the crumbling staircase.'
        }
    ],
    actions: [
        {
            id: 'attack',
            label: 'Atacar al orco',
            type: 'combat',
            category: 'Combat',
            icon: 'swords',
            subtext: 'Longsword +5',
            outcome: '1d8 + 3 Slashing',
            colorClass: 'bg-[#8a0b20]',
            borderColorClass: 'border-[#3a3a3a]',
            glowColorClass: 'primary'
        },
        {
            id: 'inspect',
            label: 'Inspeccionar',
            type: 'investigation',
            category: 'Investigación',
            icon: 'search',
            subtext: 'Search for traps',
            colorClass: 'bg-[#8a7e57]',
            borderColorClass: 'border-[#3a3a3a]',
            glowColorClass: 'gold'
        },
        {
            id: 'persuade',
            label: 'Persuasión',
            type: 'charisma',
            category: 'Charisma',
            icon: 'record_voice_over',
            subtext: 'Try to parley',
            colorClass: 'bg-[#1e3a8a]',
            borderColorClass: 'border-[#3a3a3a]',
            glowColorClass: 'blue-600'
        }
    ]
};
