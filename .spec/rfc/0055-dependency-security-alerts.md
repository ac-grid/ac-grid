# RFC 0055: 修复 Dependabot 依赖漏洞告警

**Status:** Draft

## Summary

GitHub Dependabot 对默认分支报告 36 条未关闭告警（4 critical、10 high、18 moderate、4 low），涉及 18 个包。本 RFC 把它们降到 0，或为确实不修的项给出理由并关闭。做法是升级直接依赖到已修复版本，对没有直接声明的传递依赖沿用根 `package.json` 现有的 `pnpm.overrides` 手法，不改任何已发布包的运行时依赖范围。

## Problem

已核对的事实（2026-11-08，`gh api repos/ac-grid/ac-grid/dependabot/alerts`）：

- 18 个受影响的包：`storybook`、`@storybook/core`、`vite`、`vitest`、`@vitest/mocker`、`happy-dom`、`tinypool`、`brace-expansion`、`js-yaml`、`glob`、`minimatch`、`uuid`、`ajv`、`source-map-js`、`diff`、`postcss-selector-parser`、`@babel/core`、`echarts`。
- 4 条 critical：`storybook`、`@storybook/core`（需 ≥ 8.6.19）、`tinypool`（需 ≥ 2.1.2，另有一条 ≥ 2.1.1）。
- Dependabot 把 31 条标为 `runtime`、5 条为 `development`，但该标签只是清单分类。除 `echarts` 外，这些包都是构建、测试、文档工具链。`@ac-grid/core` 的 `dependencies`（`theme-base`、`@atlaskit/pragmatic-drag-and-drop`、`@tanstack/table-core`、`@wsxjs/wsx-core`）没有任何一项在告警里。
- 直接声明位置：`storybook` 在根 `package.json` 与 `demos/react/package.json`；`vitest` 在 `core`、`theme-base`、`theme-default`、`apps/site`；`vite` 在 6 个包；`happy-dom` 仅 `apps/site`。
- `tinypool`、`uuid`、`ajv` 没有任何 `package.json` 直接声明，只能经传递依赖修复。
- 根 `package.json` 已有 11 条 `pnpm.overrides`（如 `js-yaml@>=4.0.0 <4.3.1` → `^4.3.1`），其中 `js-yaml` 的下界（4.3.1）低于现在要求的 4.3.2。
- `echarts` 只是 `@ac-grid/charts` 的 peerDependency，范围 `^5.0.0`；修复版本是 6.1.0（大版本）。

## Goals

- 默认分支上 Dependabot 未关闭告警降到 0；确实不修的，在本 RFC 的交付说明里逐条写明理由，并以 "tolerable risk" 关闭而不是放着。
- 升级后所有现有检查仍然通过。
- 不改变 `@ac-grid/core` 与 `@ac-grid/charts` 已发布的 `dependencies`、`peerDependencies` 范围，除非下面"待批准的选择"里明确批准。

## Non-goals

- 不做与告警无关的依赖升级，不顺手升大版本。
- 不引入新的依赖或新的安全扫描工具。
- 不改产品代码与测试逻辑；升级后如有测试因升级而变红，另行说明并单独处理，不在本 RFC 里放宽断言。

## Design

### Task 1：建立告警清单

用 `gh api` 取全部告警，对每条记录：包名、受影响范围、最低修复版本、对应清单文件；再用 `pnpm why <包>` 判断它是直接依赖还是传递依赖，以及由谁引入。结果写入交付说明，作为后面每一步的核对表。

### Task 2：升级直接依赖（同大版本内）

- `storybook` 与相关 `@storybook/*`：到 ≥ 8.6.19（保持 8.x）。
- `vitest`：到 ≥ 4.1.12；`vite`：到 ≥ 6.4.4；`happy-dom`：到 ≥ 21.0.4。
- 版本号统一抬高，避免各 workspace 包出现多个版本。

### Task 3：传递依赖用 overrides 固定

在根 `package.json` 的 `pnpm.overrides` 中，按现有写法（`包@受影响范围: ^修复版本`）为以下项补充或抬高下界：`tinypool`（≥ 2.1.2）、`brace-expansion`（≥ 5.0.12）、`js-yaml`（≥ 4.3.2）、`glob`（≥ 14.0.2）、`minimatch`（≥ 11.0.1）、`uuid`（≥ 11.1.1）、`ajv`（≥ 8.18.0）、`source-map-js`（≥ 1.2.2）、`diff`（≥ 8.0.3）、`postcss-selector-parser`（≥ 6.1.5）、`@babel/core`（≥ 7.29.6）、`@vitest/mocker`（≥ 4.1.12）。优先让 Task 2 的升级自然带走，剩下的才加 override。具体范围以 Task 1 的清单为准，不凭本段猜。

### Task 4：`echarts`（待批准的选择）

告警要求 ≥ 6.1.0，而 `@ac-grid/charts` 的 peer 范围是 `^5.0.0`。改 peer 范围会影响所有使用者，所以不在本 RFC 自行决定。候选：

- A：先确认告警的来源。如果只来自仓库自己的开发安装，把本地开发用的 `echarts` 升到 6.1.0，peer 范围不动，并确认 `packages/charts` 的测试在 5.x、6.x 下都通过后，再决定是否把 peer 范围放宽为 `^5.0.0 || ^6.1.0`。
- B：评估后认为该漏洞对本库的使用方式不可达，以 "tolerable risk" 关闭，并写明理由。

默认走 A 的调查，结论出来后再提请批准，不预设结果。

### Task 5：验证

先在干净工作区执行 `pnpm install`，确认锁文件变更只涉及上述包；然后跑下面 Acceptance 里的全部检查。

## Acceptance

- Dependabot 未关闭告警为 0，或剩余项都在交付说明里有逐条理由并已关闭。验收时重新执行 `gh api repos/ac-grid/ac-grid/dependabot/alerts?state=open` 并贴出计数。
- `pnpm install --frozen-lockfile` 在升级后通过，`pnpm-lock.yaml` 的 diff 已检查，只涉及告警相关的包。
- `packages/core` 全量单测通过，覆盖率阈值（`src/**/*.ts` 为 100%、全局棘轮）不降低。
- `demos/react` 的 e2e 通过，`apps/site` 的构建与 `typecheck`、`lint` 通过，Storybook 能构建。
- 变异检查：把某条 override 临时去掉，对应告警范围内的旧版本必须重新出现在 `pnpm why` 的结果里；恢复后消失。
- 已发布包（`@ac-grid/core`、`@ac-grid/charts` 等）的 `dependencies`、`peerDependencies` 范围，在 `git diff` 中无变化，除非 Task 4 获批。
