# RFC-0049 TDD evidence

Unit tests assert that `editTrigger: both` starts one edit when keyboard navigation is off, `doubleClick` does not start an edit, and enabling keyboard navigation still starts exactly one edit. The Enter cases assert editor focus and original value.

The browser test starts from a demo with keyboard navigation disabled, sets the public editing configuration to `both`, presses Enter on a focused cell, and checks that the editor appears focused with the original value.

RED mutation check:

- Removed the Enter branch from the cell key handler in `Grid.wsx`. `pnpm --filter @ac-grid/core exec vitest run test/editing.test.ts -t 'Enter trigger independent of keyboard navigation'` failed because no editor appeared. Two non-trigger cases passed.
- Restored the implementation. The focused suite passed: 7 tests passed, 8 skipped. Chromium E2E passed: 1 test.

The full core suite passed with 52 test files and 527 tests. The complete Chromium E2E suite passed: 40 tests. The RFC acceptance cases are covered. Package code coverage is 71.87% statements, 47.96% branches, 71.52% functions, and 75.26% lines when excluding one independently reproducible, unrelated pagination i18n failure. RFC-0043's package-wide 100% target remains unmet.
