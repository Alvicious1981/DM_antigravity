export interface DeathStats {
    timeSurvived: string;
    enemiesDefeated: number;
    goldLooted: number;
    levelReached: number;
    causeOfDeath: string;
}

export const mockDeathStats: DeathStats = {
    timeSurvived: '02:14:35',
    enemiesDefeated: 42,
    goldLooted: 1250,
    levelReached: 12,
    causeOfDeath: 'Desangrado por Garra de Wyvern'
};
