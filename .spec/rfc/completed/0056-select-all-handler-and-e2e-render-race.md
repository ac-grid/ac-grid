# RFC 0056: Select-all handler error and RFC-0007 E2E render race

**Status:** Implemented

## Summary

E2E `RFC-0007` 在并行运行时偶发失败（Shift 点击没有选中范围）。逐层取证后发现根因在产品里：选择复选框相关的四处缺陷，其中一处让每次勾选后选中行都不更新，并在下一次点击中途冲出重绘、丢掉 `click`。本 RFC 修复这四处，并让 E2E 等待可观察的 DOM 结果。

## Problem

证据来自 250 次并行（16 个 worker）复现，失败约 1–2%，并用 `pointerdown`/`mouseup`/`click` 事件和 `MutationObserver` 逐层确认。

**1. 勾选后重绘被推迟，选中行不更新，随后丢点击（RFC-0007 偶发失败的根因）。** `@wsxjs/wsx-core` 的 `scheduleRerender()` 在活动元素是 `input` 且没有 `data-wsx-force-render` 时，把重绘推迟到焦点离开。点击行复选框后焦点停在 `<input type=checkbox>`，Grid 重绘被推迟：选中行的 `data-selected`/`aria-selected` 一直是 `false`（原有缺陷，HEAD 上同样存在）。下一次点击一按下焦点离开，积压的重绘立刻冲出并替换整个 `div.ac-grid`，按下的单元格在 `mouseup` 时已脱离 DOM（`downConnected: false`），浏览器不派发 `click`。

**2. 全选处理器抛错。** 表头把 TanStack 的 `getToggleAllRowsSelectedHandler()`（期望事件，读 `e.target.checked`）作为 `onChange`，而 `SelectionCheckbox` 以布尔值调用，`e.target` 为 `undefined`，每次点击抛 `Cannot read properties of undefined (reading 'checked')`。

**3. 重绘后复选框显示未勾选。** wsx `h()` 把 `true` 的布尔 prop 设为 attribute（`false` 直接跳过），`SelectionCheckbox` 只读 property，所以 Grid 重绘后新建的复选框全是未勾选，与已选中的行不一致。用编程方式 `selectRow()` 同样复现，不依赖焦点。

**4. 强制重绘会让焦点丢失。** 修复 1 后，Grid 立刻重绘并替换复选框，焦点掉到 `BODY`，键盘用户勾选后要重新 Tab。wsx 只按 `data-wsx-key` 恢复焦点，而所有行复选框的自动 key 相同（`SelectionCheckbox-input-checkbox-1`），恢复不到原来的那个。

## Goals

- 勾选后选中行立即更新，焦点留在同一个复选框，键盘操作连续。
- 重绘后的复选框与行的选中状态一致。
- 表头全选不再抛错。
- `RFC-0007` 在并行高并发下稳定，且 E2E 能发现全选抛未捕获错误。

## Non-goals

- 修改 `@wsxjs/wsx-core` 的重绘策略（第三方依赖：推迟重绘、整根替换是框架行为，另议）。
- 其他输入控件（过滤框、单元格编辑器）：它们依赖“聚焦时推迟重绘”来保住输入，不改。
- 给其他 E2E 加防护；固定等待、重试、降低断言。

## Design

### Task 1: SelectionCheckbox（`packages/core/src/components/SelectionCheckbox.wsx`）

- `input` 加 `data-wsx-force-render`：聚焦时 Grid 也立即重绘。
- `input` 加 `data-wsx-key`：行为 `selection-<rowId>`（取最近的 `[data-row-id]`），表头为 `selection-all`，让 wsx 把焦点恢复到同一个复选框。
- `static get observedAttributes` 返回 `checked`、`indeterminate`，`onAttributeChanged` 写入状态。元素在连接前就设置 attribute，此时不会调度重绘，首次渲染即正确，不会触发会丢焦点的第二次重绘。必须用静态 getter：静态字段在 `@autoRegister` 调用 `customElements.define` 时尚未初始化，浏览器读到空列表。

### Task 2: 全选处理器（`packages/core/src/components/Grid.wsx`）

表头 `onChange` 与 `ref` 里的 `.onChange` 改为 `(checked: boolean) => table.toggleAllRowsSelected(checked)`，与行复选框一致。

### Task 3: 单元测试（新增 `packages/core/test/selection-checkbox-render.test.ts`）

覆盖三种行为：重绘后复选框已勾选；聚焦复选框时选择立即反映且焦点留在同一复选框（用假定时器推进帧，避免被其他渲染路径掩盖）；全选与取消不抛错。

### Task 4: E2E（`demos/react/e2e/rfc-validation.spec.ts` 的 `RFC-0007` 用例）

每次真实点击前先等对应行 `data-selected` 反映选中；监听 `pageerror` 并在结束时断言为空。

## Acceptance

- 变异检查：分别撤销四处修复，对应单元测试必须变红（无 `observedAttributes`、无 `data-wsx-force-render`、旧全选处理器、无唯一 `data-wsx-key`）。
- 并行 16 个 worker、重复 250 次的 `RFC-0007` 复现 0 失败；同一复现在修复前有失败。
- 全量 E2E 与 core 单元测试通过；core 覆盖率阈值不降低。
- 浏览器实测：点击行复选框后，该行立即高亮、复选框保持勾选、焦点仍在同一复选框；再按 Tab、空格选中下一行。

## Delivery

实现提交 `a313ac9`，已推送到 `origin/main` 并核对远端。

**证据与复现。** 修复前，`RFC-0007` 用例在并行下的失败：10 个 worker 重复 120 次失败 8 次；16 个 worker 重复 250 次失败 3–6 次（多轮）。逐层取证：失败时组件内部的 `lastSelectedRowId` 正确；Shift 点击只有 `pointerdown`/`mousedown`/`pointerup`/`mouseup`，没有 `click`；`mousedown` 后约 50ms 整个 `div.ac-grid` 被移除重建，`mouseup` 时按下的单元格已脱离 DOM。进一步发现重绘总是紧跟在下一次 `pointerdown` 之后，而不是复选框点击之后；并在不涉及点击的 `selectRow()` 路径上复现“复选框未勾选”。

**修复后结果。**

- 同一并行复现（16 个 worker、重复 250 次）：250/250 通过，日志里 `reading 'checked'` 为 0。
- 全量 E2E：连续 4 次 50/50 通过。
- core 单元测试：54 个文件、568 个测试通过，覆盖率阈值无报错；全量构建 7/7 成功。
- 浏览器实测：点击第 4 行复选框后，该行立即高亮、复选框保持勾选、焦点仍在该复选框；Tab、空格选中第 5 行。

**变异检查。** 单元测试层：无 `observedAttributes`、无 `data-wsx-force-render`、旧全选处理器、无唯一 `data-wsx-key`，各自让对应测试变红，恢复后全绿。E2E 层：旧全选处理器因 `pageerror` 断言变红；无 `data-wsx-force-render` 因行 `data-selected` 一直为 `false` 变红。

**过程中修正的错误。**

- 第一版测试 2 在无 `data-wsx-force-render` 时仍通过：真实定时器下另有渲染路径最终会重绘，掩盖了推迟。改为假定时器推进帧后才有区分力。
- 第一版只加 `data-wsx-force-render`，焦点丢到 `BODY`；加唯一 `data-wsx-key` 后解决。
- 第一版在 `onConnected` 里写状态，引发会丢焦点的第二次重绘；改为 `observedAttributes`。
- `static observedAttributes` 写成静态字段无效（`@autoRegister` 调用 `define` 时字段未初始化），必须是静态 getter。

**未处理的相关风险。** `@wsxjs/wsx-core` 的“聚焦输入时推迟重绘”和“整根替换”是框架行为；过滤框、单元格编辑器仍依赖前者保住输入，其他交互若在重绘窗口内按下，理论上同样可能丢 `click`，需要另行取证。`apps/site` 的 typecheck、lint、test 失败和 Storybook 模板故事导入问题与本 RFC 无关，另处理。
