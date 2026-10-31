# RFC 0046: Unit coverage for components (child of 0043)

**Status:** Approved

**Parent:** [0043](0043-coverage-100-umbrella.md)

## Summary

把 `packages/core/src/components/*.wsx` 的单元覆盖率补到 100%（语句、分支、函数、行）。

## Problem

`.wsx` 组件是单元覆盖率最低的部分：`Dropdown` 约 15%、`DraggableTableHeader` 约 23%、`FilterMenu` 约 25%、`GlobalSearch` 约 26%、`Grid.wsx`（约 3000 行）约 65%。JSDOM 不实现 canvas、布局等，现有测试遇到这些就跳过。

## Goals

- `src/components/*.wsx` 单元覆盖率四项均为 100%。
- 测试断言可观察行为（渲染结果、事件、属性），不依赖内部实现。

## Non-goals

- E2E：见 0045。
- 重构组件以便测试：覆盖中发现需要重构的，另开 RFC。
- 用 `v8 ignore` 或排除文件来凑 100%：不允许。

## Design

1. 按单元报告列出每个组件的未覆盖行，归类为：可直接测、需要给 JSDOM 打桩（canvas、`ResizeObserver`、布局尺寸等）、死代码。
2. 可直接测的补测试；需要打桩的在测试里统一桩（放 `packages/core/test/setup`），不改产品代码；死代码删除（单独提交）。
3. 每个组件完成后，把该文件阈值升到 100。

## Acceptance

- `src/components/*.wsx` 单元覆盖率四项均为 100%，per-file 阈值已写入配置。
- 变异检查：对每个新增测试，撤销对应的组件逻辑，测试必须变红。
- 原有测试全部通过。
