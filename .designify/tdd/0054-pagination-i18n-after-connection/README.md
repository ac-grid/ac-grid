# RFC-0054 TDD evidence

## Red

Before the fix, `pnpm --filter @ac-grid/core exec vitest run test/cov-comp-pagination-search.test.ts -t 'uses a custom i18n manager' --reporter=dot` intermittently failed with:

```text
AssertionError: expected 'Showing 1 to 5 of 5 results' to be '~Showing 1 ~to 5 ~of 5 ~results'
```

Runtime instrumentation showed `_isRendering === true` when the custom manager was assigned. The generic state scheduler drops updates while that flag is true.

## Green

`PaginationControls.i18n` now schedules a component render on the next animation frame after connected manager changes. The regression test asserts the default visible text, changes the manager, verifies falsy assignment retention, and waits for the custom visible text without manually requesting a rerender.

Focused test passed five consecutive runs after the fix. Entire pagination/search test file passed with 17 tests. Core build passed. React Chromium E2E passed 42 tests.

The core coverage run executed 532 passing tests and one skipped test. All four TypeScript thresholds still failed because `grid-state.ts` leaves uncovered branches. Aggregate package coverage was statements 72.42%, branches 48.51%, functions 71.98%, and lines 75.83%. The regular full core run passed 533/533 tests. RFC-0043 owns the package-wide 100% target.
