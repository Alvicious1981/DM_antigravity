export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    isActive?: boolean;
    isDanger?: boolean;
}

export interface EpicBattleMenuData {
    backgroundImage: string;
    logo: {
        title: string;
        subtitle: string;
        edition: string;
    };
    menuItems: MenuItem[];
    build: {
        version: string;
        server: string;
        copyright: string;
    };
}

export const mockEpicBattleMenuData: EpicBattleMenuData = {
    backgroundImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFziblUoLEBJ8Mv71ao0Dj4qaM-HPqvFP0x_63OyV8ozWEWxv4VTBG7zTZXCcQqh8Wk-GSJFCWOsuK1d4gBvPG4Pljm5dw_LijWmuzygMve4Hn9L4ns3qzpCfKx9j0scfMUM9pMvmOlHQjyLNYa-EpgjcZ8dnUvHZ7JZ96GgPu9gzSm0kGAp9v5Tti5A_PDyVdjS-eq9TyPag8kywKncpwQMRn1kWq5XLXlPYPfLdvN4nnBO5amfaTQHQwYkw0KV1Y866J_ZY-wQ',
    logo: {
        title: 'Dragons & Dungeons',
        subtitle: 'The Epic',
        edition: 'Online Chronicles'
    },
    menuItems: [
        { id: 'continue', label: 'Continue', icon: 'swords', isActive: true },
        { id: 'new-game', label: 'New Game', icon: 'add_circle_outline' },
        { id: 'load-game', label: 'Load Game', icon: 'history_edu' },
        { id: 'options', label: 'Options', icon: 'settings' },
        { id: 'quit', label: 'Quit to Desktop', icon: 'logout', isDanger: true }
    ],
    build: {
        version: 'v4.2.0-beta',
        server: "Dragon's Rest [US-East]",
        copyright: '© 2023 Dark Fantasy Studios. All rights reserved.'
    }
};
