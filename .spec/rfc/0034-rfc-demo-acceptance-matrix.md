# RFC-0034: 已完成 RFC 演示验收矩阵 (Completed RFC Demo Acceptance Matrix)

**状态**: ✔️ 已完成  
**Status:** Implemented  
**版本**: 0.4.0  
**作者**: Albert Li  
**日期**: 2026-10-11  
**完成日期**: 2026-10-11  
**关联 Issue**: [ACG-120](mention://issue/01a1040d-8350-7ea7-9bd3-0a85f1e1145a)  
**相关 RFC**: [0033](./0033-e2e-test-infrastructure.md), [0035](./0035-rfc-0010-e2e-coverage.md)

## Summary

Establish a binding acceptance matrix between completed RFCs, runnable demo benchmark routes (`demos/react`), and live Playwright E2E test evidence. Registry `done` or code implementation alone is not considered product-complete — this matrix serves as the formal gate for delivery and verification.

## Problem

Across the AC Grid repository, multiple RFCs were moved to `completed/` or marked `done` in the issue registry without formal binding to live interactive demo routes and automated browser tests. Prior to this RFC, regression in browser-rendered Web Components could occur undetected even when unit tests passed. A clear completion gate requires:
1. Every completed capability to be bound to an interactive demo scenario;
2. Core user behaviors to be explicitly enumerated;
3. Reproducible end-to-end (E2E) Playwright browser evidence verifying those behaviors.

## Goals

- Establish the completed-RFC demo acceptance matrix linking RFC ID, title, demo route/hash, required behaviors, and E2E test coverage.
- Formulate the acceptance rules and completion gate criteria: an RFC cannot be considered product-complete without runnable demo integration and browser test evidence.
- Identify current coverage status and explicitly track known gaps (e.g. RFC-0011 advanced theme demo, RFC-0023 clipboard browser wiring).
- Integrate acceptance requirements with CI/CD workflows and the `specify` RFC lifecycle.

## Non-goals

- Implementing full headless server-side row models (SSRM, RFC-0031).
- Out-of-browser mock unit test replacements for real DOM interactions.

## 概述

AC Grid 建立「已完成 RFC 演示验收矩阵」（Demo Acceptance Matrix），将所有已实现/已完成的 RFC 绑定至 `demos/react` 验收台（运行在 `http://127.0.0.1:5173` / `http://127.0.0.1:5174`），定义明确的交互行为与 Playwright 自动化测试证据。

任何在 `ISSUE_REGISTRY.md` 或 `.spec/rfc/completed/` 中标记为完成的功能，必须满足此矩阵的要求，才能视为真正达成产品级完成（Product Complete）。

---

## 演示验收矩阵 (Demo Acceptance Matrix)

| RFC ID | 功能名称 | 演示路由 (`demos/react`) | 关键验收交互 / 必需行为 | 自动化 E2E 证据 | 矩阵状态 |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **0001** | AC Grid 架构 & WC 入口 | `/?rfc=0001` | `<wsx-ac-grid>` Web Component 正确挂载，初始化渲染 10 行基础表格 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0001 mounts typed grid...`) | ✅ 达标 |
| **0002** | 排序功能 | `/?rfc=0002` | 1. 点击 firstName 表头触发升降序排序并重排 DOM<br>2. 鼠标横向滚轮保持 header 与 body scrollLeft 像素对齐<br>3. 真实拖拽表头完成列顺序重排 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0002 sorting`, `RFC-0002 horizontal scroll`, `RFC-0002 reorders columns`) | ✅ 达标 |
| **0003** | 过滤功能 | `/?rfc=0003` | 全局搜索框输入非匹配关键字时，表格行数即时收敛至 0 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0003 filters rows...`) | ✅ 达标 |
| **0004** | 列调整大小 | `/?rfc=0004` | 拖拽表头右边缘 `.resizer` 句柄改变列宽，释放后宽度大于初始值 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0004 changes column width...`) | ✅ 达标 |
| **0005** | 虚拟滚动 | `/?e2e=virtual-scroll` | 100K 级超大数据集渲染时，DOM 节点数维持窗口切片（<50 行），滚动后视口复用 | `demos/react/e2e/virtual-scrolling.spec.ts` (`mounts far fewer DOM rows`, `keeps DOM row window small`) | ✅ 达标 |
| **0006** | 分页功能 | `/?rfc=0006` | 点击分页控件跳转至第 2 页，文本更新为 "Page 2 of 10" 且数据刷新 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0006 changes page...`) | ✅ 达标 |
| **0007** | 行选择 | `/?rfc=0007` | 点击复选框选择单行，`grid.getSelectedRowIds()` 返回准确的选中行 ID | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0007 selects a row...`) | ✅ 达标 |
| **0008** | 列固定 (Pinning) | `/?rfc=0008` | 左右固定列计算对应 sticky 偏移，元素具备 `position: sticky` 样式 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0008 pins configured columns`) | ✅ 达标 |
| **0009** | 单元格编辑 | `/?rfc=0009` | 双击单元格挂载 `<wsx-ac-cell-editor>` 编辑器输入框 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0009 starts editing on cell double click`) | ✅ 达标 |
| **0010** | 行分组与数据聚合 | `/?rfc=0010` | 1. 渲染分组头并计算 count/avg/sum 聚合值<br>2. 点击「全部折叠」收起至 3 个分组头<br>3. 点击单行展开及「全部展开」恢复全部叶子行 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0010 groups rows...`) | ✅ 达标 |
| **0015** | 国际化 (i18n) | `/?rfc=0015` | 配置 zh-CN 语言包时，分页组件展示「显示第 1 至 10 条」中文本地化文案 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0015 renders pagination text from the zh-CN language pack`) | ✅ 达标 |
| **0016** | 主题系统基础 | `/?rfc=0016` | Web Component 读取 CSS 自定义属性 `--ac-grid-bg-cell` 并在 DOM 中生效 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0016 applies theme variables...`) | ✅ 达标 |
| **0019** | 自定义组件 | `/?rfc=0019` | 挂载用户自定义 header 渲染组件并显示 "Custom Name" | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0019 renders custom header component`) | ✅ 达标 |
| **0030** | 单元格公式引擎 | `/?rfc=0030` | 公式求值：SUM 计算、AVG 计算、#CYCLE! 循环依赖检测，以及依赖项更新即时重算 | `demos/react/e2e/rfc-validation.spec.ts` (`RFC-0030 recalculates formula result...`) | ✅ 达标 |
| **0011** | 高级主题功能 | *待补齐独立验收页* | 主题动态预览与恢复、CSS 过渡切换动画、主题编辑器及导出 | 单元测试已覆盖 (`packages/core/test/theme-integration.test.ts`)，demo 验收页待后续扩展 | ⚠️ 缺口跟踪 |
| **0023** | 剪贴板操作 | *待补齐浏览器事件* | TSV 复制与粘贴、单元格选区更新 | 纯函数与核心方法就绪，浏览器事件接线待后续补齐 | ⚠️ 缺口跟踪 |

---

## 验收规则与完成门禁 (Completion Gate Rules)

1. **唯一可信路由源**:
   `demos/react/src/rfcValidationDemos.ts` 中的 `RFC_VALIDATION_ORDER` 必须包含所有提供交互验收的 RFC。
2. **端到端自动化一致性**:
   `demos/react/e2e/coverage.spec.ts` 中的断言 `every validation demo RFC has an E2E test` 必须始终保持 100% 通过。新增任何演示 RFC 都必须在 `rfc-validation.spec.ts` 中提供对应的 `test("RFC-XXXX ...")` 用例。
3. **数据确定性保证**:
   `demos/react/src/stories/makeData.ts` 固定 `FIXTURE_SEED`，保证 Playwright 测试在不同环境与重复加载下看到完全一致的行快照。
4. **CI 门禁约束**:
   任何进入 `main` 的 PR 必须通过 GitHub Actions 中的 unit test 以及 Playwright e2e 门禁 (`CI=1 pnpm test:e2e`)。
5. **归档准则**:
   未达标或存在 browser wiring 缺口的 RFC 必须在验收矩阵中如实记录缺口并建立跟踪，不允许虚标。

## Acceptance

1. All completed RFCs are mapped to interactive validation demo routes (`/?rfc=NNNN`) and explicit verification behaviors.
2. The demo validation suite passes 100% on Playwright (`pnpm test:e2e`).
3. `e2e/coverage.spec.ts` verifies that every registered demo RFC has browser test coverage.
4. Fixture data is deterministic across reloads.
5. Known gaps (RFC-0011, RFC-0023) are formally documented and tracked.

---

## 验收结果 (Acceptance Evidence)

- **E2E 测试套件全绿**:
  在单 worker 及 CI 模式下运行 `CI=1 pnpm test:e2e`，19 个端到端测试均稳定通过（覆盖 0001, 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0015, 0016, 0019, 0030 及覆盖率校验与数据确定性校验）。
- **单元测试全绿**:
  运行 `pnpm test`，全套 28 个测试文件、204 个测试 100% 通过。
