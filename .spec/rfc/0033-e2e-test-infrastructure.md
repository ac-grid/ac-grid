# RFC-0033: E2E test infrastructure

**Status:** Approved

## Summary

Run repeatable Chromium browser acceptance tests for interactive AC Grid features in `demos/react`. Keep fixture data deterministic and require each completed interactive RFC to have a matching demo, acceptance-matrix row, browser test, and feature guide entry.

## Problem

Unit tests do not prove that the browser renders and wires Web Components correctly. The original RFC also treated every completed RFC as an interactive feature. That incorrectly required browser demos for coverage-policy and test-infrastructure RFCs such as RFC-0044.

## Goals

- Run the React demo's Chromium E2E suite through `pnpm test:e2e`.
- Keep fixture rows deterministic across page reloads.
- Check that completed interactive RFCs have registered demos, matrix rows, and matching Playwright evidence.
- Check that implemented P0, P1, and P2 roadmap features have RFC-titled E2E tests.
- Keep infrastructure and coverage-policy RFCs out of the interactive-demo requirement while retaining their feature-guide entries.

## Non-goals

- Replace browser tests with JSDOM tests.
- Require browser demos for RFCs that define infrastructure or test policy without user-facing runtime behavior.
- Collect browser JavaScript coverage as a substitute for feature-scenario coverage.

## Design

1. `demos/react/playwright.config.ts` starts the E2E demo server and runs Chromium tests.
2. `demos/react/src/stories/makeData.ts` uses a fixed fixture seed.
3. `demos/react/e2e/coverage.spec.ts` checks completed interactive RFCs against `RFC_VALIDATION_ORDER`, the RFC-0034 matrix, and Playwright titles. It separately checks all completed RFC IDs against `skills/ac-grid/references/features.md`.
4. RFC-0034 and RFC-0044 do not require demo routes because they define the demo matrix and unit-coverage policy. Their feature-guide rows remain required.
5. The same coverage spec checks implemented P0, P1, and P2 roadmap entries and rejects stale pending entries.

## Acceptance

- `CI=1 pnpm test:e2e` passes in Chromium.
- The coverage spec passes for every completed interactive RFC and every implemented P0, P1, and P2 roadmap feature.
- Fixture data remains identical across reloads.
- Every completed RFC, including infrastructure RFCs, has a row in the ac-grid feature guide.

## Implementation evidence

- Playwright runs serially against the React demo using its configured development server.
- `coverage.spec.ts` validates demo registration, matrix routes, RFC-specific test titles, roadmap coverage, and fixture determinism.
- RFC-0011, RFC-0023, and RFC-0010 have browser demo evidence in `rfc-validation.spec.ts`.
- RFC-0044 is a unit-coverage RFC and has no browser-visible behavior; the coverage guard excludes it from demo checks while keeping its feature-guide check.
- `CI=1 pnpm test:e2e` passed 50/50 Chromium tests in 49.7 seconds after the RFC-0044 policy fix.
