export interface InventoryItem {
    id: string;
    name: string;
    count?: number;
    icon: string;
    type: 'image' | 'symbol';
    imageUrl?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface EquipmentSlot {
    id: string;
    label: string;
    item?: InventoryItem;
    isEmpty: boolean;
}

export interface InventoryForgeData {
    playerName: string;
    characterTitle: string;
    gold: number;
    goldWeight: string;
    carryCapacity: string;
    health: {
        current: number;
        max: number;
    };
    spellSlots: {
        level: number;
        current: number;
        max: number;
    };
    attributes: {
        label: string;
        value: number;
        modifier: string;
        modifierColor: string;
    }[];
    armorClass: number;
    initiative: string;
    speed: number;
    equipment: {
        head: EquipmentSlot;
        chest: EquipmentSlot;
        arms: EquipmentSlot;
        weapon: EquipmentSlot;
        shield: EquipmentSlot;
        legs: EquipmentSlot;
    };
    backpack: (InventoryItem | null)[];
}

export const mockInventoryForgeData: InventoryForgeData = {
    playerName: 'Inventario — Forja',
    characterTitle: 'Level 4 Paladin • Oath of Vengeance',
    gold: 1245,
    goldWeight: '12.4 lbs',
    carryCapacity: '45 / 80',
    health: {
        current: 45,
        max: 100
    },
    spellSlots: {
        level: 1,
        current: 3,
        max: 4
    },
    attributes: [
        { label: 'STR', value: 18, modifier: '+4', modifierColor: 'text-green-500' },
        { label: 'DEX', value: 12, modifier: '+1', modifierColor: 'text-green-500' },
        { label: 'CON', value: 14, modifier: '+2', modifierColor: 'text-green-500' },
        { label: 'INT', value: 10, modifier: '0', modifierColor: 'text-slate-500' },
        { label: 'WIS', value: 12, modifier: '+1', modifierColor: 'text-green-500' },
        { label: 'CHA', value: 8, modifier: '-1', modifierColor: 'text-primary' }
    ],
    armorClass: 18,
    initiative: '+1',
    speed: 30,
    equipment: {
        head: {
            id: 'head',
            label: 'Head',
            isEmpty: false,
            item: {
                id: 'helm-1',
                name: 'Iron Helmet',
                icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi6fnqCF3Hjg12AlsIrbSKYZs5k-0jBYYjAdtu-iDZNMQ9YfwDUBULwfw0GUJGiC8CvTARw7l2XBhCorB76up5W7nhGZ2YQLCxm1ZBGDL1vL-x5MyXRRM2JsVBAT6TSvBLE6DAEVq_RygrQEdT8TfLjq6D1aj-SSfrzY6mukzkFwbUdMemK7G4EstpiQ6r5g8vNEsIA6BEJbR1trvkPe9nKDmSpj-QeJ3zUG6MIQE7aJDR6vk911x7SUvXBpnSMr0D3f-dYW1nmA',
                type: 'image'
            }
        },
        chest: {
            id: 'chest',
            label: 'Chest',
            isEmpty: true
        },
        arms: {
            id: 'arms',
            label: 'Arms',
            isEmpty: false,
            item: {
                id: 'gauntlets-1',
                name: 'Leather Gauntlets',
                icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRBJJJi7p-BVZUxPntFE2cxhLsdjnTMx3eQYIbUa2czV4T_dnF_yjS_boTfvFReTii0vti_I9-yMtoykD38AYgBkt_hNO8buAOYFT3UCcDfnwD0-zqadCk8rn1dxCZe7yQ1t52hL5M8Tq_dx5fcSz1ha9IczFeI5fjSNyaF-aKNXrbleVfeHu11_FC41BwX_W7YsrQ3STZobGYpopDRPibj-t4Rvz6wALDDPy_lULW6S6MQRMd65tv5JvyP-ftrcI2fiiNsUZozA',
                type: 'image'
            }
        },
        weapon: {
            id: 'weapon',
            label: 'Weapon',
            isEmpty: false,
            item: {
                id: 'sword-1',
                name: 'Jagged Iron Sword',
                icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFvtzvOiWjeMql1iWWHhRD04aMEf_C6k6aff_2-GgVG9t_Pme7axHnZtXnFXk2hJaBexZOU_r0VX3Ln3mgJOU9W-1W8EFJfpIJGixPNY97KgMmuGU5uXgp30x_Jow5EkGnMD8Nlb2oBfAWsEXA-Sz6iCQ4-rtesrXtPjIrA8xnKOgCpdDZ0u4h5ib12pw85xqj3Y4TDBZebrDXMOW4BT8V3BCIMA1l3KDbcvUv3mjBuZCBQcQcBu8KO7d0RrK7M-zlwACRwtWGEQ',
                type: 'image'
            }
        },
        shield: {
            id: 'shield',
            label: 'Shield',
            isEmpty: true
        },
        legs: {
            id: 'legs',
            label: 'Legs',
            isEmpty: false,
            item: {
                id: 'boots-1',
                name: 'Leather Boots',
                icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdl1Z7NAUGI4ZjEJ-mWPiam2uSDc8e0ENQbSQMcpacvSA6L47VCIC7Y8tZJ9jWn5TZR3rpK-Y8dT8j4Vx2zjmejiOZoQ49XnhBREYyUDlb6umyNNpLnlU0IWwhVyoEfGzzH7D7SksXI8t1EXFlgu9wvoruAADA-h2WZ1T0yR2XsLp59M5-gC6DY7W331QoHSH6R9MOLd460Fk4HsaN2nzlwajDclnqFfkqWNopHXeRjXEN5wi7-6XhcGVpPTTOx-TErtdyS9mRVw',
                type: 'image'
            }
        }
    },
    backpack: [
        {
            id: 'potion-1',
            name: 'Small Health Potion',
            count: 3,
            icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeC7S5InMz5psHntZaNKA1WnQguvb6x-Z8iUysg3ep7wRA6DxdSZEmF_PVARv8yMemqfYVjFuQHlSla2PeHg_ZcAXkMjMt7W65lMAMjT5tfkrBrTCDl_A4gQSKzFFlCrxfgtS06iAzvYL6l1mLpdkPinvG7Iisy-WV6O3aaxmN_aJIGAw3xCd-X2nUpRBepEvhtSKCCBgf1ZiA4WaMBJp_eRGARiNYO6-qy_b5T-OZ09SUeYh0g9JIZLi9K4GIghOiuigBbdn3Qw',
            type: 'image'
        },
        {
            id: 'scroll-1',
            name: 'Arcane Scroll',
            icon: 'menu_book',
            type: 'symbol'
        },
        {
            id: 'dagger-1',
            name: 'Rusty Dagger',
            icon: 'colorize',
            type: 'symbol'
        },
        ...Array(22).fill(null)
    ]
};
