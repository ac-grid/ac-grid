# RFC 0045: E2E coverage of P0, P1 and P2 features (child of 0043)

**Status:** Implemented

**Parent:** [0043](../0043-coverage-100-umbrella.md)

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

## Delivery

- 实现早已在 `demos/react/e2e/coverage.spec.ts` 与 `feature-matrix.json`（提交 `c94ced2`）：优先级从 ROADMAP 表格解析，不另存。ROADMAP 共 25 个 P0/P1/P2 功能：18 个已实现（P0 8、P1 9、P2 1）逐个要求有以 `RFC-NNNN` 命名的 E2E；7 个 Draft（0020、0021、0024、0025、0026、0027、0028）登记为 pending 并写明原因，清单里出现已实现的功能或不存在的功能会失败。
- 本次核对时发现并修复一处回归：RFC 0055 归档后，"每个已完成 RFC 有演示" 与 "agent skill 有对应行" 两条检查变红。0055 是依赖升级、没有面向用户的行为，已和 0034、0044 一样列入非演示 RFC（提交 `2384484`）。
- 变异检查：把 `rfc-validation.spec.ts` 中全部 `RFC-0002` 改名后，`coverage.spec.ts` 报 `0002 (P0)` 缺 E2E，矩阵证据检查同时失败；恢复后 8 条全部通过。第一次变异只改了每行第一个标题，仍有其它 `RFC-0002` 标题，没有构成变异，已重做。
- 连续通过：并行配置下共 13 次完整运行，2 次各有 1 个失败（见"未解决"）；最后一次失败之后连续 8 次全部 50 通过，其中 4 次用 14 个 worker 加压。
- CI：`.github/workflows/pull-request.yml` 的 `e2e` 任务运行 `pnpm test:e2e`，重试 2 次、单 worker。
- 未解决：上述 2 次失败都是 `RFC-0007 keeps selection first and verifies checkbox selection behavior` 在 Shift 点击范围选择后只选中 1 行（期望 3 行）。单独重复该用例 30 次、14 个 worker 加压 4 次均不复现；读 `Grid.wsx` 行点击处理（`lastSelectedRowId` 实时读取）也没发现竞态，根因未查明，CI 的重试会掩盖它。若再出现，需要保留 trace 追查，不要加固定等待。
