# RFC-0036: Demo 与 E2E 质量整改 (Demo & E2E Quality Remediation)

**状态**: 📝 草稿  
**版本**: 0.1.0  
**作者**: Albert Li  
**日期**: 2026-10-18  
**关联 Issue**: [#32](https://github.com/ac-grid/ac-grid/issues/32) – [#40](https://github.com/ac-grid/ac-grid/issues/40)  
**相关 RFC**: [0033](./0033-e2e-test-infrastructure.md), [0034](./0034-rfc-demo-acceptance-matrix.md)

## 概述

验收报告指出多个已完成 RFC 的 demo "完全不能用"，而 E2E 全绿。本 RFC 记录在最新 `origin/main`（`1bb835b`）上用真实鼠标、默认视口复现的结果，给出根因、逐 issue 处置和整改顺序。

## 问题陈述

E2E 通过不等于功能可用。测试存在三类系统性缺陷：

1. **断言过弱**：多数用例只验证元素存在或内部状态（`grid.table`、`getSelectedRowIds()`），不验证用户可见结果。RFC-0016 只断言某个 CSS 变量"不为空"，因此主题切换完全失效时仍然通过。
2. **场景不真实**：RFC-0008 的 demo 在 1280px 视口下没有横向溢出，只有测试把视口缩到 400px 才能滚动；用户打开页面时无从验证。
3. **竞态未处理**：测试在首个 `.grid-row` 可见后立即操作，而 grid 此时尚未完成初始化。

## 复现结果（最新 main，真实鼠标，1280×800）

| Issue | 结论 | 证据 |
| :--- | :--- | :--- |
| #32 RFC-0002 排序 | **未复现** | 点击表头后首行由 `Erik` 变为 `Abbey`，顺序正确 |
| #33 RFC-0003 筛选图标 | **未复现** | 悬停后点击图标，`wsx-ac-filter-menu` 可见 |
| #34 RFC-0005 滚动条 | **未验证** | `.grid-body` 可滚动（`scrollHeight` 726 > `clientHeight` 405）；无头 Chromium 无法拖拽原生滚动条，需有头验证 |
| #35 RFC-0007 选择 | **已确认（布局缺陷）** | 选择列渲染在 Status 之后而非首列；复选框相对行顶部对齐而非垂直居中；单击行不会选中 |
| #36 RFC-0008 横向滚动 | **已确认（demo 缺陷）** | 1280px 下 `scrollWidth` == `clientWidth`（1134），无可滚动内容 |
| #37 RFC-0009 编辑器消失 | **已确认（初始化竞态）** | 首屏后立即双击，12 次中 2 次不出现编辑器；等待 1.5s 后 12 次全部正常 |
| #38 RFC-0019 主题 | **已确认（根因）** | 在 demo 中 `grid.applyTheme("light" \| "dark" \| "ocean")` 全部抛出 `Theme "…" not found`；demo 外壳也不响应 `prefers-color-scheme`；0019 页面没有任何控件可触发空遮罩、整行组件、加载遮罩 |
| #39 RFC-0030 公式 | **已确认（demo 缺陷）** | Grid 显示的是姓名和年龄；公式在 grid 之外由 React 文本行计算，grid 本身从不求值公式 |
| #40 demo 覆盖 | **已确认** | 已完成 RFC 中 0011、0023 无 demo；14 个草稿 RFC 无实现 |

#32、#33 在本地旧工作区（落后 `origin/main` 12 个提交）上报告，疑似已被上游修复；需要用户在最新代码上确认后关闭。

## 根因

1. **主题注册表被打包两份**（#38）：`packages/core/vite.config.ts` 未将 `@ac-grid/theme-base` 列为 external，core 内嵌了自己的 `ThemeManager` 单例。`@ac-grid/theme-default` 把主题注册进 npm 包里的那一份，Grid 查询的是 core 内嵌的空注册表。影响 RFC-0011、0016、0019 的所有主题行为。**已在分支 `fix/rfc-demo-e2e-skill` 修复**（一行配置，打包产物中 `class ThemeManager` 由 12 处匹配降为 0）。
2. **RFC-0023 剪贴板是死代码**：`handleClipboardCopy` / `handleClipboardPaste` 从未绑定事件，`activeClipboardCell` 从未赋值，Ctrl+C/V 无任何效果，而 RFC 标为 Implemented。另外 Chromium 在没有文字选区时不触发 `copy` 事件，仅绑 `copy` 事件也不够。**已在分支修复**：绑定 `copy`、`paste`、`keydown`，点击时记录激活单元格并聚焦。
3. **初始化竞态**（#37 及多个偶发失败）：首屏渲染早于初始化完成，早到的输入被后续渲染吞掉。同一原因造成上游 E2E 偶发失败：串行 9 次完整运行中 6 次出现失败，RFC-0002 拖拽、RFC-0006、RFC-0009、RFC-0012 轮流失败，单次 1–3 个；并行运行时 RFC-0004 也会失败。
4. **E2E 入口缺依赖构建**：全新检出后 `pnpm test:e2e` 因 `packages/*/dist` 不存在而 19/20 用例失败，且不提示原因。
5. **覆盖守卫自我循环**：旧守卫只检查 `RFC_VALIDATION_ORDER` 里已登记的 RFC，没有 demo 的 RFC 永远不会被发现。**已在分支修复**：改为扫描 `.spec/rfc/completed/`，并要求 `skills/ac-grid` 有对应条目。

## 整改方案

按顺序执行，每步独立可验证。

### P0 — 让现有功能可靠

1. **修复初始化竞态**：Grid 在初始化完成前不对外表现为可交互；完成后派发 `grid-ready` 事件并设置 `data-ready="true"`。不允许在初始化未完成时吞输入。验证：RFC-0009 立即双击 100 次，编辑器出现次数为 100。
2. **E2E 统一等待就绪**：所有用例通过共享 helper 等待 `wsx-ac-grid[data-ready="true"]`，禁止 `waitForTimeout`。
3. **E2E 入口先构建依赖**：`test:e2e` 前置 `turbo run build --filter='./packages/*'`；浏览器缺失时给出安装提示。

### P1 — 修复 demo 缺陷

4. **RFC-0007**：选择列固定为首列、复选框垂直居中；点击行体选中该行（可配置）。
5. **RFC-0008**：demo 列总宽超过 1280px，默认视口即可横向滚动；测试不再依赖缩小视口。
6. **RFC-0019**：页面提供三个控件：触发空数据遮罩、切换整行组件、切换加载遮罩；遮罩背景和文字使用主题变量。
7. **RFC-0030**：grid 内增加公式列，单元格值来自 `FormulaEngine`；编辑 A1 后依赖单元格在 grid 内更新。
8. **demo 外壳响应 `prefers-color-scheme`**，并提供手动切换。
9. **RFC-0005**：在有头 Chromium 中验证滚动条拖拽；如无法自动化，补充滚轮和 `scrollToRow` 之外的人工验收步骤并写入矩阵。

### P2 — 测试质量

10. **断言可见结果**：用 `getComputedStyle`、DOM 顺序、复制出的文本替代内部状态。RFC-0016 改为断言切换主题后单元格背景色实际变化。
11. **真实输入**：使用 `page.mouse` 与 `page.keyboard`，禁止 `dispatchEvent` 和 `force: true`。
12. **抗退化检查**：每个用例至少有一次"故意破坏后应失败"的验证，在 PR 描述中记录。
13. **稳定性门槛**：CI 对完整套件重复运行 10 次，全部通过才算达标。

### P3 — 覆盖

14. 14 个草稿 RFC 逐个实现；每个 RFC 随实现一并交付 demo 页、E2E 用例、`skills/ac-grid/references/features.md` 条目。覆盖守卫已强制这三项。

## 测试策略

- 守卫：`demos/react/e2e/coverage.spec.ts` 扫描 `.spec/rfc/completed/`，要求每个已完成 RFC 有 demo、有标题含 `RFC-<id>` 的 E2E、在 skill 中有条目。
- 稳定性：`pnpm exec playwright test --repeat-each=10`，不允许任何失败。
- 手动验收：每个 demo 以默认视口打开，不依赖测试专用设置。

## 验收标准

- [ ] #35、#36、#37、#38、#39 在最新 `main` 上由用户 QA 确认修复。
- [ ] #32、#33、#34 在最新 `main` 上由用户确认；无法复现则关闭并注明。
- [ ] 完整 E2E 连续运行 10 次零失败。
- [ ] 全新检出后 `pnpm install && pnpm test:e2e` 无需手动构建即可运行。
- [ ] 覆盖守卫三项全绿。

## 开放问题

- #34 滚动条拖拽无法在无头模式自动化，是否接受有头 CI 或人工验收？
- RFC-0007 点击行体是否应默认选中，还是仅复选框选中？
- 是否保留 demo 的紫色外壳主题，还是默认跟随系统？
