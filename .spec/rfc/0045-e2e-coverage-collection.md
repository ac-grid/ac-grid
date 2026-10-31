# RFC 0045: E2E coverage of P0, P1 and P2 features (child of 0043)

**Status:** Approved

**Parent:** [0043](0043-coverage-100-umbrella.md)

## Summary

建立按优先级的 E2E 功能清单：ROADMAP 里每个 P0、P1、P2 功能都必须有对应的 Playwright 测试，CI 里有检查，缺一个就失败。按功能度量，不按代码行度量。

## Problem

`demos/react/e2e/coverage.spec.ts` 只检查"每个已完成的 RFC 有 demo 和测试"。它不看优先级，也不覆盖未完成或草稿阶段的功能；ROADMAP 里的 P0、P1、P2 功能是否都有 E2E，没有任何地方在检查。

## Goals

- 一份机器可读的功能清单，列出每个 P0、P1、P2 功能、它的 RFC、对应的 E2E 测试名。
- CI 检查：清单里每个功能都有至少一个匹配的 E2E，没有则失败。
- 优先级从 ROADMAP 表格读取，不另存一份，避免漂移。

## Non-goals

- E2E 的代码行覆盖率。
- 补每个功能缺失的测试本身：缺口在检查跑出来后，作为本 RFC 的实施任务逐个补。
- 单元覆盖：见 0044 和 0046。

## Design

1. 读 `.spec/ROADMAP.md` 的功能表，取每行的 RFC id 和优先级（P0/P1/P2）。
2. 清单文件放 `demos/react/e2e/feature-matrix.json`：每个 RFC id 对应一组测试标题关键字（形如 `RFC-0002`）。
3. 扩展 `coverage.spec.ts`：对每个 P0/P1/P2 功能，要求 `rfc-validation.spec.ts` 等 spec 文件里存在匹配的测试；未实现（草稿或待规划）的功能列入 `pending` 并带原因，不静默跳过。
4. 现有缺口（例如 0014 导出、0020 树形数据等未完成的功能）按优先级补 E2E 或明确登记 pending。

## Acceptance

- 清单覆盖 ROADMAP 里全部 P0、P1、P2 功能，缺一项 CI 变红。
- 变异检查：删掉某个功能对应的 E2E，检查必须失败。
- 所有 P0 和已完成的 P1、P2 功能的 E2E 在并行配置下连续通过三次。
