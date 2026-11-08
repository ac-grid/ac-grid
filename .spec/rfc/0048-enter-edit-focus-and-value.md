# RFC 0048: Enter 进入编辑时输入框聚焦并显示原值

**Status:** Approved

## Summary

单元格选中后按 Enter 进入编辑，`wsx-ac-cell-editor` 内的 `input` 必须获得焦点，并显示该单元格的原始值。当前行为（用户报告）：Enter 进入编辑后焦点不在输入框，且原值未显示。本 RFC 先用失败测试复现并确认根因，再做最小修复。

## Problem

Enter 路径：`Grid.wsx` `handleGridKeyDown` → `startEdit(rowId, columnId)` → `renderCellEditor` → `CellEditor.onConnected`。

两个怀疑点（未复现前仅为假设）：

1. 焦点：`CellEditor.onConnected` 在 `requestAnimationFrame` 里聚焦 `input`；Grid 单元格带 `data-wsx-key`，WSX 重渲染后恢复单元格焦点，且 `onFocus` 会改 `focusedCell`，可能抢回焦点或早于编辑器渲染。
2. 原值：`CellEditor` 无 `attributeChangedCallback`；`onConnected` 中 `el.value ?? this._value` 读取的是 getter（初值 `""`），`??` 不会回退，若 `value` 以 attribute 传入则输入框为空。

## Goals

- Enter 进入编辑后，编辑器内 `input` 是当前聚焦元素。
- 该 `input.value` 等于单元格原始值（text、number、date 三种内置类型）。
- 双击触发路径行为不回退。

## Non-goals

- 不改编辑保存、取消、校验逻辑。
- 不改自定义编辑器（`columnDef.editor` 为函数）。
- 不改 `editTrigger` 配置语义。

## Design

1. 在 `packages/core/test/editing.test.ts` 增加失败用例：Enter 触发编辑，断言焦点与原值。
2. 用该用例确认根因后，做最小修复。预期只改 `packages/core/src/components/CellEditor.wsx`（属性与聚焦时序）；若根因在重渲染焦点恢复，则最小改动 `Grid.wsx`。
3. 保持 `packages/core` 现有覆盖率要求。

## Acceptance

- 新增测试在修复前失败，修复后通过。
- `packages/core` 全量单测通过，覆盖率不低于修复前。
- 真实浏览器手工验证：选中单元格按 Enter，光标在输入框内且显示原值。
