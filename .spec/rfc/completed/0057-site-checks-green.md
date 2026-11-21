# RFC 0057: apps/site typecheck, lint and test failures

**Status:** Implemented

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

## Delivery

实现提交 `7f6c662`，已推送到 `origin/main` 并核对远端。

**根因与结果。**

- typecheck：HEAD 的配置下 `tsc --noEmit` 报 `TS2612` 两条、退出码 2；站点 tsconfig 设 `useDefineForClassFields: false` 后退出码 0。wsx 自己的文档对 `@state` 也要求这个设置。
- lint：补声明 `@wsxjs/eslint-plugin-wsx@^0.1.1`、`@eslint/js`、`globals`（`pnpm-lock.yaml` +21 行），`pnpm run lint` 退出码 0、0 个警告。原有 5 个警告一并修掉：`App.wsx` 两个未使用的 import，`vite.config.ts` 三个多余的 `as any`（去掉后类型检查无插件类型错误，`pnpm build` 通过）。
- test：新增 3 个测试文件、26 个测试（`MetaManager`、`getRouteMeta`/`routeMeta`、`ErrorHandler`），`pnpm run test` 退出码 0，没有使用 `--passWithNoTests`。

**验证。** 根目录 `pnpm lint` 5/5、`pnpm test` 8/8（站点 26 个、core 568 个）、`pnpm build` 7/7，`pnpm install --frozen-lockfile` 通过。

**变异检查。** 去掉 `og:title` 写入、`setStructuredData` 不再移除旧脚本、RFC 标题不带 id、`MAX_ERRORS` 改为 11，各自让对应测试变红，恢复后 26/26。

**过程中修正的错误。**

- 测试里最初用 `innerHTML` 清空 `<head>`，被 `wsx/no-inner-html` 报错；改为 `replaceChildren()`，没有动规则。
- 我写的脚本曾把 `apps/site/package.json` 整体从 2 空格重排成 4 空格，已恢复原格式，最终只有 3 行改动。
- rtk 包装器会改写 `pnpm exec tsc` 的输出，出现过不存在的 `TS2882` 假报错；用 `rtk proxy` 和 `node tsc` 复核真实退出码为 0。

**未处理。** 编辑器 LSP 对 `vite.config.ts` 报 `@wsxjs/wsx-press/node` 缺类型声明：第三方包没带 `.d.ts`，`vite.config.ts` 也不在 `tsc` 项目内，不影响任何检查，未处理。
