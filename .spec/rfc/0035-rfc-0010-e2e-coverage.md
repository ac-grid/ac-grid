# RFC-0035: RFC-0010 grouping and aggregation E2E coverage

**Status:** Approved

## Summary

Add a runnable React demo and Chromium E2E test for RFC-0010 row grouping and aggregation. The browser test verifies group rows, aggregate values, collapse and expand actions, and individual group toggling.

## Problem

RFC-0010's grouping engine had unit tests but no browser acceptance evidence. The RFC-0034 matrix requires completed interactive features to have a runnable demo and matching E2E test.

## Goals

- Register an RFC-0010 demo with deterministic rows and grouping controls.
- Verify rendered group rows and formatted count, average, and sum aggregates.
- Verify collapsing all groups, toggling an individual group, and expanding all groups.
- Record the demo route and Playwright evidence in the RFC-0034 matrix.

## Non-goals

- Change grouping, aggregation, or public Grid APIs.
- Add server-side grouping.

## Design

1. Register the `/?rfc=0010` fixture in `demos/react/src/rfcValidationDemos.ts`.
2. Add demo controls for collapsing and expanding groups.
3. Exercise the rendered grid and controls in `demos/react/e2e/rfc-validation.spec.ts`.
4. Record the route and test title in `.spec/rfc/completed/0034-rfc-demo-acceptance-matrix.md`.

## Acceptance

- The Chromium test verifies group headers and count, average, and sum values.
- The test verifies collapse-all, individual-group toggle, and expand-all behavior.
- The targeted RFC-0010 E2E test and full `CI=1 pnpm test:e2e` suite pass.
- Unit tests remain green.

## Implementation evidence

- `demos/react/src/rfcValidationDemos.ts` registers the RFC-0010 fixture and group controls.
- `demos/react/e2e/rfc-validation.spec.ts` verifies rendered aggregates and group expansion behavior.
- `.spec/rfc/completed/0034-rfc-demo-acceptance-matrix.md` records route `/?rfc=0010` and the E2E test title.
- The targeted RFC-0010 Chromium test passed 1/1.
- `CI=1 pnpm test:e2e` passed 50/50 Chromium tests in 49.7 seconds.
- `pnpm --filter @ac-grid/core test` passed 565/565 tests across 53 files.
