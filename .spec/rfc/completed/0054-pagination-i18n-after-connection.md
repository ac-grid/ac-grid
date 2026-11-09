# RFC 0054: PaginationControls 动态更新自定义 i18n

**Status:** Implemented

## Summary

`PaginationControls` accepts a custom i18n manager after connection, but the rendered labels keep using the default messages. The regression test fails when it expects `~Showing 1 ~to 5 ~of 5 ~results` and receives `Showing 1 to 5 of 5 results`. Keep the public `i18n` property and make rendered text reflect its current value.

## Problem

The failure reproduces when `cov-comp-pagination-search.test.ts` runs alone and in the full core coverage suite. The test assigns a custom manager, assigns `null` to verify the existing manager remains, then requests a rerender. The getter returns the custom manager, but the DOM renders default text. The component's i18n state and render path therefore disagree after connection.

## Goals

- Updating `i18n` after connection updates pagination labels.
- Assigning a falsy manager keeps the current manager.
- Omitting a custom manager keeps default messages.
- Keep `PaginationControlsProps` and existing public property behavior compatible.

## Non-goals

- Do not change `I18nManager` translation behavior.
- Do not change other components' i18n state.
- Do not change locale configuration or grid-level message propagation.

## Design

### Task 1: Reproduce state-to-render mismatch

Inspect the `PaginationControls.i18n` getter and setter, state decorator output, and `LightComponent` rerender lifecycle. Add a focused regression assertion that fails on the current implementation and captures the state observed by `render()`.

### Task 2: Fix i18n state ownership

Make the public setter and `render()` read the same current manager after connection. Preserve falsy-assignment behavior and default fallback. Keep the change within `PaginationControls` and its test unless runtime evidence requires a shared framework fix.

### Task 3: Verify regression and compatibility

Run the pagination/search test file, full core coverage suite, core build, and React Chromium E2E suite. Confirm the regression test fails with the old implementation and passes with the fix.

## Acceptance

- The custom i18n test passes in isolation and in the full core test suite.
- The test proves custom visible text, falsy assignment retention, and default fallback.
- Core build and all core tests pass.
- React Chromium E2E suite passes.
- Package coverage is reported with exact metrics. This RFC does not claim RFC-0043's package-wide 100% target.

## Implementation evidence

- `PaginationControls` stores its i18n manager as a plain field and schedules `_rerender()` on the next animation frame when the public property changes after connection. This avoids relying on the generic state scheduler, which can drop updates while its render flag is set.
- The regression test confirms default text, custom visible text, and falsy assignment retention without manually invoking `rerender()`.
- Focused regression passed five consecutive runs. The pagination/search test file passed 17/17 tests. Full core tests passed 533/533 tests. Core build passed. React Chromium E2E passed 42/42 tests.
- `test:coverage` ran 532 tests successfully and skipped one, then exited 1 because package-wide TypeScript coverage remains below 100%. Aggregate coverage was statements 72.42%, branches 48.51%, functions 71.98%, and lines 75.83%. Gaps remain in `grid-state.ts` and are owned by RFC-0043's package-wide coverage target.
