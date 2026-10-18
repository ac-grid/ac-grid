# RFC 0040: Selection column order (child of 0039)

**Status:** Draft

**Parent:** [0039](0039-demo-defects-p1.md)

**Related:** [0007](./completed/0007-row-selection.md)

## Summary

启用复选框选择时，选择列应当出现在最左侧。目前在 RFC-0007 的 demo 里它出现在最右侧，且复选框与行文字没有垂直对齐，用户很难发现可以勾选，issue #35 因此被描述为"什么都选不了"。

## Problem

浏览器里复现的结果（demo `?rfc=0007`）：

- 表头顺序是 First Name、Last Name、Age、Status，最后才是选择列。
- 点击勾选框可以选中行，所以选择功能本身能用，问题是位置和对齐。
- 点击单元格不会选中行。RFC-0007 只要求复选框和 Shift 范围选择，所以这不是缺陷，不在本 RFC 范围。

根因（已在源码确认）：`Grid.wsx` 的 `columns` setter 用用户列生成 `columnOrder`，其中没有 `selection`；而选择列在构建 table 列时才被放到数组最前面。TanStack 对不在 `columnOrder` 里的列追加到末尾，所以选择列落到最右。RFC-0008 的 demo 里它在最左，是因为它被固定在左侧，绕过了列顺序。

复选框与文字不对齐的根因尚未定位，实施时先查再改。

## Goals

- 启用复选框选择时，选择列在没有固定列的情况下排在第一位。
- 复选框与行文字垂直居中对齐。
- 用户通过拖拽改变列顺序、或显式给出 `columnOrder` 时，行为保持不变。

## Non-goals

- 不实现点击单元格选行。
- 不改变选择列在已固定到左侧时的行为。
- 不改动选择状态、Shift 范围选择的逻辑。

## Design

- `packages/core/src/components/Grid.wsx`：生成或使用 `columnOrder` 时，若选择列启用且不在顺序中，把 `selection` 放到最前。
- 样式：定位复选框垂直错位的来源并修正（预计在选择复选框组件或 Grid.css）。
- `demos/react/e2e`：新增 RFC-0007 用例，见下方验收。

## Acceptance

- E2E：`?rfc=0007` 的第一个表头是选择列，第一个数据单元格含复选框。
- E2E：勾选单行后该行为选中状态；先勾选一行，再 Shift 点击另一行，范围内的行都被选中；表头复选框全选再取消。断言选中状态，不只是点击没报错。
- E2E：复选框中心与同一行文字中心的垂直偏差不超过 2px。
- 变异检查：去掉 `columnOrder` 里放置 `selection` 的逻辑，第一列用例必须失败，恢复后通过。
- 核心单元测试覆盖：用户列顺序加选择列时，`selection` 在最前；拖拽改序后不被打乱。
- 完整 e2e 并行配置下连续三次通过，覆盖率门槛不降。
