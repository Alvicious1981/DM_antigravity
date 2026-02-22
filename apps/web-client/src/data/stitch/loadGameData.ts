export interface SaveSlot {
    id: string;
    characterName: string;
    characterClass: string;
    level: number;
    location: string;
    playtime: string;
    timestamp: string;
    state: string;
    stateColorClass: string;
    stateIcon: string;
    imageUrl: string;
    imageAlt: string;
    isAutosave: boolean;
}

export interface LoadGameData {
    saves: SaveSlot[];
    partyMembers: { url: string; alt: string; isActive: boolean }[];
    activeQuest: {
        title: string;
        description: string;
    };
    gameVersion: string;
    difficulty: string;
    previewImage: string;
    previewTitle: string;
    dangerLevel: string;
}

export const mockLoadGameData: LoadGameData = {
    saves: [
        {
            id: 'save-1',
            characterName: 'Garrick the Bold',
            characterClass: 'Paladin • Oath of Vengeance',
            level: 14,
            location: 'The Molten Core',
            playtime: '42h 15m',
            timestamp: 'Oct 24, 2023 - 12:42 PM',
            state: 'Combat State',
            stateColorClass: 'text-red-400',
            stateIcon: 'swords',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEg0wgDOBNJR3PV932E2pzLvW18QgAIlbn0VWXex-pyj1Y4BJKkKeO0e3G_ArrYn9DgtKEx5r8uSq6EBvFaFhMqPC8F7GP_7Rk0QCVL0ete3sMX7fZGAzIiCpCHMwMgGrte5rkqmBS2uOQG-btQtyHf06F0opyp-pMXdyPm570bhJ0O2D_iwchiQtt9Erfd_usx0HP-AjoPU0h0S_E7K_xEvijhENNR-LdiZyUhbmxZKEis7ZMID14oVMlnXLKM0Btzaf5pgPAZg',
            imageAlt: 'Dark fantasy dungeon corridor with torches',
            isAutosave: true
        },
        {
            id: 'save-2',
            characterName: 'Elara Shadowstep',
            characterClass: 'Rogue • Assassin',
            level: 8,
            location: "Merchant's Guild",
            playtime: '18h 30m',
            timestamp: 'Yesterday - 9:15 PM',
            state: 'Safe Zone',
            stateColorClass: 'text-stone-500',
            stateIcon: 'bed',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfnKm-xPdOkExCPjo47EOu5OqN-zZp_OjYcs1_2e9qw92t2zcymrwBTahl9xhFJQRK96gAruCA9QPJ0NeXFXOu_nvFwwS7dlHJ8DDkdgq1HZsQuKzmMF9IYCIARlAup3Su3bhsQuhiljo-md_p5O0G-YjW-0VL4Rcw8P8SCK-rzLhurYX34wpTy112IyOUCEuKBAcvj5CbH5blpEav4BCXQwBRayYOACtanOjX5eNbmATJH3bC00NunaXbQUM31uwq-Mxs_2F3yg',
            imageAlt: 'Gloomy forest clearing at dusk',
            isAutosave: false
        },
        {
            id: 'save-3',
            characterName: 'Kaelen Fireheart',
            characterClass: 'Wizard • Pyromancer',
            level: 5,
            location: 'Tutorial Dungeon',
            playtime: '3h 12m',
            timestamp: 'Oct 22, 2023 - 4:20 PM',
            state: 'Exploration',
            stateColorClass: 'text-stone-500',
            stateIcon: 'explore',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhMWZrIq4T0dqpU6g51r0D2yEv8yeOV3i50uMN6yDFaTAKToUKvmWBFcqzAfCd9aphEB-WtMKi7V0u8Q7hqt0gj77CGpxCzIySJrS1gWMMymZ3JeZGoYpwReAdEo0mjAn63srFVzGDqbumlNkCsc8rEyyT0tZJjE9KtGR_od341ToqKbbDzvDUhGiB0GvKd-kSNzDdeI0GJdAokJLIHmojcm7hz9Uutt_XZlOoaJc-sjrfY2eEpxVCPJykuqRC2_FKgc6eswjbeQ',
            imageAlt: 'Ancient stone ruins in fog',
            isAutosave: false
        },
        {
            id: 'save-4',
            characterName: 'Bjorn Iron-Side',
            characterClass: 'Barbarian • Berserker',
            level: 22,
            location: 'Frostfall Peak',
            playtime: '65h 40m',
            timestamp: 'Sept 14, 2023 - 11:00 PM',
            state: 'Exploration',
            stateColorClass: 'text-stone-500',
            stateIcon: 'explore',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ5TCrvcNjRnmTN-qj-PqCymmVzgsaxTl9lHFDBpMtz002g8KkvMY7wlYBPDwAISaHpg5lNlKxxEy8HHnrn4KkhJR-t5BAkUpoF90YCfqzjZ1i1oJ8fpP0O8yIOQNh4pFRl_QVzWw6ijfQDiFDt0CzYd4E2RkTij1FYZPRUHUrLqVt4ODhTTIcZAgTx9obpqdHKhLhfIGDlkkDg7NcIyUk1R60H9dD0DUE0Ybus-m2ZeXcryzNAilN9f-pCvs6qCw3wTDTTRfjOA',
            imageAlt: 'Dark snowy mountain peak',
            isAutosave: false
        }
    ],
    partyMembers: [
        { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9XPLbN-dNuFY4NHC89skYEst5HNnXYWhgd7BedgV_deGvPFXoZEf8TqRAdBJeLdkSPIKuBKsW2Dk9Mvxcdz0nZuK2nYCpHhDiyd6qjW7meS7QpJU_5VfnNcHTqP_HeAbee-chf0ttXw2UBpP82nwIxt839lNXrMpcI5-1NsRRwVBIQ17D9AJjYDfx4tmos50jBIiEhQFc0qQmHCewuUZ_jgvN1nsx2yX6F211JF4UboqUviRGDiWMuCHiXOtraBGIkfyOAk5f2Q', alt: 'Party member 1', isActive: true },
        { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACn1ZaAZPg_2o72mMFtS3QjD7Pavqa9FiJVNb7orfhSE2njnCBDBWuwacdE3nWVO7SijQOQ0ts2iDhGFS_MfrtegrwdJPAiOjnXqmyw2pfiBHx4RjEiLmOaENIt14MxvmcUSLB1NRIkZQCRDyh9pQYDOIsmMWTAibSL8wfPQ-WznExm6Prb7_-_CVdahlfO-UqEYXXJlBuw_CUIR9S2e34vlWMvruXxAlZ0AWgrc5BU-wECzA-r62RnwnQPyRSXSb6jd537eXyKw', alt: 'Party member 2', isActive: false },
        { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWc9HOBLgUsDOLeo8loH2paWFv98ft9J9zRbtXXGXOMCvGF79rPZhC5pHvoB-ckiEnynCnN_qFP-8RfYffvy-jIpRnJGr2WKYJam7Uh8XyxPUw1_uz63aOnDnHqJBtVaVNWMf05p1dNHP5LWG_tUCKWIHgXB6SUBYxTl4mTzwVsWr4kqZX7dDFFRFiOfgRCm9PTzYJYIxp4qa0_Xl0C3xCZqK5_SiqsZOx9looD3MtkmGcGGsQt52gOyxEMz92ARkUtvTKZNpg7g', alt: 'Party member 3', isActive: true }
    ],
    activeQuest: {
        title: 'The Heart of the Volcano',
        description: '"Retrieve the Ember Gem from the depths of the core before the volcano erupts."'
    },
    gameVersion: '1.4.2',
    difficulty: 'HARDCORE',
    previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB54sm2TntUnE7zbyVC7nv73CneieC53vpTfwJtEJLsZ4SCUU_lCJRuEwIwrW7PBn2gOOiUbeQqUPzXXz7tVNrn4aX92ucI2fU5WlrE6tOjqsQ46dHIuEm3u9rrENi75lxZGGMH1nRjF77NaKmTBYBWVD2L1mrH2m4oFwyRFqpY1mTJPmhcW3ykg_T-z-J2yDyHMSTX8ifdOk4qV71BsIWMFzV_jFVH3NTL61r26zP5J-cVZwEgtY4GvKhI72AFXtviTY1zY_BdzQ',
    previewTitle: 'The Molten Core',
    dangerLevel: 'Extreme'
};
