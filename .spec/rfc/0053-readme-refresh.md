# RFC 0053: 根 README 与文档索引更新 (child of 0050)

**Status:** Draft

**Parent:** [0050](0050-documentation-coverage.md)

## Summary

更新根 `README.md` 与 `docs/README.md`，使其反映当前包结构、已实现功能和真实可达的文档链接。

## Problem

已核对的问题：

- 根 `README.md` 的架构段写的是 `packages/ac-grid-react`，实际包是 `core`、`charts`、`theme-base`、`theme-default`，demo 在 `demos/react`、`demos/wsx`，站点在 `apps/site`。
- 功能段停留在 v0.0.1，把排序、过滤、列调整大小列为"计划中"，实际均已完成。
- 根目录没有 `ROADMAP.md`，但根 README 与 `docs/README.md` 都链接到 `./ROADMAP.md` 或 `../ROADMAP.md`，是死链；路线图实际在 `.spec/ROADMAP.md`。
- `docs/README.md` 只列了排序、过滤、主题三篇指南，缺 accessibility 与 getting-started，且"最后更新"为 2026-01-24。

## Goals

- README 的架构、功能状态、安装与使用示例与仓库现状一致。
- README 与 `docs/README.md` 中所有内部链接都能解析到存在的文件。
- 文档索引列出站点现有的全部指南，并预留指向 API 参考（0051）和新增指南（0052）的位置。

## Non-goals

- 不写 API 参考与功能指南正文（属 0051、0052）。
- 不重写 `docs/GETTING-STARTED.md`，除非其中存在与 README 同样的失效链接。
- 不改产品代码。

## Design

### Task 1：更正事实

逐段对照仓库：包列表取自 `pnpm-workspace.yaml` 与 `packages/`、`apps/`、`demos/` 目录；功能状态取自 `.spec/ROADMAP.md`，不自行推断；使用示例用现行的入口（`@ac-grid/core` 与自定义元素 `wsx-ac-grid`，参见站点 getting-started 指南）。

### Task 2：修复链接

把指向根 `ROADMAP.md` 的链接改为 `.spec/ROADMAP.md`。更新 `docs/README.md` 的指南表与"最后更新"日期。

### Task 3：链接检查

写一个一次性的链接检查（命令行脚本或 CI 里已有的工具），遍历两个 README 的相对链接，确认目标存在；不引入新依赖。

### Task 4：与兄弟 RFC 的先后

0051、0052 完成后，索引需要新增条目。本 RFC 只负责当下的事实与失效链接；后续新增条目随各自 RFC 一并更新索引，避免本 RFC 反复重开。

## Acceptance

- 链接检查通过：两个 README 的相对链接全部指向存在的文件。
- 突变检查：临时把一个链接指向不存在的文件，链接检查必须失败；恢复后通过。
- README 的包列表与 `pnpm-workspace.yaml` 展开后的目录一一对应；功能状态与 `.spec/ROADMAP.md` 一致，交付说明里写出核对方式。
- 按 README 的安装与使用示例，在干净目录里能跑通（或明确标注示例需要的前置条件）。
