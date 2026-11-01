# RFC 0047: Honor sorting.enabled=false in Grid

**Status:** Implemented

## Summary

`Grid` accepts `sortingConfig.enabled` (documented default `true`) but never reads it. Setting `sorting: { enabled: false }` does not turn sorting off: headers stay clickable and rows still reorder. This RFC makes `enabled === false` disable sorting for every column, mirroring how `filtering.enabled` already works.

## Problem

`GridSortingConfig.enabled` exists in the public type (`packages/core/src/components/Grid.wsx`) and is documented, but `Grid.wsx` only passes per-column `enableSorting` to `@tanstack/table-core`. Found while writing the RFC-0001 mutation check; recorded as root cause 6 in RFC-0036. A consumer cannot disable sorting from the grid-level config.

## Goals

- `sortingConfig = { enabled: false }` makes `column.getCanSort()` false for all columns.
- Header click and keyboard activation do not change row order; no sort indicator is rendered.
- Default (no config, or `enabled: true` / unset) behaves exactly as today.

## Non-goals

- `multiColumn`, `initialState` and `onSortingChange` semantics: unchanged.
- Per-column `enableSorting` overrides when sorting is enabled: unchanged.
- Any demo (#32) or other issue's behavior.

## Design

In `Grid.wsx` `createTable` options, pass `enableSorting: false` when `_sortingConfigIsSet && _sortingConfig.enabled === false`. tanstack then returns false from `getCanSort()` for every column, and the existing header code (`const canSort = column.getCanSort()`) already skips sort handlers and the indicator. No new state and no new API.

Verification order (test first):
1. Add an e2e case in `demos/react/e2e/` (`?rfc=0002` page with `sorting.enabled=false`) that clicks a header and asserts row order is unchanged. Confirm it fails on current `main`.
2. Apply the one-option change. Confirm the e2e passes.
3. Run the `packages/core` unit coverage gate (plain `.ts` stays at 100%; `.wsx` stays on the global floor) and the existing `RFC-0002 sorting` e2e.

## Acceptance

- New e2e fails before the change and passes after.
- Existing sorting e2e and core unit tests pass; coverage thresholds unchanged.
- `specify validate` and `sync-check` pass.
