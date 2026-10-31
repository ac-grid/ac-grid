# RFC 0044: Unit coverage for logic modules (child of 0043)

**Status:** Approved

**Parent:** [0043](0043-coverage-100-umbrella.md)

## Summary

把 `packages/core/src` 下不依赖 DOM 的逻辑模块（`utils/*.ts`、`i18n/*.ts`、`types/*.ts`）的单元覆盖率提升到 100%（语句、分支、函数、行）。

## Problem

这些模块是纯函数或轻量类，最适合单元测试，但仍有缺口：`a1-notation` 约 79%、`formula-parser` 约 78%、`filter-functions` 约 48%、`component-registry` 约 67%、`component-portal` 约 77%、`render-component` 约 39%、`i18n/manager` 约 88%。

## Goals

- 上述目录四项均为 100%。
- 测试断言可观察行为（输入输出、抛出的错误、副作用），不断言内部实现。

## Non-goals

- `src/components/*.wsx`：见 [0046](0046-component-coverage-closure.md)。
- E2E：见 [0045](0045-e2e-coverage-collection.md)。
- 用 `v8 ignore` 或排除文件来凑 100%：不允许。

## Design

1. 用 `vitest --coverage` 的 JSON 输出列出每个文件的未覆盖行和分支，按文件逐个补测试，放在 `packages/core/test/` 对应文件旁。
2. 每补完一个文件，把它的 per-file 阈值写入 `vite.config.ts` 为 100，防止回退。
3. 死代码和不可达分支直接删除（单独提交，便于审查）。

## Acceptance

- `vitest run --coverage` 对上述目录四项均为 100%，per-file 阈值已写入配置。
- 变异检查：对每个新增测试文件，撤销一处被测逻辑，至少有一个测试变红。
- 原有测试全部通过，整体棘轮阈值只升不降。
