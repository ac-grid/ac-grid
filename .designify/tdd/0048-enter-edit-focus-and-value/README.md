# RFC-0048 TDD evidence

The test suite checks Enter editing for text, number, and date cells. Each case asserts the original input value, input type, and active focus target.

RED mutation checks:

- Removed the pre-connect `value` and `type` assignment in `Grid.wsx`. `pnpm --filter @ac-grid/core exec vitest run test/editing.test.ts -t 'RFC-0048'` failed on the expected value comparison (`Expected 2026-11-08`, received empty value).
- Restored the `data-wsx-key` on editing cells. The same test command failed on the expected focus assertion (`Expected true`, received false) for all three editor types.

After restoring both fixes, the combined focused RFC command passed: 7 tests passed, 8 skipped. The full core suite passed with 52 test files and 527 tests.

Final verification: `pnpm --filter @ac-grid/core test:coverage` passed with 52 test files, 527 tests passed, and one skipped. Coverage measured 71.89% statements, 48.04% branches, 71.52% functions, and 75.28% lines. `pnpm --filter @ac-grid/demo-react test:e2e` passed all 40 Chromium tests, including RFC-0009 editing save/cancel and RFC-0049 Enter editing. These numbers describe package coverage; RFC-0043's 100% package target remains unmet.

A later compatibility test found that removing the unconditional animation-frame value write also blanked attribute-only `CellEditor` consumers. The test failed with `expected '' to be 'Attribute value'`. The final code writes the fallback only when no value property was set before connection. Grid's pre-connect property path skips that write, avoiding the original repeated-text regression. Moving hydration before `super.onConnected()` was rejected after it produced `InvalidStateError` in date tests.
