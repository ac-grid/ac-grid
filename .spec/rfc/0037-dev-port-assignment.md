# RFC 0037: Dev port assignment and Spark registration

**Status:** Approved

**Related:** [0033](./0033-e2e-test-infrastructure.md), [0036](./0036-demo-quality-remediation.md)

## Summary

给 ac-grid 的每个本地监听进程分配固定且不与其他项目冲突的端口，用 `strictPort` 钉死，并登记到个人 Spark 仓库的 `port.md`。项目本身已登记在 Spark 的 `project.md`（"其他（非神名）"表，相对路径 `ac-grid/ac-grid`）。

## Problem

仓库当前的端口与 Spark 注册表冲突或未固定：

| 位置 | 当前端口 | 问题 |
| :--- | :--- | :--- |
| `demos/wsx/vite.config.ts` | 5174（固定） | Spark 已把 5174 登记给 gopdfjs demo |
| `demos/react` `pnpm dev` | 未固定（Vite 默认 5173） | Spark 要求避开 5173 |
| `demos/react` `dev:e2e` 与 Playwright | 5173 | 同上 |
| `demos/react` storybook | 6006 | 未登记 |
| `apps/site` dev 与 preview | 未固定 | 同 5173 |
| `demos/react/src/App.tsx` 徽标 | 文字写 `localhost:5174` | 与实际端口不符 |

多个项目同时开发时会互相抢端口，Playwright 的 `reuseExistingServer: false` 还会因端口被占而整套失败。

## Goals

每个监听进程一个固定端口，全部取自 Spark 未占用段，配置、文档与 Spark 同步。

| 进程 | 端口 | 命令 |
| :--- | :--- | :--- |
| `demos/react` dev | 5198 | `pnpm --filter @ac-grid/demo-react dev` |
| `demos/wsx` dev | 5199 | `pnpm --filter @ac-grid/demo-wsx dev` |
| `apps/site` dev | 5200 | `pnpm --filter @ac-grid/site dev` |
| `demos/react` Playwright e2e | 5201 | `pnpm test:e2e` |
| `apps/site` preview | 5202 | `pnpm --filter @ac-grid/site preview` |
| `demos/react` storybook | 6007 | `pnpm --filter @ac-grid/demo-react storybook` |

## Non-goals

- 不修复 `apps/site` 无法启动的既有问题（`@wsxjs/wsx-press` 未安装），端口仅按配置登记。
- 不为不监听的包（`packages/*`，仅 `vite build --watch`）分配端口。

## Design

- 在 `demos/react/vite.config.ts`、`demos/wsx/vite.config.ts`、`apps/site/vite.config.ts` 设置 `server.port` 与 `strictPort: true`；site 另设 `preview.port`。
- `demos/wsx` 的 `hmr.port` 同步为 5199。
- `demos/react/package.json`：`dev:e2e` 改 `--port 5201`，storybook 改 `-p 6007`；`playwright.config.ts` 默认端口改 5201（仍可由 `PLAYWRIGHT_TEST_PORT` 覆盖）。
- 更新 `App.tsx` 徽标、`rfcValidationDemos.ts` 注释、RFC-0034 中的地址。
- Spark：在 `port.md` 新增 ac-grid 小节，并在"Reserved ranges"登记 5198–5202 与 6007。

## Acceptance

- `demos/react`、`demos/wsx` 在新端口启动并返回 HTTP 200；旧端口 5174 不再被 `demos/wsx` 占用。
- `pnpm test:e2e` 在 5201 启动 dev server 并完成运行，结束后端口释放。
- 任一端口被占用时对应服务启动失败而不是静默换端口。
- `port.md` 的新行与上表一致，且 `grep` 全仓库不再出现 5173/5174/6006 的硬编码（RFC 文档中的历史描述除外）。
