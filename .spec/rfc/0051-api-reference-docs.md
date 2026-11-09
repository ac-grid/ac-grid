# RFC 0051: API 参考文档（由类型定义生成） (child of 0050)

**Status:** Draft

**Parent:** [0050](0050-documentation-coverage.md)

## Summary

为 `@ac-grid/core` 的公开导出生成 API 参考，并发布到站点 `/docs/api/`。内容从源码类型与 TSDoc 生成，不手写，避免与代码漂移。

## Problem

`packages/core/src/index.ts` 导出约 60 条语句（类型、配置接口、组件），类型定义分布在 `packages/core/src/types/*.ts`（editing、filtering、grouping、pagination、range-selection、clipboard、formulas、i18n 等）。使用者目前只能读源码或 RFC 才知道有哪些配置项与回调。仓库没有 API 文档生成流程。

## Goals

- 站点上有按导出分页的 API 参考，覆盖 `index.ts` 的每一个公开导出。
- API 参考随源码生成：改类型后重新构建即更新，不需要手工同步。

## Non-goals

- 不写功能使用指南（属 0052）。
- 不改 README 与文档索引（属 0053）。
- 不改产品代码的行为；仅在 Design 中 Task 2 明确列出的情形下才可能需要调整类型位置或补 TSDoc，并须先征得批准。

## Design

### Task 1：确认生成路径（先调查，不改代码）

站点的 `vite.config.ts` 已使用 `@wsxjs/wsx-press`，它依赖 typedoc 与 typedoc-plugin-markdown，仓库根 `node_modules/.bin` 也有 `typedoc`。需先确认两件事再选方案：

- wsx-press 是否自带 API 文档生成（读其文档与源码）；若有，优先复用。
- 否则直接用 typedoc + typedoc-plugin-markdown，入口为 `packages/core/src/index.ts`，输出到站点文档目录下的 `api/`。

注意：本机 `@wsxjs/wsx-press` 的 pnpm 目录缺失（站点依赖未装全），验证前需先 `pnpm install`。

### Task 2：已知风险——`.wsx` 类型

`index.ts` 通过 `export type { GridSortingConfig } from "./components/Grid.wsx"` 导出类型，并带 `@ts-ignore`。typedoc 可能无法解析 `.wsx`，导致该导出缺页。处理方式在 Task 1 的试跑结果出来后提出，候选：给 typedoc 配置 wsx 解析、或把该类型迁到 `types/` 下。后者属产品代码改动，须单独获得批准。

### Task 3：接入构建与站点导航

- 生成产物：默认不入库，在站点构建（`apps/site` 的 `build`）前生成，保证单一事实来源；若生成工具在 CI 中不稳定，再改为入库并加一致性检查。此点为待批准的选择。
- 文档页需带站点既有 frontmatter（title、order、category、description），使 wsx-press 能收录。
- 在 `apps/site/src/components/DocsSection.wsx` 添加 API 入口链接（该组件目前硬编码 4 个指南链接）。

### Task 4：完整性校验

增加一个小脚本，比较 `index.ts` 的导出名与生成页面，缺页则构建失败。

## Acceptance

- 站点构建成功，`/docs/api/` 下有页面，覆盖 `packages/core/src/index.ts` 的全部导出；完整性校验脚本通过。
- 突变检查：临时在 `index.ts` 增加一个导出而不生成页面（或让生成跳过一个导出），完整性校验必须失败；恢复后通过。
- 修改某个类型字段的 TSDoc 后重新构建，页面内容随之变化（证明由源码生成而非手写）。
- 在真实浏览器里打开 `/docs/api/` 并点开至少一个配置接口页，确认字段、类型与默认值显示正确。
- `packages/core` 全量单测与站点 `typecheck`、`lint` 通过。
