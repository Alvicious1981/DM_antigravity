export function formatGold(amount: number): string {
    return `${amount.toLocaleString('en-US')} GP`;
}

export function formatSilver(amount: number): string {
    return `${amount.toLocaleString('en-US')} SP`;
}
