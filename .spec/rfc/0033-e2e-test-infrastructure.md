# RFC-0033: E2E 测试基础设施

**状态**: 📝 草稿  
**版本**: 0.1.0  
**作者**: Albert Li  
**日期**: 2026-10-11  
**关联 Issue**: ACG-119  
**相关 RFC**: [0035](./0035-rfc-0010-e2e-coverage.md)

## 概述

提供可重复的浏览器验收工具链：Playwright Chromium 对 `demos/react`，确定性数据，每个已完成 RFC 至少一条 E2E。

## 设计目标

- [x] **Playwright harness**: `demos/react/playwright.config.ts` 自动启动 `pnpm dev:e2e`，`pnpm test:e2e` 一键运行；PR 门禁见 `.github/workflows/pull-request.yml`。
- [x] **确定性 fixtures**: `makeData` 固定 `FIXTURE_SEED`，demo、Storybook、E2E 数据一致；`e2e/coverage.spec.ts` 校验刷新后首行不变。
- [x] **覆盖守卫**: `e2e/coverage.spec.ts` 保证 `RFC_VALIDATION_ORDER` 中每个 RFC 在 spec 文件里都有对应测试。
- [x] **新增 RFC-0015 验收**: `?rfc=0015` 使用 zh-CN 语言包，E2E 断言分页文案。
- [ ] **每个已完成 RFC 一条 E2E**: 仍缺 RFC-0011、RFC-0023（见下）。

## 已知缺口

- **RFC-0023 剪贴板**: `Grid.wsx` 中 `handleClipboardCopy`/`handleClipboardPaste` 与 `activeClipboardCell` 未接入任何事件监听或单元格点击，浏览器中无法触发，E2E 无从验证。需先补齐 core 接线。
- **RFC-0011 高级主题**: demo 尚无验收页。
- **RFC-0010 折叠按钮竞态**: 首次点击 `collapse-all-btn` 偶尔在 grid 就绪前落空，测试以 `toPass` 重试规避，根因未查。

## 验收

`CI=1 pnpm test:e2e`：19 个测试通过（Chromium，单 worker）。
