# RFC 0039: RFC-0036 P1 demo defects (Umbrella)

**Status:** Draft

**Type:** Umbrella

**Related:** [0036](./0036-demo-quality-remediation.md)

## Summary

RFC-0036 的 P1 项（issue #35、#36、#38）在浏览器里复现后，分属三个互不相关的缺陷。本 umbrella 只做索引：每个缺陷一个 child RFC，各自带设计和验收。issue #34（拖动滚动条）在 demo 里复现不了，归 RFC-0038 的验证计划，不在此列。

## Problem

三个缺陷共用同一类证据（demo 页面表现异常），但根因分布在不同位置：核心的列顺序、固定列主题变量、遮罩主题变量。放进一个 RFC 会让任何一项的验收被其他项拖住，所以拆开。

## Goals

三个 child 都达到 Approved 或 Implemented，且各自的 E2E 在并行配置下通过。

## Non-goals

- 不修改 RFC-0036 的正文，它保持 Draft，仅作为这些缺陷的来源。
- 不处理 issue #34，由 [0038](./0038-virtual-scrolling-verification.md) 覆盖。
- 不处理 `sorting.enabled` 被忽略、RFC-0030 的 Grid 集成，这两项需要各自的 RFC。
- 以后出现新的 demo 缺陷，另开 child 或新的 umbrella，不重开本 umbrella。

## Children

| RFC | Concern |
|-----|---------|
| [0042](0042-overlay-theme.md) | Empty and loading overlay theme |
| [0041](0041-pinned-column-theme.md) | Pinned column theme and horizontal scroll demo |
| [0040](0040-selection-column-order.md) | Selection column order |

## Acceptance

三个 child 满足 Goals 后可关闭本 umbrella；不得为新工作重开。
