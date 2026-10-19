# RFC 0038: RFC-0005 虚拟滚动验证计划

**Status:** Approved

**Related:** [0005](./completed/0005-virtual-scrolling.md), [0033](./0033-e2e-test-infrastructure.md), [0036](./0036-demo-quality-remediation.md)

## Summary

RFC-0005 的虚拟滚动已实现，但验证只覆盖"渲染的行数远小于数据量"。RFC-0005 自己声明的性能目标（10K 行首屏、滚动帧率、内存）和滚动后行内容是否正确，都没有自动化检查。本 RFC 把原先散落的 `.spec/test-plan.md`（一份过期的清单）改写为可执行的验证计划：先盘点已有测试，再补齐缺口，每个缺口给出可测量的断言和阈值来源。

## Problem

原 `test-plan.md` 不能作为依据，已核对仓库发现：

| 原文说法 | 实际情况 |
| :--- | :--- |
| 列出 `VirtualizedRow.wsx`、`VirtualizedColumn.wsx`、`examples/virtual-scroll-example.tsx` 为"已创建" | 三个文件都不存在 |
| "单元测试 / 集成测试 / E2E 待创建" | 已有 `virtual-scrolling.test.ts`、`virtualizer.test.ts`、`virtual-scrolling-integration.test.ts` 和 `demos/react/e2e/virtual-scrolling.spec.ts` |
| 性能表写"✅ 预估达成" | 没有任何测量，是臆测，不是结果 |
| 示例测试里 `scrollToRow(10, 50, 50)` 等 | 当前签名是 `scrollToRow(rowIndex, rowHeight)`，示例不能运行 |
| 用 JSDOM 测滚动与 FPS | JSDOM 没有布局和渲染，测不出帧率 |

已有 E2E 的两个用例只断言 DOM 行数小于数据行数。因此下面这些回归不会被发现：滚动后渲染的是错误的行、滚动后窗口不动、窗口缩放后位置错乱。[RFC-0036](./0036-demo-quality-remediation.md) 记录的 issue #34（滚动条无法拖动）在 demo 里复现不了：`scrollTop` 改变后渲染窗口会跟着变，原生滚动条的拖动本身无法被 Playwright 驱动。

## Goals

1. 删除过期文档，其中真实有价值的内容（性能目标、测试分层）并入本 RFC。
2. 补齐浏览器内可断言的缺口：滚动后窗口内容正确、窗口缩放后保持正确。
3. 为 RFC-0005 的性能目标建立可重复的基准，并先测量再定阈值。

## Non-goals

- 不修改虚拟滚动实现；如基准暴露性能问题，另开 RFC 修复。
- 不驱动原生滚动条拖动（Playwright 不支持）；issue #34 用滚轮和 `scrollTop` 的断言覆盖，并在 issue 中说明。
- 不做 50K、100K 行基准；RFC-0005 把它列为后续工作。
- 不引入 JSDOM 来测帧率。

## Design

**P0：浏览器内正确性（`demos/react/e2e/virtual-scrolling.spec.ts`）**

- 滚轮滚动到中段后，断言首个渲染行的内容等于数据集中对应索引的行（不只是行数）。
- 滚到底，断言最后一行存在；滚回顶部，断言第一行存在。
- 视口高度改变后，断言渲染窗口仍覆盖可视区域，且无空白区。
- 每个用例做变异检查：故意改坏窗口计算，确认用例失败，再恢复。

**P1：性能基准（独立的 Playwright 项目或标签，不进默认 CI 门禁）**

测量值写入报告，不在测量前写死阈值。

| 指标 | 度量方式 | 参考目标（来自 RFC-0005 与原计划，先测后定） |
| :--- | :--- | :--- |
| 10K 行首屏时间 | 页面导航到首个 `.grid-row` 出现，取多次中位数 | 小于 200ms |
| 滚动帧间隔 | 滚动期间用 `requestAnimationFrame` 记录帧间隔，统计超过 50ms 的长帧占比 | 长帧占比接近 0 |
| 内存增量 | Chromium `performance.memory.usedJSHeapSize` 前后差 | 小于 50MB |

阈值在首次测量后写回本 RFC，并作为回归门槛；只升不降，沿用 RFC-0036 对覆盖率门槛的约定。

**P2：清理**

- 删除 `.spec/rfc/completed/test-plan.md`（不是 RFC，却放在 RFC 归档目录里）。

**涉及文件**：`demos/react/e2e/virtual-scrolling.spec.ts`、`demos/react/playwright.config.ts`（仅在新增基准项目时）、`.spec/rfc/completed/test-plan.md`（删除）。

## Acceptance

- `test-plan.md` 在仓库中不再存在，`specify validate` 与 `sync-check` 对本 RFC 通过。
- P0 的三类断言存在，且对窗口计算做变异后至少一个用例失败。
- P1 基准能在本机运行并输出三项指标；首次实测值和采用的阈值记录在本 RFC 中。
- 全套 e2e 在并行配置下连续三次通过。
- 明确记录：issue #34 的原生滚动条拖动不在自动化范围内。
