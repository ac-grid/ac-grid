# RFC 0057: apps/site typecheck, lint and test failures

**Status:** Approved

## Summary

`apps/site` 的 `typecheck`、`lint`、`test` 三项检查一直失败。RFC 0055 把 `apps/site` 纳入 pnpm 工作区后这些失败才暴露出来。本 RFC 逐项查明根因并修复，让三项都能真实通过，不放宽检查。

## Problem

三项失败相互独立：

1. **typecheck**：`tsc --noEmit` 对 `@wsxjs/wsx-core@0.1.1` 的源码报 `TS2612: Property 'config' will overwrite the base property`。`tsconfig.base.json` 开启了 `useDefineForClassFields`，而该库的类字段写法按关闭编译。加 `--useDefineForClassFields false` 后零报错（已实测）。
2. **lint**：`eslint.config.js` 导入 `@wsxjs/eslint-plugin-wsx`，但 `apps/site/package.json` 没有声明它（`ERR_MODULE_NOT_FOUND`）。同一个配置还导入 `@eslint/js`、`globals`，目前只靠 pnpm 提升到根 `node_modules` 才碰巧可用。
3. **test**：`vitest --run` 报 `No test files found`，退出码 1。站点有可测试的逻辑（路由 SEO meta、`MetaManager`、错误处理）却没有任何测试。

## Goals

- `pnpm --filter @ac-grid/site typecheck`、`lint`、`test` 都以退出码 0 通过。
- 测试断言可观察行为（`document.title`、`<meta>` 标签、路由配置的完整性），不是为凑数。

## Non-goals

- 用 `--passWithNoTests`、关闭规则或 `// @ts-ignore` 让命令通过。
- 修改 `@wsxjs/wsx-core` 或升级它的版本。
- 站点页面、样式、内容的改动。

## Design

### Task 1: typecheck

`apps/site/tsconfig.json` 设 `"useDefineForClassFields": false`，只影响站点的类型检查；构建由 Vite/wsx 插件完成，不受影响。

### Task 2: lint

`apps/site/package.json` 的 devDependencies 增加 `@wsxjs/eslint-plugin-wsx`（与站点使用的 `@wsxjs/wsx-core@^0.1.0` 同线，取 `^0.1.1`）、`@eslint/js`、`globals`，版本与工作区已解析的一致，更新 `pnpm-lock.yaml`。lint 报出的真实问题逐条修，不改规则。

### Task 3: test

为 `src/utils/meta-manager.ts`、`src/config/route-meta.ts`、`src/utils/error-handler.ts` 写单元测试，放在 `apps/site/test/`（`vitest.config.ts` 已 include）。

## Acceptance

- 三项命令退出码均为 0，且不使用 `passWithNoTests`。
- 变异检查：改坏 `MetaManager.update`（例如不再写 `og:title`），对应测试必须变红。
- 全量构建、`pnpm install --frozen-lockfile` 通过。
