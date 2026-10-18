# RFC 0041: Pinned column theme and horizontal scroll demo (child of 0039)

**Status:** Draft

**Parent:** [0039](0039-demo-defects-p1.md)

**Related:** [0008](./completed/0008-column-pinning.md), [0016](./0016-theme-system.md)

## Summary

固定列在暗色主题下渲染成白底浅字，几乎看不清；RFC-0008 的 demo 列总宽小于容器，没有横向滚动，所以"固定列保持不动、其余列滚动"无法验证。issue #36 说"没法横向滚动"，实际是这两个问题叠在一起。

## Problem

浏览器里复现的结果（demo `?rfc=0008`，视口 1280 宽）：

- 列宽合计约 910px，容器约 1134px，没有任何元素溢出，因此没有横向滚动条。这是 demo 配置问题，不是核心缺陷。
- 固定列的单元格和表头是白底，文字颜色来自暗色主题，对比度很差。

根因（已在源码确认）：`Grid.css` 用 `var(--ac-grid-bg-header-pinned, #f3f4f6)` 和 `var(--ac-grid-bg-cell-pinned, #fafbfc)` 给固定列上色，只有浅色回退值。`packages/theme-base` 和 `packages/theme-default` 的源码里没有定义这两个变量，所以任何主题下都落到浅色回退。

## Goals

- 每个内置主题定义 `--ac-grid-bg-header-pinned` 和 `--ac-grid-bg-cell-pinned`，固定列背景与相邻列协调、文字可读。
- RFC-0008 demo 的内容宽度大于容器，可以真实横向滚动。
- 横向滚动时固定列保持位置，非固定列移动。

## Non-goals

- 不改变固定列的 API 和行为。
- 不新增主题，只补变量。
- 不处理 issue #34 的纵向滚动。

## Design

- `packages/theme-base`、`packages/theme-default`：给 light、dark、ocean、forest、sunset、bamboo、violet 补两个变量，取值基于各主题已有的表头和单元格背景。
- `Grid.css`：保留变量并保留浅色回退，不改选择器。
- `demos/react/src/rfcValidationDemos.ts`：0008 的列加宽或增加列，使总宽明显超过容器（建议超过 1.5 倍）。
- `demos/react/e2e`：新增 RFC-0008 用例。

## Acceptance

- E2E：`?rfc=0008` 的滚动容器 `scrollWidth` 大于 `clientWidth`。
- E2E：把容器横向滚动到最右后，固定列的屏幕位置与滚动前一致，某个非固定列的位置发生变化。
- E2E：在暗色主题下，固定单元格背景色与相邻非固定单元格背景色的亮度差在合理范围，且文字与背景的对比度不低于 4.5:1。
- 变异检查：从暗色主题删掉任一固定列变量，对比度用例必须失败，恢复后通过。
- 核心或主题单元测试：每个内置主题都定义这两个变量。
- 完整 e2e 并行配置下连续三次通过，覆盖率门槛不降。
