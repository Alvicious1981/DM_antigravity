# Unit Test Report

**Date**: 2026-02-15
**Status**: PASSED

## Execution Summary

Tests were executed using `node --test` with `tsx` loader to support TypeScript files, as `bun` is unavailable in the current environment.

### Command

```bash
node --import tsx --test src/**/*.test.ts
```

### Results

- `src/app/smoke.test.ts`: **PASSED** (Verify test runner)
- `src/utils/formatters.test.ts`: **PASSED** (Currency formatting utility)

**Total**: 3 tests passed, 0 failed.

## Test Files

1. **smoke.test.ts**: Basic math assertion to ensure `node:test` and `node:assert` are working correctly.
2. **formatters.test.ts**: Verifies `formatGold` and `formatSilver` functions output correct strings with 'en-US' locale formatting (e.g., "1,000 GP").
