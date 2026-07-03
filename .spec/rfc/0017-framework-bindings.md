# RFC-0017: 框架绑定 (Framework Bindings)

**状态**: 📝 草稿  
**版本**: 0.5.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md)

## 概述

为 AC Grid Web Component 提供 Vue、Angular、Svelte 官方适配层，使各框架用户获得类型安全的声明式 API，对标 AG Grid 的多框架官方绑定。

## 动机

AC Grid 核心是框架无关的 WC；AG Grid Community 为 React/Vue/Angular 提供一等绑定。当前仅有 React demo（`apps/demo-react`），缺少正式 adapter 包与文档。

## 设计目标

- [ ] `@ac-grid/vue` — `defineComponent` + `v-model` 状态同步
- [ ] `@ac-grid/angular` — standalone component + signals/inputs
- [ ] `@ac-grid/svelte` — Svelte 5 runes 包装
- [ ] 事件/属性与 `@ac-grid/core` Grid API 一一映射
- [ ] Tree-shaking 友好，adapter 不重复打包 table-core

### 非目标

- ❌ 替换 WC 核心为框架组件重写
- ❌ Next.js RSC 服务端渲染（v1 范围外）

## 技术方案

每个 adapter 薄包装 `<ac-grid>` 自定义元素，通过 property 绑定 `columnDefs`/`rowData`，通过 CustomEvent 转发 `onSortChanged` 等。

```
Framework App → Adapter Component → <ac-grid> → @ac-grid/core
```

## API 设计

```typescript
// Vue 示例
<AcGrid :column-defs="columns" :row-data="data" @sort-changed="onSort" />
```

## 实现细节

| 阶段 | 内容 | 工期 |
|------|------|------|
| 1 | React adapter 规范化（自 demo 提取） | 3d |
| 2 | Vue 3 adapter + 示例 | 4d |
| 3 | Angular standalone adapter | 5d |
| 4 | Svelte adapter | 3d |

## 测试策略

- 各框架 smoke test + 排序/过滤集成测试
- 属性变更不触发全量 remount

## 开放问题

- [ ] Angular zone.js 与 WC 事件集成策略
- [ ] Svelte SSR hydration 行为

## 参考资料

- [AG Grid Frameworks](https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)
