# AC Grid RFC 文档索引

本目录包含 AC Grid 项目的所有 RFC（Request for Comments）文档。

## RFC 管理规则

1. **RFC 编号**：从 0001 开始，顺序递增，使用四位数字（如 0001, 0002）
2. **RFC 状态**：
   - 📝 **草稿 (Draft)**：正在编写中
   - 🔍 **审查 (Review)**：等待审查和反馈
   - ✅ **已批准 (Approved)**：已批准，准备实施
   - 🚧 **实施中 (In Progress)**：正在实施
   - ✔️ **已完成 (Completed)**：已实施并测试完成
   - ❌ **已拒绝 (Rejected)**：已拒绝
   - 🔄 **已替代 (Superseded)**：已被新 RFC 替代

3. **RFC 模板**：使用 `RFC-TEMPLATE.md` 作为新 RFC 的模板
4. **RFC 完成处理**：当 RFC 实施完成并测试通过后：
   - 将状态更新为 `✔️ 已完成`
   - 将文件移动到 `completed/` 文件夹
   - 更新 `README.md` 中的链接路径
   - 更新 `ROADMAP.md` 中的状态和里程碑
   - 修复文件中的相对链接路径（使用 `../` 指向父目录）
   - 关闭对应的 Multica issue（见 [ISSUE_REGISTRY.md](./ISSUE_REGISTRY.md)）

5. **RFC ↔ Issue 映射**：每个 RFC 对应一个 Multica 子 issue（父 issue [ACG-2](mention://issue/b7f108c7-583f-4986-9f38-a30cec79d5a0)）。完整对照表见 [ISSUE_REGISTRY.md](./ISSUE_REGISTRY.md)。

## RFC 列表

### 架构和基础

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0001](./0001-ac-grid-architecture.md) | AC Grid 总体架构 | ✅ 已批准 | 0.0.1 | Albert Li | 2024 |
| [0016](./0016-theme-system.md) | 主题系统架构（独立包设计） | ✔️ 已完成 | 0.0.2 | Albert Li | 2026-01-24 |

### 第一阶段：基础数据操作 (v0.1.0)

| RFC | 标题 | 状态 | AG Grid 覆盖率 | 版本 | 作者 | 日期 |
|-----|------|------|----------------|------|------|------|
| [0002](./completed/0002-sorting-feature.md) | 排序功能 | ✅ 已完成 | ~65% | 0.1.0 | Albert Li | 2026-01-31 |
| [0003](./completed/0003-filtering-feature.md) | 过滤功能 | ✔️ 已完成 | ~60% | 0.1.0 | Albert Li | 2026-01-24 |
| [0004](./completed/0004-column-resizing.md) | 列调整大小 | ✔️ 已完成 | 待评估 | 0.1.0 | Albert Li | 2026-01-24 |

### 第二阶段：性能和交互优化 (v0.2.0)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0005](./completed/0005-virtual-scrolling.md) | 虚拟滚动 | ✔️ 已完成 | 0.2.0 | Albert Li | 2026-06-28 |
| [0006](./completed/0006-pagination.md) | 分页功能 | ✔️ 已完成 | 0.2.0 | Albert Li | 2026-01-24 |
| [0007](./completed/0007-row-selection.md) | 行选择 | ✔️ 已完成 | 0.2.0 | Albert Li | 2026-01-24 |
| [0008](./completed/0008-column-pinning.md) | 列固定 (Pinning) | ✔️ 已完成 | 0.3.0 | Albert Li | 2026-01-24 |

### 第三阶段：高级功能 (v0.3.0)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0008](./completed/0008-column-pinning.md) | 列固定 (Pinning) | ✔️ 已完成 | 0.3.0 | Albert Li | 2026-01-24 |
| [0009](./completed/0009-cell-editing.md) | 单元格编辑 | ✔️ 已完成 | 0.3.0 | Albert Li | 2026-01-24 |
| [0010](./0010-grouping-aggregation.md) | 分组和聚合 | 📝 草稿 | 0.3.0 | Albert Li | 2026-01-24 |

### 第四阶段：用户体验 (v0.4.0)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0011](./0011-theme-system.md) | 主题系统（高级功能） | 📝 草稿 | 0.4.0 | Albert Li | 2026-01-24 |
| [0012](./0012-keyboard-navigation.md) | 键盘导航 | 📝 草稿 | 0.4.0 | Albert Li | 2026-01-24 |
| [0013](./0013-accessibility.md) | 可访问性 (a11y) | 📝 草稿 | 0.4.0 | Albert Li | 2026-01-24 |

### 第五阶段：数据导出和国际化 (v0.5.0)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0014](./0014-data-export.md) | 数据导出 | 📝 草稿 | 0.5.0 | Albert Li | 2026-01-24 |
| [0015](./0015-internationalization.md) | 国际化 (i18n) | 📝 草稿 | 0.5.0 | Albert Li | 2026-01-24 |

## 如何创建新 RFC

1. 复制 `RFC-TEMPLATE.md` 文件
2. 重命名为 `XXXX-feature-name.md`（XXXX 是下一个可用的 RFC 编号）
3. 填写 RFC 元数据和内容
4. 在本 README 中添加 RFC 条目
5. 提交 Pull Request 进行审查

## RFC 审查流程

1. **提交**：创建 RFC 并提交 PR
2. **讨论**：团队成员审查和讨论
3. **修订**：根据反馈修改 RFC
4. **批准**：获得批准后更新状态为"已批准"
5. **实施**：开始实施，状态更新为"实施中"
6. **完成**：实施完成并测试通过后，状态更新为"已完成"

### 第六阶段：Community 补齐 (v0.4.0–v0.5.0)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0017](./0017-framework-bindings.md) | 框架绑定 (Vue/Angular/Svelte) | 📝 草稿 | 0.5.0 | Albert Li | 2026-06-28 |
| [0018](./0018-grid-state-api.md) | Grid 状态 API 与持久化 | 📝 草稿 | 0.5.0 | Albert Li | 2026-06-28 |
| [0019](./0019-custom-components.md) | 自定义组件 (Header/Filter/Overlay) | 📝 草稿 | 0.4.0 | Albert Li | 2026-06-28 |

### 第七阶段：Enterprise 对标 (v1.1.0–v1.2.0)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0020](./0020-tree-data.md) | 树形数据 | 📝 草稿 | 1.1.0 | Albert Li | 2026-06-28 |
| [0021](./0021-master-detail.md) | 主从表格 | 📝 草稿 | 1.1.0 | Albert Li | 2026-06-28 |
| [0022](./0022-range-selection.md) | 范围选择 | 📝 草稿 | 1.1.0 | Albert Li | 2026-06-28 |
| [0023](./0023-clipboard-operations.md) | 剪贴板操作 | 📝 草稿 | 1.1.0 | Albert Li | 2026-06-28 |
| [0024](./0024-pivot-mode.md) | 透视模式 | 📝 草稿 | 1.2.0 | Albert Li | 2026-06-28 |
| [0025](./0025-excel-export-advanced.md) | Excel 高级导出 | 📝 草稿 | 1.2.0 | Albert Li | 2026-06-28 |
| [0026](./0026-context-menu-column-menu.md) | 右键/列菜单 | 📝 草稿 | 1.1.0 | Albert Li | 2026-06-28 |
| [0027](./0027-tool-panels-status-bar.md) | 工具面板与状态栏 | 📝 草稿 | 1.2.0 | Albert Li | 2026-06-28 |
| [0028](./0028-advanced-filtering.md) | 高级过滤 | 📝 草稿 | 1.2.0 | Albert Li | 2026-06-28 |
| [0029](./0029-integrated-charts.md) | 集成图表 | 📝 草稿 | 1.2.0 | Albert Li | 2026-06-28 |

### 第八阶段：Stretch (v2.0.0+)

| RFC | 标题 | 状态 | 版本 | 作者 | 日期 |
|-----|------|------|------|------|------|
| [0030](./completed/0030-formulas.md) | 单元格公式 | ✔️ 已完成 | 2.0.0 | Albert Li | 2026-06-28 |
| [0031](./0031-server-side-row-model.md) | 服务端行模型 | 🔮 Stretch | 2.0.0 | Albert Li | 2026-06-28 |
| [0032](./0032-ai-toolkit.md) | AI Toolkit | 🔮 Stretch | TBD | Albert Li | 2026-06-28 |

## 相关资源

- [**RFC → Issue 对照表**](./ISSUE_REGISTRY.md) - 🔗 每个 RFC 的 Multica issue
- [**AG Grid 功能对标矩阵**](./PARITY_MATRIX.md) - ⚖️ Community/Enterprise 全覆盖
- [项目路线图](../ROADMAP.md) - 📅 查看开发进度和时间规划
- [任务追踪](../TASK_TRACKING.md) - ✅ 当前冲刺任务
- [快速开始指南](./GETTING-STARTED.md) - 🚀 如何开始开发功能
- [总体架构文档](./0001-ac-grid-architecture.md) - 🏗️ 技术架构和设计
- [项目主 README](../../README.md) - 📖 项目介绍
- [开发规范](../../CLAUDE.md) - 📝 编码规范
