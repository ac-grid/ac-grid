# RFC 0042: Empty and loading overlay theme (child of 0039)

**Status:** Draft

**Parent:** [0039](0039-demo-defects-p1.md)

**Related:** [0019](./completed/0019-custom-components.md), [0016](./0016-theme-system.md)

## Summary

数据为空（无行）时显示的空视图遮罩不跟随主题：在暗色主题下它盖上一层写死的白色半透明背景，整个表格变成灰白，提示文字几乎看不见。这就是 issue #38 的"默认白色、不跟随主题"。注意它说的是空视图，不是全宽行视图。

## Problem

浏览器里复现的结果（demo `?rfc=0019`，把 `grid.data` 置为 `[]` 后，暗色主题）：

- 遮罩元素 `.grid-overlay[data-overlay-type="no-rows"]` 的计算背景是 `rgba(255, 255, 255, 0.72)`。
- 提示文字颜色是主题的浅紫色，叠在浅灰白背景上几乎不可读。
- 表头和表体的颜色都是暗色，只有遮罩是白的，整体不协调。

根因（已在源码确认）：`Grid.css` 的 `.ac-grid .grid-overlay` 把 `background-color` 写死为 `rgba(255, 255, 255, 0.72)`，没有使用主题变量。文字色用了 `--ac-grid-text-secondary`，所以文字随主题而背景不随主题，两者对不上。

加载遮罩（`data-overlay-type="loading"`）与空视图遮罩使用同一个 `.grid-overlay` 样式，同一处写死的背景会同样影响它；本次只复现了空视图，加载遮罩的症状按同一规则推断，需要在验收里实测确认。

当前 demo 的 5 行数据不会触发空视图，所以页面上看不到这个问题，需要一个触发空状态的控件。

## Goals

- 遮罩背景使用主题变量，并给每个内置主题定义，保证文字可读。
- 空视图在 light 与 dark 下都协调，切换主题时遮罩颜色跟着变化。
- RFC-0019 的 demo 能一键进入空状态，并能切换主题。

## Non-goals

- 不改变 `components.noRowsOverlayComponent`、`loadingOverlayComponent` 的 API。
- 不处理全宽行视图（`fullWidthRowComponent`）。它和本问题无关，当前 demo 里也没有；要演示它另开 RFC。
- 不新增主题，只补变量。

## Design

- `Grid.css`：`.grid-overlay` 的背景改为 `var(--ac-grid-bg-overlay, rgba(255, 255, 255, 0.72))`，保留浅色回退，不改选择器。
- `packages/theme-base`、`packages/theme-default`：给 light、dark、ocean、forest、sunset、bamboo、violet 定义 `--ac-grid-bg-overlay`，暗色类主题使用与其表体背景同色系的半透明深色。
- `demos/react/src/rfcValidationDemos.ts` 与页面：0019 增加"清空数据"按钮和明/暗主题切换，用来进入空状态并检验主题。
- `demos/react/e2e`：新增 RFC-0019 用例。

## Acceptance

- E2E：打开 `?rfc=0019`，点击清空，遮罩 `no-rows` 可见，文字为配置的 "No matching rows"。
- E2E：在 dark 主题下，遮罩背景叠加在表体上之后与文字的对比度不低于 4.5:1。
- E2E：在 light 与 dark 之间切换，遮罩的计算背景色发生变化，且切回后恢复。
- E2E：设置 `isLoading` 后，加载遮罩在 dark 下同样满足对比度要求；若实测不满足，本 RFC 的修复同时覆盖它。
- 变异检查：把 `.grid-overlay` 背景改回写死的白色，对比度用例必须失败，恢复后通过。
- 主题单元测试：每个内置主题都定义 `--ac-grid-bg-overlay`。
- 完整 e2e 并行配置下连续三次通过，覆盖率门槛不降。
