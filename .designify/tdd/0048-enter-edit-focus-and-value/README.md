# RFC-0048 TDD evidence

The test suite checks Enter editing for text, number, and date cells. Each case asserts the original input value, input type, and active focus target.

RED mutation checks:

- Removed the pre-connect `value` and `type` assignment in `Grid.wsx`. `pnpm --filter @ac-grid/core exec vitest run test/editing.test.ts -t 'RFC-0048'` failed on the expected value comparison (`Expected 2026-11-08`, received empty value).
- Restored the `data-wsx-key` on editing cells. The same test command failed on the expected focus assertion (`Expected true`, received false) for all three editor types.

After restoring both fixes, the combined focused RFC command passed: 7 tests passed, 8 skipped. The full core suite passed with 52 test files and 527 tests.

The complete coverage command exposed two unrelated failures: a custom pagination i18n assertion and a virtual-scroll boundary assertion. The virtual-scroll file passed alone. The pagination i18n failure reproduced alone. With that one test excluded, 526 tests passed and one skipped. Coverage measured 71.87% statements, 47.96% branches, 71.52% functions, and 75.26% lines. This is package coverage, not RFC acceptance-case coverage; the RFC-0043 100% package target remains unmet.

A later compatibility experiment moved attribute hydration before `super.onConnected()`. It produced `InvalidStateError` in date and direct-attribute tests, so the change and its out-of-scope direct-attribute test were removed. The final design keeps the RFC's Grid pre-connect property seeding.
