# RFC 0052: 已实现功能的使用指南 (child of 0050)

**Status:** Draft

**Parent:** [0050](0050-documentation-coverage.md)

## Summary

为 `.spec/ROADMAP.md` 中已完成、但站点还没有指南的功能补写使用指南，放在 `apps/site/public/docs/guide/features/`，沿用现有指南的格式与语言。

## Problem

站点现有功能指南只有 accessibility、filtering、sorting、theming。以下功能已实现并有 RFC 与 e2e 验证，却没有指南：单元格编辑、键盘导航、分页、虚拟滚动、列调整大小、列固定、行选择、分组和聚合、范围选择、剪贴板、公式、国际化、自定义组件、集成图表。使用者无从得知如何启用和配置。

## Goals

- 每个已完成功能都有一篇指南：怎么启用、关键配置、最小可运行示例、常见问题。
- 指南内容与实现一致，示例可运行。

## Non-goals

- 不写 API 参考（属 0051），指南只链接过去，不重复字段表。
- 不改 README 与文档索引（属 0053）。
- 不新增或修改产品功能；写指南时发现的行为问题另开 RFC，不在本 RFC 里顺手修。

## Design

### Task 1：范围与批次

分两批，每批可独立验收：

- 第一批（用户最常用）：单元格编辑（0009，含 Enter 触发 0048、0049）、键盘导航（0012）、分页（0006）、虚拟滚动（0005）。
- 第二批：列调整大小（0004）、列固定（0008）、行选择（0007）、分组和聚合（0010）、范围选择（0022）、剪贴板（0023）、公式（0030）、国际化（0015）、自定义组件（0019）、集成图表（0029）。

### Task 2：写法

- 文件放 `apps/site/public/docs/guide/features/<name>.md`，frontmatter 与 `sorting.md` 一致（title、order、category、description），正文语言与现有指南保持一致（英文）。
- 每篇结构：Quick Start、Basic Usage、关键配置（只列常用项，其余链到 API 参考）、与其他功能的交互、限制。
- 事实来源是实现与测试，不是 RFC 文字：配置项名称、默认值、触发条件以 `packages/core/src` 与现有 demo 为准。例如编辑指南必须写明 `editTrigger` 默认为 `"doubleClick"`，且 Enter 触发需要 `"enter"` 或 `"both"`。

### Task 3：示例验证

每篇的代码示例必须能对上一个已有 demo 或 e2e 用例（`demos/react`、`demos/wsx`），或在站点里实际渲染通过。找不到对应 demo 的示例，要么补 demo（另行说明范围），要么删掉该示例。

### Task 4：站点入口

`apps/site/src/components/DocsSection.wsx` 目前硬编码 4 个指南链接；新增指南需要在这里加链接。若 wsx-press 的侧栏由 frontmatter 自动生成，则只需确认侧栏出现，不改组件。

## Acceptance

- 第一批四篇指南合并后，站点构建通过，四篇在站点侧栏或首页入口可见。
- 每篇的代码示例都对应到已有 demo/e2e 或已实际渲染验证；验收时在交付说明里逐篇列出对应关系。
- 抽查事实：编辑指南关于 `editTrigger` 的说法，用现有测试（`packages/core/test/editing.test.ts` 的 Enter 触发用例）核对一致。
- 在真实浏览器里打开每篇新指南，检查渲染、代码块与站内链接。
- 第二批各篇按相同标准验收；全部完成前本 RFC 保持 Approved，不提前标为 Implemented。
