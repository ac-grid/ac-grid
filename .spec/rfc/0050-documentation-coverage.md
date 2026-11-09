# RFC 0050: 文档覆盖：API 参考、功能指南与 README (Umbrella)

**Status:** Draft

**Type:** Umbrella

## Summary

AC Grid 的功能已大量完成，但对外文档只有 5 篇站点指南，没有 API 参考，根 README 仍停留在 v0.0.1。本伞形 RFC 只做索引：把文档缺口拆成三个互相独立的子 RFC（API 参考、功能指南、README 与索引），各自有 Design 与 Acceptance。本文件不含实现细节。

## Problem

现状（已核对仓库）：

- 站点指南仅 `apps/site/public/docs/guide/` 下 5 篇：getting-started、accessibility、filtering、sorting、theming。
- 没有 API 参考，也没有 typedoc 之类的生成流程；API 的唯一权威来源 `packages/core/src/types/*.ts` 与 `packages/core/src/index.ts` 的导出没有被任何文档消费。
- 根 `README.md` 的架构与功能列表已过时，并链接到不存在的根 `ROADMAP.md`。
- `.spec/ROADMAP.md` 中已完成的功能（编辑、键盘导航、分页、虚拟滚动、列调整大小、列固定、行选择、分组聚合、范围选择、剪贴板、公式、国际化、自定义组件、集成图表）大多没有指南。

三个缺口的产物、验证方式、依赖都不同，混在一个 RFC 会让验收含糊，因此用伞形加子 RFC。

## Goals

- 三个子 RFC 均达到 Approved，并各自按其 Acceptance 完成。
- 完成后，使用者能从站点找到：每个公开导出的 API 参考、每个已完成功能的使用指南、与实际一致的 README。

## Non-goals

- 不新增或修改任何产品功能与组件行为。
- 不在本伞形下追加新的文档工作；新增需求另开子 RFC 或新伞形，不重开本 RFC。
- 不做站点视觉重设计，不做多语言翻译。

## Children

| RFC | Concern |
|-----|---------|
| [0053](0053-readme-refresh.md) | 根 README 与文档索引更新 |
| [0052](0052-feature-guides.md) | 已实现功能的使用指南 |
| [0051](0051-api-reference-docs.md) | API 参考文档（由类型定义生成） |

## Acceptance

三个子 RFC 均达到其完成条件后，本伞形可关闭；关闭后不再为新工作重开。
