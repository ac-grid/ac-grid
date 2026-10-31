# RFC 0043: Full coverage to 100% (Umbrella)

**Status:** Approved

**Type:** Umbrella

## Summary

两条覆盖要求，度量方式不同：`packages/core` 的**单元测试**（vitest）达到 100%（语句、分支、函数、行）；**E2E**（Playwright）覆盖 ROADMAP 中所有 P0、P1、P2 功能，按功能度量，不按代码行度量。本 RFC 只做索引和完成标准，具体方案在三个子 RFC 中。

## Problem

2026-10-31 实测 `packages/core` 单元覆盖：语句 56.85%、分支 36.01%、函数 56.06%、行 59.14%（4953 条语句，约 2100 条未覆盖）；现有棘轮只防止下降。E2E 方面，`coverage.spec.ts` 只保证"每个已完成的 RFC 至少有一个测试"，没有按优先级检查功能覆盖，也没有 P2 的清单。

## Goals

- `packages/core` 单元覆盖率四项均为 100%，阈值写入配置并在 CI 强制。
- ROADMAP 里每个 P0、P1、P2 功能都有对应的 E2E，缺一个 CI 就变红。

## Non-goals

- 其它包（`theme-base`、`theme-default`、`demos`、`apps/site`）的覆盖率。
- 度量 E2E 的代码行覆盖率。
- 修复覆盖过程中发现的产品缺陷：另开 RFC 或 issue，不并入本伞。
- 为凑数字写空断言的测试（各子 RFC 有变异检查）。

## Children

| RFC | Concern |
|-----|---------|
| [0044](0044-unit-coverage-logic.md) | Unit coverage for logic modules |
| [0045](0045-e2e-coverage-collection.md) | E2E coverage of P0, P1 and P2 features |
| [0046](0046-component-coverage-closure.md) | Unit coverage for components |

## Acceptance

0044、0045、0046 都达到各自 Acceptance，且 `pnpm --filter @ac-grid/core test:coverage` 四项为 100%、E2E 功能覆盖检查通过。伞 RFC 在此后关闭，不再为新工作重开。
