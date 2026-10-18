# RFC 0036: Demo and E2E quality remediation

**Status:** Draft

**Issues:** [#32](https://github.com/ac-grid/ac-grid/issues/32)–[#40](https://github.com/ac-grid/ac-grid/issues/40)
**Related:** [0033](./0033-e2e-test-infrastructure.md), [0034](./0034-rfc-demo-acceptance-matrix.md)

## Summary

验收报告指出多个已完成 RFC 的 demo "完全不能用"，而 E2E 全绿。本 RFC 记录在最新 `origin/main`（`1bb835b`）上用真实鼠标、默认视口复现的结果，给出根因、逐 issue 处置和整改顺序。核心结论：两个真实产品缺陷（主题注册表被打包两份、RFC-0023 剪贴板从未接线）已在分支修复；其余问题是 demo 不真实、初始化竞态和 E2E 断言过弱。

## Problem

E2E 通过不等于功能可用。测试存在三类系统性缺陷：

1. **断言过弱**：多数用例只验证元素存在或内部状态（`grid.table`、`getSelectedRowIds()`），不验证用户可见结果。RFC-0016 只断言某个 CSS 变量"不为空"，主题切换完全失效时仍然通过。
2. **场景不真实**：RFC-0008 的 demo 在 1280px 视口下没有横向溢出，只有测试把视口缩到 400px 才能滚动。
3. **竞态未处理**：测试在首个 `.grid-row` 可见后立即操作，而此时 grid 即将被替换（见根因 3）。

复现结果（最新 main，真实鼠标，1280×800）：

| Issue | 结论 | 证据 |
| :--- | :--- | :--- |
| #32 RFC-0002 排序 | 未复现 | 点击表头后首行由 `Erik` 变为 `Abbey`，顺序正确 |
| #33 RFC-0003 筛选图标 | 未复现 | 悬停后点击图标，`wsx-ac-filter-menu` 可见 |
| #34 RFC-0005 滚动条 | 未验证 | `.grid-body` 可滚动（726 > 405）；无头 Chromium 无法拖拽原生滚动条 |
| #35 RFC-0007 选择 | 已确认（布局） | 选择列渲染在 Status 之后而非首列；复选框未垂直居中；单击行不会选中 |
| #36 RFC-0008 横向滚动 | 已确认（demo） | 1280px 下 `scrollWidth` == `clientWidth`（1134） |
| #37 RFC-0009 编辑器消失 | 未复现 | 等待页面稳定后双击，12 次编辑器均出现并保留；报告很可能来自带有未提交实验改动的旧本地工作区。首屏后立即双击 12 次中 2 次无编辑器，属于测试竞态（根因 3），人手无法在该窗口内操作 |
| #38 RFC-0019 主题 | 已确认（根因） | `grid.applyTheme("light" \| "dark" \| "ocean")` 全部抛出 `Theme "…" not found` |
| #39 RFC-0030 公式 | 已确认（demo） | Grid 显示姓名和年龄；公式在 grid 之外的 React 文本行计算 |
| #40 demo 覆盖 | 已确认 | 0011、0023 无 demo；14 个草稿 RFC 无实现 |

#32、#33 在落后 `origin/main` 12 个提交的本地旧工作区上报告，疑似已被上游修复，需用户在最新代码上确认。

根因：

1. **主题注册表被打包两份**：`packages/core/vite.config.ts` 未将 `@ac-grid/theme-base` 设为 external，core 内嵌自己的 `ThemeManager` 单例，`@ac-grid/theme-default` 注册的主题对 Grid 不可见。已在分支修复。
2. **RFC-0023 剪贴板是死代码**：处理函数从未绑定事件，`activeClipboardCell` 从未赋值；Chromium 在无文字选区时也不触发 `copy`。已在分支修复，改为绑定 `copy`、`paste`、`keydown`。
3. **测试竞态**：demo 在 `React.StrictMode` 下挂载、销毁、再挂载 grid，三者发生在同一毫秒内（DOM 变更追踪：约 1164ms 出现两次 `wsx-ac-grid` 挂载，之后约 100ms 内仍有渲染）。测试在第一个 grid 的首行出现时即操作，该 grid 随即被替换，点击或双击的前后两半落在不同节点上。串行 9 次完整 E2E 运行中 6 次出现失败，RFC-0002 拖拽、0006、0009、0012 轮流失败。这是 dev 模式的测试问题，不是用户可见的产品缺陷。
4. **E2E 入口缺依赖构建**：全新检出后 `pnpm test:e2e` 因 `packages/*/dist` 不存在而 19/20 用例失败，且无提示。
5. **覆盖守卫自我循环**：旧守卫只检查已登记的 RFC。已在分支修复，改为扫描 `.spec/rfc/completed/`。

## Goals

让每个已完成 RFC 的 demo 在默认视口下可由用户直接验证，E2E 失败即代表用户可见功能失败，且套件稳定。具体：

- 消除初始化竞态，使 E2E 对完整套件连续运行 10 次零失败。
- 修复 #35、#36、#38、#39 对应的 demo 缺陷。
- 断言可见结果（计算样式、DOM 顺序、复制文本），使用真实鼠标和键盘输入。
- 覆盖守卫同时要求 demo、E2E、`skills/ac-grid` 条目。

## Non-goals

- 不实现 14 个草稿 RFC（0013、0014、0017、0018、0020、0021、0024–0029、0031、0032）；它们各自走自己的 RFC，随实现一并交付 demo、E2E 和 skill 条目。
- 不重做 demo 的视觉设计。

## Design

按顺序执行，每步独立可验证。

**P0 可靠性**

1. E2E 共享 helper `gridReady(page)`：等待首行出现，并等 DOM 在 200ms 内无变更后再继续，同时覆盖 StrictMode 重挂载与 grid 的后续渲染。不改 core：grid 自带的 `data-ready` 会同样设在即将被销毁的第一个 grid 上，无法解决问题。验证：RFC-0009 首屏后立即双击 100 次，编辑器出现 100 次。
2. 所有用例用该 helper 代替“首行可见”，禁止 `waitForTimeout`。
3. `test:e2e` 前置 `turbo run build --filter='./packages/*'`，浏览器缺失时提示安装。

**P1 demo**

4. RFC-0007：选择列固定为首列，复选框垂直居中，点击行体选中该行。
5. RFC-0008：demo 列总宽超过 1280px，默认视口即可滚动。
6. RFC-0019：提供触发空数据遮罩、整行组件、加载遮罩的控件，遮罩使用主题变量。
7. RFC-0030：grid 内增加由 `FormulaEngine` 求值的公式列。
8. demo 外壳响应 `prefers-color-scheme`，并提供手动切换。
9. RFC-0005：有头 Chromium 验证滚动条拖拽；无法自动化则写入矩阵的人工验收步骤。

**P2 测试质量**

10. 断言可见结果，RFC-0016 改为断言切换主题后单元格背景色变化。
11. 使用 `page.mouse` 与 `page.keyboard`，禁止 `dispatchEvent` 和 `force: true`。
12. 每个用例记录一次"故意破坏后应失败"的验证。
13. CI 对完整套件重复运行 10 次。

## Acceptance

- #35、#36、#37、#38、#39 在最新 `main` 上由用户 QA 确认修复。
- #32、#33、#34 在最新 `main` 上由用户确认；无法复现则关闭并注明。
- 完整 E2E 连续运行 10 次零失败。
- 全新检出后 `pnpm install && pnpm test:e2e` 无需手动构建即可运行。
- 覆盖守卫三项全绿。

开放问题：#34 滚动条拖拽无法在无头模式自动化，接受有头 CI 还是人工验收？RFC-0007 点击行体是否默认选中？
