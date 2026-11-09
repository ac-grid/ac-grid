# RFC 0049: 未开键盘导航时 Enter 触发编辑仍生效

**Status:** Implemented

## Summary

`editTrigger` 为 `"enter"` 或 `"both"` 时，单元格获得焦点后按 Enter 应进入编辑，与是否开启 `enableKeyboardNavigation` 无关。当前 `handleGridKeyDown` 在未开键盘导航时直接返回，Enter 触发被静默忽略。

## Problem

提交 `93f8cb3` 删除了单元格 `onKeyDown` 中的 Enter 触发，改为只在 `handleGridKeyDown` 统一处理；而 `handleGridKeyDown` 在 `_enableKeyboardNavigation` 为 false 时直接返回。结果：未开启键盘导航时，显式配置的 `editTrigger: "enter"` 失效。`editing.ts` 的类型注释没有写这个前提。已有红用例：`accessibility.test.ts` 的 "moves focus between cells with arrow keys and returns focus after canceling edit"，它的期望（`editTrigger: "enter"` 下 Enter 开编辑）是正确行为，测试保持不变。

## Goals

- 未开键盘导航时，`editTrigger` 为 `"enter"` 或 `"both"`，在聚焦单元格上按 Enter 进入编辑。
- 开启键盘导航时行为不变，Enter 只触发一次编辑，不重复处理。
- `editTrigger` 为 `"doubleClick"` 时，Enter 不进入编辑。

## Non-goals

- 不改 `editTrigger` 的默认值（保持 `"doubleClick"`）。
- 不改保存、取消、Tab、方向键逻辑。
- 不改键盘导航开启时的统一处理路径。

## Design

在 `packages/core/src/components/Grid.wsx` 单元格 `onKeyDown` 中，仅当 `!this._enableKeyboardNavigation` 时处理 Enter：满足 `supportsEnterTrigger(editTrigger)`、按键为 Enter、未处于编辑中、事件目标是单元格自身时，`preventDefault`、记录 `focusedCell` 并调用已有的 `handleStartEdit`。开启键盘导航时由 `handleGridKeyDown` 处理，两条路径互斥。预期只改这一个文件。

## Acceptance

测试必须验证正确行为，不能为了通过而迁就实现：

- `accessibility.test.ts` 的上述用例由红变绿，不修改该测试。
- 新增行为用例（断言可观察结果：编辑器出现、`onEditStart` 调用次数、输入框聚焦与原值，而不是内部调用）：
  - 未开键盘导航且 `editTrigger: "both"`：Enter 进入编辑。
  - 未开键盘导航且 `editTrigger: "doubleClick"`：Enter 不进入编辑。
  - 开启键盘导航且 `editTrigger: "both"`：Enter 只触发一次 `onEditStart`。
- 突变检查：临时撤掉 `Grid.wsx` 的修复，上述前两类用例中"Enter 进入编辑"的用例必须失败；恢复后通过。结果写入交付说明。
- `packages/core` 全量单测通过。
- `demos/react` 的 e2e（排除已知失效的 `coverage.spec.ts`）通过。
