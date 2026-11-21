# RFC 0058: Runtime test of the ECharts adapter on ECharts 6

**Status:** Implemented

## Summary

RFC 0055 把 `echarts` 从 5 升到 6，并把 `@ac-grid/charts` 的 peer 范围放宽到 `^5.0.0 || ^6.1.0`，但只做了类型检查，没有在运行时验证过适配器。本 RFC 给 `packages/charts` 加一个真实的运行时测试：用真实的 ECharts 6 渲染适配器产出的图表，断言渲染结果。取证时发现升级后适配器的 `textColor` 主题覆盖在 ECharts 6 上失效，一并修复。

## Problem

`createEChartsAdapter` 调用 `echarts.init`、`setOption`、`dispose`，并传入自己拼装的 option。类型检查只证明签名对得上，不证明 ECharts 6 接受这份 option、能渲染、`dispose` 能清理。`packages/charts` 目前没有任何测试，只有 `tsc` 构建，peer 范围的放宽没有证据支撑。

运行时对照（同一份 option，SVG 渲染器，对比图表文字的 `fill`）：ECharts 5.6.0 里全局 `textStyle.color` 会给数值轴文字上色；ECharts 6.1.0 里它不改变任何文字（坐标轴、图例都保持默认 `#54555a`），只有显式写在 `axisLabel.color`、`legend.textStyle.color` 上才生效。所以升级到 6 之后，适配器的 `themeOverrides.textColor` 在数值轴上悄悄失效。Chart.js 适配器已经显式给图例和两个轴设置了颜色，ECharts 适配器没有。

## Goals

- 用真实 ECharts 6（SVG 渲染器，不依赖 canvas）运行适配器，断言：柱状/折线图渲染出带系列名和类别标签的 SVG；饼图渲染出各扇区名；主题覆盖色进入渲染结果；`destroy()` 释放实例。
- `pnpm test` 通过 turbo 运行该测试。

## Non-goals

- 验证 ECharts 5：peer 范围写着支持 5，但仓库只安装 6；本 RFC 只对已安装的版本给出运行时证据，不声称验证了 5。
- 测试 Chart.js 适配器、`integrated-charts.ts` 的网格集成（另行评估）。
- 除 `textColor` 的写法外，不改适配器的其他行为。

## Design

### Task 1: 测试基础

`packages/charts/package.json` 增加 `test` 脚本和 `vitest`、`happy-dom` 开发依赖（版本与其他包一致），并加最小的 `vitest.config.ts`（`environment: "happy-dom"`）。

### Task 2: 适配器 `textColor`

`packages/charts/src/adapters/echarts.ts` 把 `textColor` 显式写到 `legend.textStyle.color`、x 轴和 y 轴的 `axisLabel.color`，与 Chart.js 适配器一致；全局 `textStyle.color` 保留。未提供 `textColor` 时传 `undefined`，保留 ECharts 默认色。

### Task 3: 适配器测试

新增 `packages/charts/test/echarts-adapter.test.ts`：注入一个把 `init(element)` 转成 `echarts.init(element, null, { renderer: "svg", width, height })` 的命名空间，其余全部使用真实 ECharts。

## Acceptance

- `pnpm --filter @ac-grid/charts test` 退出码 0，且断言基于渲染出的 SVG 内容。
- 变异检查：让适配器丢掉系列名、背景色、图例色、x 轴色、y 轴色，或不调用 `dispose`，对应测试必须变红。
- 对照证据：在 ECharts 5.6.0 与 6.1.0 上用同一份 option 比较文字颜色，修复后两者的图例与两个轴文字都带上 `textColor`。
- 全量构建、`pnpm test`、`pnpm install --frozen-lockfile` 通过。

## Delivery

实现提交 `7cce86c`，已推送到 `origin/main` 并核对远端。

**发现。** 用同一份 option、SVG 渲染器、比较图表文字的 `fill`：ECharts 5.6.0 里全局 `textStyle.color` 给数值轴文字上色，ECharts 6.1.0 里它不改变任何文字（坐标轴、图例都保持默认 `#54555a`）。RFC 0055 把 echarts 升到 6 时只做了类型检查，所以适配器的 `themeOverrides.textColor` 在数值轴上悄悄失效没被发现。Chart.js 适配器早已显式给图例和两个轴设置颜色，ECharts 适配器没有。

**修复与对照。** 适配器把 `textColor` 显式写到 `legend.textStyle.color` 与 x、y 轴的 `axisLabel.color`。同一份修复后的 option 在 5.6.0 和 6.1.0 上各渲染一次：两个版本的 8 个文字节点全部带上 `textColor`。

**验证。**

- `packages/charts` 的第一批测试：6 个，全部使用真实 ECharts 6（SVG 渲染器），覆盖柱状、折线、饼图、主题色（背景、系列色、图例与两个轴的文字色）、无覆盖时保留默认色、`destroy()`。
- 根目录 `pnpm build` 7/7、`pnpm lint` 5/5、`pnpm test` 9/9（core 568、site 26、charts 6），`pnpm install --frozen-lockfile` 通过。

**变异检查。** 删掉图例色、x 轴色、y 轴色、系列名、`dispose`、背景色，各自让对应测试变红，恢复后 6/6。

**过程中修正的错误。** 第一版主题测试只断言颜色字符串出现过，会被其他元素掩盖；改为断言图例、类别轴、数值轴各自文字节点的 `fill`。

**未覆盖。** 只对仓库安装的 ECharts 6 跑了测试；ECharts 5 只用一次性的脚本做了对照，没有放进测试（仓库不安装 5）。Chart.js 适配器和 `integrated-charts.ts` 与网格的集成仍没有测试。
