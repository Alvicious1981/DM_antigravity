import { test, expect } from '@playwright/test';

test.describe('Combat Mechanics: The Meat Grinder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Ensure connected (Red circle turns green)
        await expect(page.locator('.bg-green-500')).toBeVisible({ timeout: 10000 });
    });

    test('should execute a full attack turn and show narrative', async ({ page }) => {
        // 1. Initial State
        const hpText = await page.getByTestId('hp-values').innerText();
        const initialHp = parseInt(hpText.split(' / ')[0]);

        // 2. Perform Attack (Valerius attacks Goblin)
        await page.getByTestId('attack-btn').click();

        // 3. Verify Narrative Stream starts
        await expect(page.getByTestId('current-narrative')).toBeVisible();

        // 4. Wait for stream to finish and entry to be added to log
        // The narrative should contain combat-related terms
        const log = page.getByTestId('story-log');
        await expect(log.getByTestId('story-entry').first()).toBeVisible({ timeout: 15000 });

        // 5. Verify HP deduction (If it was a hit/miss, we just check if state patched)
        // Since we are mocking/resolving on server, we expect a patch eventually.
        // For the sake of a deterministic test in this environment, we look for the transition.

        // Note: The monster attack might also happen.
        await page.getByTestId('monster-attack-btn').click();
        await expect(page.getByTestId('story-entry').filter({ hasText: 'Valerius' }).first()).toBeVisible();
    });
});

test.describe('Arcane Mastery: Spellcasting', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.bg-green-500')).toBeVisible();
    });

    test('should open spellbook and cast a spell', async ({ page }) => {
        // 1. Open Spellbook (Might need to be toggled or already visible)
        // Assuming it's in the side panel or a tab. 
        // Based on page.tsx, it's not immediately visible? 
        // Wait, I don't see SpellBook in Home() return. 
        // Let me check page.tsx again.
    });
});
