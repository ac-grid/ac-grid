# AG Grid ↔ AC Grid 功能对标矩阵

> **最后更新**: 2026-06-28  
> **维护者**: AC Grid Team  
> **用途**: ACG-2 交付物 — 确保 RFC 覆盖 AG Grid Community + Enterprise 核心能力

## 图例

| 符号 | 含义 |
|------|------|
| ✅ | 已实现 |
| 🚧 | 实施中 |
| 📝 | RFC 已规划/草稿 |
| 🔮 | 远期（Stretch） |
| ❌ | 明确排除（非 grid-core 范围） |
| — | AG Grid 不提供 / 不适用 |

## 版本阶段

| 阶段 | 目标版本 | RFC 范围 | 对标范围 |
|------|----------|----------|----------|
| Phase 0 | v0.0.x | 0001, 0016 | 架构 + 主题基础 |
| Phase 1 | v0.1.0–v0.5.0 | 0002–0019 | **AG Grid Community** 核心 |
| Phase 2 | v1.0.0–v1.2.0 | 0020–0029 | **AG Grid Enterprise** 高级 |
| Phase 3 | v2.0.0+ | 0030–0032 | Enterprise 扩展 + AI |

---

## Phase 0 — 架构与基础

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 列/行数据模型 | Community | ✅ | [0001](./0001-ac-grid-architecture.md) | v0.0.1 |
| Web Components 核心 | — | ✅ | [0001](./0001-ac-grid-architecture.md) | v0.0.1 |
| 自定义单元格渲染 | Community | ✅ | [0001](./0001-ac-grid-architecture.md) | v0.0.1 |
| 列/行拖拽重排 | Community | ✅ | [0001](./0001-ac-grid-architecture.md) | v0.0.1 |
| 主题系统（CSS 变量） | Community | ✅ | [0016](./0016-theme-system.md) | v0.0.2 |

---

## Phase 1 — Community 对标（0002–0019）

### 数据操作

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 单列/多列排序 | Community | ✅ | [0002](./completed/0002-sorting-feature.md) | v0.1.0 |
| 列过滤 | Community | ✅ | [0003](./0003-filtering-feature.md) | v0.1.0 |
| 全局快速过滤 | Community | ✅ | [0003](./0003-filtering-feature.md) | v0.1.0 |
| 列调整大小 | Community | ✅ | [0004](./completed/0004-column-resizing.md) | v0.1.0 |
| 自动列宽 | Community | ✅ | [0004](./completed/0004-column-resizing.md) | v0.1.0 |

### 布局与性能

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 行虚拟滚动 | Community | ✅ | [0005](./completed/0005-virtual-scrolling.md) | v0.2.0 |
| 列虚拟滚动 | Community | 📝 | [0005](./completed/0005-virtual-scrolling.md) | v0.2.0 |
| 100K+ 行性能 | Community | 📝 | [0005](./completed/0005-virtual-scrolling.md) | v0.2.0 |
| 分页（客户端） | Community | ✅ | [0006](./completed/0006-pagination.md) | v0.2.0 |
| 列固定 (Pinning) | Enterprise* | ✅ | [0008](./completed/0008-column-pinning.md) | v0.3.0 |

> \* AG Grid 文档将 Pinning 列在 Enterprise；Community 用户常需此能力，AC Grid 纳入 v0.3.0 Community 路线图。

### 交互

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 行选择（单选/多选） | Community | ✅ | [0007](./completed/0007-row-selection.md) | v0.2.0 |
| 单元格编辑 | Community | 📝 | [0009](./0009-cell-editing.md) | v0.3.0 |
| 键盘导航 | Community | 📝 | [0012](./0012-keyboard-navigation.md) | v0.4.0 |
| 可访问性 (ARIA) | Community | 📝 | [0013](./0013-accessibility.md) | v0.4.0 |

### 高级（Community 边界）

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 行分组 | Enterprise | 📝 | [0010](./0010-grouping-aggregation.md) | v1.1.0 |
| 数据聚合 | Enterprise | 📝 | [0010](./0010-grouping-aggregation.md) | v1.1.0 |

> 0010 保留在 v0.3.0 草稿；对标上属 Enterprise，实施顺延至 Phase 2。

### 体验与导出

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 主题定制（高级） | Community | 📝 | [0011](./0011-theme-system.md) | v0.4.0 |
| CSV 导出 | Community | 📝 | [0014](./0014-data-export.md) | v0.5.0 |
| 国际化 (i18n) | Community | 📝 | [0015](./0015-internationalization.md) | v0.5.0 |

### Community 缺口（本轮新增 RFC）

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 框架绑定 (Vue/Angular/Svelte) | Community | 📝 | [0017](./0017-framework-bindings.md) | v0.5.0 |
| Grid 状态 API / 持久化 | Community | 📝 | [0018](./0018-grid-state-api.md) | v0.5.0 |
| 自定义组件（Header/Filter/Overlay） | Community | 📝 | [0019](./0019-custom-components.md) | v0.4.0 |

---

## Phase 2 — Enterprise 对标（0020–0029）

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 树形数据 | Enterprise | 📝 | [0020](./0020-tree-data.md) | v1.1.0 |
| 主从表格 (Master/Detail) | Enterprise | 📝 | [0021](./0021-master-detail.md) | v1.1.0 |
| 范围选择 | Enterprise | 📝 | [0022](./0022-range-selection.md) | v1.1.0 |
| 剪贴板操作 | Enterprise | 📝 | [0023](./0023-clipboard-operations.md) | v1.1.0 |
| 透视模式 (Pivot) | Enterprise | 📝 | [0024](./0024-pivot-mode.md) | v1.2.0 |
| Excel 导出（样式/公式） | Enterprise | 📝 | [0025](./0025-excel-export-advanced.md) | v1.2.0 |
| 右键/列菜单 | Enterprise | 📝 | [0026](./0026-context-menu-column-menu.md) | v1.1.0 |
| 工具面板 / 状态栏 | Enterprise | 📝 | [0027](./0027-tool-panels-status-bar.md) | v1.2.0 |
| 高级过滤 (Set/Multi) | Enterprise | 📝 | [0028](./0028-advanced-filtering.md) | v1.2.0 |
| 集成图表 | Enterprise | 📝 | [0029](./0029-integrated-charts.md) | v1.2.0 |

---

## Phase 3 — Stretch（0030–0032）

| 功能 | AG Grid | AC Grid | RFC | 版本 |
|------|---------|---------|-----|------|
| 单元格公式 | Enterprise | ✔️ 引擎 | [0030](./completed/0030-formulas.md) | v2.0.0 |
| 服务端行模型 (SSRM) | Enterprise | 🔮 | [0031](./0031-server-side-row-model.md) | v2.0.0 |
| AI Toolkit | Enterprise | 🔮 | [0032](./0032-ai-toolkit.md) | Stretch |

---

## 明确排除

| 能力 | 原因 |
|------|------|
| AG Charts 独立产品 | 非 grid-core；0029 仅覆盖 grid 内集成图表 |
| AG Grid Gantt | 独立产品线 |
| AG Dashboard | 独立产品线 |
| 商业许可证 / 支持 SLA | AC Grid 为 MIT 开源，不提供企业支持合同 |

---

## 开放产品决策

| ID | 问题 | 选项 | 建议 |
|----|------|------|------|
| D1 | 首发框架绑定 | React-only / 三框架 / WC-only | WC-first + React demo；0017 覆盖 Vue/Angular |
| D2 | Enterprise 功能许可证 | 全 MIT / `@ac-grid/enterprise` 分包 | 全 MIT，用 optional peer 拆分大包 |
| D3 | 渲染技术 | 纯 DOM / Canvas 混合 | 保持 DOM + 虚拟滚动；Canvas 仅评估 100K+ 列场景 |
| D4 | Pinning 归属 | Community vs Enterprise 对标 | 纳入 v0.3.0 Community 路线（用户期望） |

---

## RFC 覆盖统计

| 范围 | RFC 数 | 已实现 | 进行中 | 草稿 |
|------|--------|--------|--------|------|
| Phase 0 | 2 | 2 | 0 | 0 |
| Phase 1 (0002–0019) | 18 | 8 | 0 | 10 |
| Phase 2 (0020–0029) | 10 | 0 | 0 | 10 |
| Phase 3 (0030–0032) | 3 | 1 | 0 | 2 |
| **合计** | **33** | **11** | **0** | **22** |

---

## 相关文档

- [RFC 索引](./README.md)
- [项目路线图](../ROADMAP.md)
- [任务追踪](../TASK_TRACKING.md)
- [总体架构](./0001-ac-grid-architecture.md)
