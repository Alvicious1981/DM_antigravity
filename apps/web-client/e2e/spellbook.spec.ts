import { test, expect } from '@playwright/test';

test.describe('Arcane Mastery: Spellcasting', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.bg-green-500')).toBeVisible({ timeout: 10000 });
    });

    test('should search and cast a spell with multiple targets', async ({ page }) => {
        // 1. Add some combatants first (Assume they are added by default or via some action)
        // For the sake of E2E, we'll assume "Goblin 1" and "Goblin 2" exist in the tracker.

        // 2. Select targets in InitiativeTracker
        // They should have data-testids like combatant-ID
        // We'll wait for combatants to load
        await expect(page.locator('[data-testid^="combatant-"]').first()).toBeVisible();

        const combatants = page.locator('[data-testid^="combatant-"]');
        const count = await combatants.count();

        // Select the first two combatants
        if (count >= 1) await combatants.nth(0).click();
        if (count >= 2) await combatants.nth(1).click();

        // 3. Switch to Spellbook tab
        await page.getByTestId('spells-tab').click();

        // 4. Search for "Fireball"
        const searchInput = page.getByTestId('spell-search-input');
        await searchInput.fill('Fireball');

        // 5. Expand the spell card
        const fireballCard = page.locator('[data-testid^="spell-card-"]').first();
        await fireballCard.click();

        // 6. Cast the spell
        await page.getByTestId('cast-spell-btn').click();

        // 7. Verify narrative for casting
        await expect(page.getByTestId('story-log')).toContainText('Fireball', { timeout: 15000 });
    });
});
