import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatGold, formatSilver } from './formatters';

describe("Formatters Utility", () => {
    it("should format gold correctly", () => {
        assert.strictEqual(formatGold(100), "100 GP");
        assert.strictEqual(formatGold(1000), "1,000 GP");
    });

    it("should format silver correctly", () => {
        assert.strictEqual(formatSilver(50), "50 SP");
    });
});
