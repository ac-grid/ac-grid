# RFC: AC Grid - 基于 Web Components 的数据表格组件库

**状态**: 规划中  
**版本**: 0.0.1 → 1.0.0  
**日期**: 2024-2026  
**作者**: Albert Li  
**最后更新**: 2026-01-24

## 目录

- [概述](#概述)
- [背景与动机](#背景与动机)
- [ag-Grid 社区版功能对比](#ag-grid-社区版功能对比)
- [技术选型](#技术选型)
- [架构设计](#架构设计)
- [实现细节](#实现细节)
- [功能实现路线图](#功能实现路线图)
- [API 设计](#api-设计)
- [性能指标与测试标准](#性能指标与测试标准)
- [已知问题与限制](#已知问题与限制)
- [版本规划](#版本规划)

## 概述

AC Grid 是一个高性能的数据表格组件库，旨在作为 AG Grid 的替代方案。与 AG Grid 不同，AC Grid 基于原生 Web Components 技术栈构建，不依赖任何前端框架（如 React、Vue、Angular），同时提供类似的功能和性能。

### 核心特性（v0.0.1 已实现）

- ✅ **框架无关**: 基于 Web Components 标准，可在任何框架或纯 HTML 中使用
- ✅ **类型安全**: 完整的 TypeScript 支持
- ✅ **列拖拽重排序**: 支持列的拖拽重排序功能
- ✅ **行拖拽重排序**: 支持行的拖拽重排序功能
- ✅ **灵活渲染**: 支持自定义单元格、表头和表尾渲染
- ✅ **状态管理**: 基于 `@tanstack/table-core` 的强大状态管理
- ✅ **Monorepo 架构**: 使用 pnpm + Turborepo 管理多包项目

### 计划特性（详见各功能 RFC）

- 🚧 **排序功能**: 单列/多列排序，自定义排序函数 ([RFC-0002](./0002-sorting-feature.md))
- 📝 **过滤功能**: 列过滤、全局搜索 ([RFC-0003](./0003-filtering-feature.md))
- ✅ **虚拟滚动**: 行虚拟化已落地 ([RFC-0005](./completed/0005-virtual-scrolling.md))
- 📝 **分页**: 前端分页和服务端分页 ([RFC-0006](./0006-pagination.md))
- 📝 **行选择**: 单选/多选模式 ([RFC-0007](./0007-row-selection.md))
- 📝 **单元格编辑**: 内联编辑 ([RFC-0009](./0009-cell-editing.md))
- 📝 **主题系统**: 可定制主题 ([RFC-0011](./0011-theme-system.md))

> 📖 **完整功能列表和实现状态**，请查看 [RFC 索引](./README.md)

## 背景与动机

### AG Grid 的工作原理

AG Grid 是一个成熟的数据网格库，其核心架构包括：

1. **核心引擎**: 数据管理、虚拟滚动、渲染优化
2. **列系统**: 列定义、排序、过滤、调整大小、重排序
3. **行系统**: 行渲染、选择、分组、聚合
4. **交互层**: 拖拽、编辑、键盘导航
5. **虚拟化**: 仅渲染可见区域，支持大数据集
6. **框架适配**: 通过适配器支持 React/Angular/Vue

### 为什么创建 AC Grid？

1. **框架无关性**: 希望有一个不依赖特定前端框架的表格解决方案
2. **Web Components 标准**: 利用原生 Web Components 标准，提供更好的互操作性
3. **轻量级**: 避免引入大型框架依赖，减少包体积
4. **学习与创新**: 深入理解表格组件的实现原理，探索新的技术可能性

## ag-Grid 社区版功能对比

下表对比了 ag-Grid 社区版的核心功能和 AC Grid 的实现状态：

| 功能分类                 | ag-Grid 社区版 | AC Grid 状态 | RFC                                         | 预计版本 |
| ------------------------ | -------------- | ------------ | ------------------------------------------- | -------- |
| **基础功能**             |
| 数据渲染                 | ✅             | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| 列定义                   | ✅             | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| 自定义单元格渲染         | ✅             | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| **数据操作**             |
| 排序（单列）             | ✅             | ✅ 已实现    | [0002](./completed/0002-sorting-feature.md) | v0.1.0   |
| 排序（多列）             | ✅             | ✅ 已实现    | [0002](./completed/0002-sorting-feature.md) | v0.1.0   |
| 过滤（列过滤）           | ✅             | ✅ 已实现    | [0003](./0003-filtering-feature.md)         | v0.1.0   |
| 过滤（全局搜索）         | ✅             | ✅ 已实现    | [0003](./0003-filtering-feature.md)         | v0.1.0   |
| 快速过滤                 | ✅             | ✅ 已实现    | [0003](./0003-filtering-feature.md)         | v0.1.0   |
| **布局和显示**           |
| 列调整大小               | ✅             | ✔️ 已完成    | [0004](./completed/0004-column-resizing.md)           | v0.1.0   |
| 列重排序                 | ✅             | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| 列固定（Pinning）        | ✅             | 📝 规划中    | [0008](./0008-column-pinning.md)            | v0.3.0   |
| 自动列宽                 | ✅             | ✔️ 已完成    | [0004](./completed/0004-column-resizing.md)           | v0.1.0   |
| **性能优化**             |
| 虚拟滚动（行）           | ✅             | ✅ 已实现    | [0005](./completed/0005-virtual-scrolling.md) | v0.2.0   |
| 虚拟滚动（列）           | ✅             | 📝 规划中    | [0005](./completed/0005-virtual-scrolling.md) | v0.2.0   |
| 大数据集支持（100K+ 行） | ✅             | 📝 规划中    | [0005](./completed/0005-virtual-scrolling.md) | v0.2.0   |
| **交互功能**             |
| 分页                     | ✅             | 📝 规划中    | [0006](./0006-pagination.md)                | v0.2.0   |
| 行选择（单选）           | ✅             | 📝 规划中    | [0007](./0007-row-selection.md)             | v0.2.0   |
| 行选择（多选）           | ✅             | 📝 规划中    | [0007](./0007-row-selection.md)             | v0.2.0   |
| 范围选择                 | ✅             | 📝 规划中    | [0007](./0007-row-selection.md)             | v0.2.0   |
| 行拖拽重排序             | ✅             | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| 单元格编辑               | ✅             | 📝 规划中    | [0009](./0009-cell-editing.md)              | v0.3.0   |
| 键盘导航                 | ✅             | 📝 规划中    | [0012](./0012-keyboard-navigation.md)       | v0.4.0   |
| **高级功能**             |
| 行分组                   | ✅             | 📝 规划中    | [0010](./0010-grouping-aggregation.md)      | v0.3.0   |
| 数据聚合                 | ✅             | 📝 规划中    | [0010](./0010-grouping-aggregation.md)      | v0.3.0   |
| 树形数据                 | ✅             | 📝 规划中    | TBD                                         | v0.6.0+  |
| 主从表格                 | ✅             | 📝 规划中    | TBD                                         | v0.6.0+  |
| **用户体验**             |
| 主题定制                 | ✅             | 📝 规划中    | [0011](./0011-theme-system.md)              | v0.4.0   |
| 国际化 (i18n)            | ✅             | 📝 规划中    | [0015](./0015-internationalization.md)      | v0.5.0   |
| 可访问性 (a11y)          | ✅             | 📝 规划中    | [0013](./0013-accessibility.md)             | v0.4.0   |
| **数据导出**             |
| CSV 导出                 | ✅             | 📝 规划中    | [0014](./0014-data-export.md)               | v0.5.0   |
| Excel 导出               | ✅             | 📝 规划中    | [0014](./0014-data-export.md)               | v0.5.0   |
| **框架集成**             |
| 纯 JavaScript            | ✅             | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| React                    | ✅ (官方)      | ✅ 已实现    | [0001](./0001-ac-grid-architecture.md)      | v0.0.1   |
| Vue                      | ✅ (官方)      | 📝 规划中    | TBD                                         | v1.0.0+  |
| Angular                  | ✅ (官方)      | 📝 规划中    | TBD                                         | v1.0.0+  |

**图例**：

- ✅ **已实现**: 功能已完成并可用
- 🚧 **规划中**: RFC 已编写，等待或正在实施
- 📝 **待规划**: 已列入路线图，RFC 待编写
- ❌ **不支持**: 不在当前规划范围内
- TBD: To Be Determined（待定）

> 📌 **注意**: AC Grid 的目标是实现 ag-Grid 社区版的核心功能，但实现方式基于 Web Components 标准，API 设计会有所不同。

## 技术选型

### 核心技术栈

#### 1. **wsxjs** (`@wsxjs/wsx-core`)

- **作用**: 提供 JSX 语法支持，用于编写 Web Components
- **选择理由**:
  - 允许使用熟悉的 JSX 语法编写 Web Components
  - 提供 `@state` 装饰器实现响应式状态管理
  - 自动注册自定义元素（`@autoRegister`）
  - 轻量级，无 React 依赖

#### 2. **@tanstack/table-core**

- **作用**: 提供表格状态管理和核心逻辑
- **选择理由**:
  - 框架无关的表格核心库
  - 强大的状态管理能力（排序、过滤、分页等）
  - 类型安全的 API
  - 活跃的社区和维护

#### 3. **@atlaskit/pragmatic-drag-and-drop**

- **作用**: 实现拖拽功能
- **选择理由**:
  - 框架无关的拖拽库
  - 性能优秀
  - 支持复杂的拖拽场景
  - 由 Atlassian 维护，稳定可靠

#### 4. **Monorepo 工具链**

- **pnpm**: 包管理器，支持 workspace
- **Turborepo**: 构建系统，提供高效的缓存和并行执行
- **Vite**: 构建工具，提供快速的开发体验

### 技术决策

#### 为什么选择 wsxjs 而不是直接使用原生 Web Components？

1. **开发体验**: JSX 语法比原生 DOM API 更直观和高效
2. **类型安全**: TypeScript 支持更好
3. **状态管理**: `@state` 装饰器简化了响应式状态管理
4. **组件化**: 更好的组件抽象和复用

#### 为什么选择 @tanstack/table-core 而不是自研？

1. **成熟度**: 经过大量项目验证，稳定可靠
2. **功能完整**: 提供完整的表格功能（排序、过滤、分页等）
3. **可扩展**: 插件化架构，易于扩展
4. **类型安全**: 完整的 TypeScript 类型定义

## 架构设计

### 项目结构

```
ac-grid/
├── packages/
│   └── ac-grid-core/          # 核心组件库
│       ├── src/
│       │   ├── components/    # 组件实现
│       │   │   ├── Grid.wsx                    # 主表格组件
│       │   │   ├── DraggableTableHeader.wsx   # 可拖拽表头
│       │   │   ├── DraggableTableRow.wsx       # 可拖拽表格行
│       │   │   ├── DraggableTableCell.wsx     # 可拖拽单元格
│       │   │   └── DraggableHandler.wsx        # 拖拽手柄
│       │   └── utils/         # 工具函数
│       │       ├── flex-render.ts              # 渲染工具（替代 React 的 flexRender）
│       │       └── array-move.ts              # 数组移动工具
│       ├── package.json
│       └── vite.config.ts
├── apps/
│   └── demo-wsx/              # WSX 演示应用
│       ├── src/
│       │   ├── App.wsx         # 主应用组件
│       │   └── makeData.ts     # 测试数据生成
│       └── vite.config.ts
├── pnpm-workspace.yaml        # pnpm workspace 配置
├── turbo.json                 # Turborepo 配置
└── package.json               # 根 package.json
```

### 组件层次结构

```
wsx-ac-grid (Grid)
├── thead
│   └── wsx-ac-draggable-table-header (DraggableTableHeader)
│       └── flexRender(header) 或自定义组件
├── tbody
│   └── wsx-ac-draggable-table-row (DraggableTableRow)
│       └── wsx-ac-draggable-table-cell (DraggableTableCell)
│           └── flexRender(cell) 或自定义组件
│               └── wsx-ac-draggable-handler (DraggableHandler) [可选]
└── tfoot
    └── flexRender(footer)
```

### 数据流

```
用户数据 (data, columns)
    ↓
Grid 组件接收 (通过 property)
    ↓
updateTable() 创建 @tanstack/table-core 实例
    ↓
table.getHeaderGroups() / table.getRowModel()
    ↓
渲染 DraggableTableHeader / DraggableTableRow
    ↓
flexRender() 渲染单元格内容
    ↓
DOM 更新（通过 wsxjs 的 @state 装饰器自动触发）
```

## 实现细节

### 1. Web Components 属性处理

#### 问题

在 Web Components 中，复杂对象（如数组、对象）不能直接作为 HTML 属性传递，因为属性只能是字符串。

#### 解决方案

使用 **property** 而非 **attribute** 传递复杂数据。

**在 JSX 环境中（wsxjs）**:

```typescript
// ✅ 正确：通过 property 传递（wsx 的 JSX 会自动处理）
<wsx-ac-grid data={data} columns={columns} />
```

**在纯 HTML/JavaScript 环境中**:

```typescript
// ❌ 错误：JSX 语法在纯 JavaScript 中不可用
<wsx-ac-grid data={data} columns={columns} />

// ✅ 正确：使用 createGrid 工具函数
import { createGrid } from '@ac-grid/core';

const gridElement = createGrid({
  data: myData,
  columns: myColumns,
  className: 'my-grid'
});

document.body.appendChild(gridElement);
```

**为什么需要 createGrid？**
在非 JSX 环境中，不能直接使用 JSX 语法。`createGrid` 函数通过 DOM API 创建元素，并通过 **property**（而非 attribute）正确设置复杂数据：

```typescript
// createGrid 内部实现
const gridElement = document.createElement("wsx-ac-grid");
gridElement.data = data; // ✅ property，支持复杂对象
gridElement.columns = columns; // ✅ property，支持复杂对象
// 而不是 setAttribute('data', ...)，因为 attribute 只能是字符串
```

#### 实现方式

1. **定义 property getter/setter**:

```typescript
get data(): any[] {
    return this._data;
}
set data(value: any[]) {
    if (Array.isArray(value) && value !== this._data) {
        this._data = value;
        this.gridData = [...value];
        this.updateTable();
    }
}
@state private _data: any[] = [];
```

2. **在 `onConnected` 中读取 property**:

```typescript
onConnected() {
    super.onConnected?.();
    const element = this as any;
    if (element.data && Array.isArray(element.data)) {
        this.data = element.data;
    }
}
```

3. **简化 `observedAttributes`**:

```typescript
// 只观察简单的字符串属性
static observedAttributes = ["class-name"];
```

### 2. flexRender 实现

#### 问题

`@tanstack/table-core` 的 `flexRender` 是 React 专用的，在 Web Components 环境中不可用。

#### 解决方案

实现自定义的 `flexRender` 函数，支持 wsx 的 JSX 元素（HTMLElement）：

```typescript
export function flexRender<T>(
  render: string | number | boolean | null | undefined | ((context: T) => any),
  context: T,
): HTMLElement | string | number | null {
  if (render == null) {
    return null;
  }

  if (typeof render === "function") {
    const result = render(context);
    // wsx 的 JSX 返回 HTMLElement，直接返回
    if (result instanceof HTMLElement) {
      return result;
    }
    return result ?? null;
  }

  return render;
}
```

#### 关键点

- **直接返回 HTMLElement**: 不转换为字符串，保持 DOM 元素的完整性
- **支持基本类型**: 字符串、数字、布尔值等
- **类型安全**: 完整的 TypeScript 类型定义

### 3. 状态初始化

#### 问题

`@tanstack/table-core` 的某些状态（如 `columnPinning`、`columnSizing`）需要显式初始化，否则会报错。

#### 解决方案

在 `updateTable()` 中初始化所有必需的状态：

```typescript
private updateTable() {
    // 从列定义中提取初始列大小
    const initialColumnSizing: Record<string, number> = {};
    this._columns.forEach((col) => {
        if (col.id && typeof col.size === "number") {
            initialColumnSizing[col.id] = col.size;
        }
    });

    this.table = createTable({
        data: this.gridData,
        columns: this._columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            columnOrder: this.columnOrder,
            // 初始化 columnPinning 状态
            columnPinning: {
                left: [],
                right: [],
            },
            // 初始化 columnSizing 状态
            columnSizing: initialColumnSizing,
        },
        // ...
    });
}
```

### 4. 拖拽功能实现

#### 列拖拽

使用 `@atlaskit/pragmatic-drag-and-drop` 实现列拖拽：

```typescript
// 在 DraggableTableHeader 中
private setupDragAndDrop() {
    const element = this as unknown as HTMLElement;
    const columnId = this._header.column?.id;

    // 设置为可拖拽
    const draggableCleanup = draggable({
        element,
        getInitialData: () => ({ columnId }),
        onDragStart: () => {
            this.isDragging = true;
        },
        onDrop: () => {
            this.isDragging = false;
        },
    });

    // 设置为可放置目标
    const dropTargetCleanup = dropTargetForElements({
        element,
        getData: () => ({ columnId }),
        onDrop: ({ source }) => {
            const activeId = source.data.columnId as string;
            const overId = columnId;
            if (activeId && activeId !== overId) {
                this._onDragEnd?.(activeId, overId);
            }
        },
    });

    this.cleanupFn = () => {
        draggableCleanup();
        dropTargetCleanup();
    };
}
```

#### 行拖拽

类似地，在 `DraggableTableRow` 中实现行拖拽。

#### 关键点

- **延迟初始化**: 使用 `requestAnimationFrame` 确保元素完全渲染后再初始化拖拽
- **清理函数**: 在 `onDisconnected` 中清理拖拽监听器
- **可见性检查**: 确保元素在 DOM 中且可见后再初始化

### 5. 响应式更新

#### 使用 `@state` 装饰器

wsxjs 的 `@state` 装饰器自动处理响应式更新：

```typescript
@state private _data: any[] = [];
@state private columnOrder: string[] = [];
```

当这些状态变化时，wsxjs 会自动触发 `render()` 方法重新渲染组件。

#### 避免手动调用 `render()`

不需要手动调用 `this.render()`，`@state` 装饰器会自动处理。

## API 设计

### Grid 组件

```typescript
interface GridProps<TData extends { userId?: string }> {
  /**
   * 数据源
   */
  data: TData[];
  /**
   * 列定义（基于 @tanstack/table-core 的 ColumnDef）
   */
  columns: ColumnDef<TData, any>[];
  /**
   * 自定义类名
   */
  className?: string;
}
```

#### 使用示例

**在 JSX 环境中（wsxjs）**:

```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister, state } from "@wsxjs/wsx-core";
import { type ColumnDef } from "@ac-grid/core";
import "@ac-grid/core";

@autoRegister({ tagName: "wsx-app" })
export class App extends LightComponent {
    @state private data = makeData(20);
    @state private columns: ColumnDef<Person>[] = [
        {
            id: "drag-handle",
            header: "Move",
            cell: ({ row }) => (
                <wsx-ac-draggable-handler rowId={row.original.userId} />
            ),
            size: 60,
        },
        {
            accessorKey: "firstName",
            cell: (info) => info.getValue(),
            id: "firstName",
            header: "First Name",
            size: 150,
        },
        // ...
    ];

    render() {
        return (
            <div className="p-2">
                <wsx-ac-grid data={this.data} columns={this.columns} />
            </div>
        );
    }
}
```

**在纯 HTML/JavaScript 环境中**:

```typescript
import { createGrid, type ColumnDef } from "@ac-grid/core";

// 定义列
const columns: ColumnDef<Person>[] = [
  {
    id: "firstName",
    accessorKey: "firstName",
    header: "First Name",
    size: 150,
  },
  {
    id: "lastName",
    accessorKey: "lastName",
    header: "Last Name",
    size: 150,
  },
  // ...
];

// 创建 Grid 并挂载
const gridElement = createGrid({
  data: myData,
  columns: columns,
  className: "my-grid",
});

// 方式 1: 手动挂载
document.getElementById("app")?.appendChild(gridElement);

// 方式 2: 自动挂载（通过 container 选项）
createGrid({
  data: myData,
  columns: columns,
  className: "my-grid",
  container: document.getElementById("app")!,
});
```

**在 HTML 中直接使用**:

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import { createGrid } from "./node_modules/@ac-grid/core/dist/index.js";

      const data = [
        { firstName: "John", lastName: "Doe" },
        { firstName: "Jane", lastName: "Smith" },
      ];

      const columns = [
        { id: "firstName", accessorKey: "firstName", header: "First Name" },
        { id: "lastName", accessorKey: "lastName", header: "Last Name" },
      ];

      createGrid({
        data,
        columns,
        container: document.getElementById("app"),
      });
    </script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

### DraggableHandler 组件

```typescript
interface DraggableHandlerProps {
  /**
   * 行 ID
   */
  rowId: string;
  /**
   * 拖拽开始回调
   */
  onDragStart?: (id: string) => void;
  /**
   * 拖拽结束回调
   */
  onDragEnd?: (id: string) => void;
}
```

## 已知问题与限制

### 1. 浏览器兼容性

- **Web Components**: 需要支持 Custom Elements 和 Shadow DOM 的浏览器
- **现代浏览器**: Chrome、Firefox、Safari、Edge 的最新版本

### 2. 性能考虑

- **大数据集**: 当前未实现虚拟滚动，大数据集可能影响性能
- **未来优化**: 计划添加虚拟滚动支持

### 3. 功能限制

- **排序/过滤**: 当前未实现，但 `@tanstack/table-core` 支持，可以扩展
- **分页**: 当前未实现，但可以扩展
- **列调整大小**: 当前未实现，但可以扩展

### 4. 开发体验

- **调试**: Web Components 的调试相对复杂，需要熟悉浏览器 DevTools
- **类型提示**: 某些情况下 TypeScript 类型提示可能不够完善

### 5. 非 JSX 环境使用

- **JSX 语法限制**: 在纯 HTML/JavaScript 环境中，不能直接使用 JSX 语法 `<wsx-ac-grid data={data} />`
- **解决方案**: 使用 `createGrid` 工具函数来创建和配置 Grid 组件
- **原因**: 复杂对象（如数组、对象）必须通过 property 传递，而不能通过 attribute 传递。`createGrid` 确保正确使用 property API

## 版本规划

AC Grid 采用**渐进式功能扩展**策略，每个版本聚焦一组相关功能。详细的功能设计请参考各自的 RFC 文档。

### v0.1.0 - 基础数据操作（预计 3-4 周）

**目标**: 实现表格的核心数据操作功能

| 功能       | RFC                                     | 状态      | 优先级 |
| ---------- | --------------------------------------- | --------- | ------ |
| 排序功能   | [RFC-0002](./0002-sorting-feature.md)   | 🚧 实施中 | P0     |
| 过滤功能   | [RFC-0003](./0003-filtering-feature.md) | 📝 待编写 | P0     |
| 列调整大小 | [RFC-0004](./completed/0004-column-resizing.md)   | ✔️ 已完成 | P1     |

**交付物**：

- [ ] 排序功能（单列/多列）
- [ ] 列过滤和全局搜索
- [ ] 列宽度拖拽调整
- [ ] 完整的单元测试覆盖
- [ ] Storybook 示例

---

### v0.2.0 - 性能和交互优化（预计 3-4 周）

**目标**: 支持大数据集和增强用户交互

| 功能     | RFC                                     | 状态      | 优先级 |
| -------- | --------------------------------------- | --------- | ------ |
| 虚拟滚动 | [RFC-0005](./completed/0005-virtual-scrolling.md) | ✔️ 已完成 | P0     |
| 分页功能 | [RFC-0006](./0006-pagination.md)        | 📝 待编写 | P0     |
| 行选择   | [RFC-0007](./0007-row-selection.md)     | 📝 待编写 | P1     |

**交付物**：

- [ ] 行虚拟滚动（支持 100K+ 行）
- [ ] 前端和服务端分页
- [ ] 行选择（单选/多选）
- [ ] 性能测试报告
- [ ] 优化文档

---

### v0.3.0 - 高级功能（预计 4-5 周）

**目标**: 实现高级表格功能

| 功能       | RFC                                        | 状态      | 优先级 |
| ---------- | ------------------------------------------ | --------- | ------ |
| 列固定     | [RFC-0008](./0008-column-pinning.md)       | 📝 待编写 | P1     |
| 单元格编辑 | [RFC-0009](./0009-cell-editing.md)         | 📝 待编写 | P0     |
| 分组和聚合 | [RFC-0010](./0010-grouping-aggregation.md) | 📝 待编写 | P1     |

**交付物**：

- [ ] 列固定（左侧/右侧）
- [ ] 内联单元格编辑
- [ ] 行分组和数据聚合
- [ ] 集成测试
- [ ] 高级功能示例

---

### v0.4.0 - 用户体验（预计 3 周）

**目标**: 提升用户体验和可用性

| 功能     | RFC                                       | 状态      | 优先级 |
| -------- | ----------------------------------------- | --------- | ------ |
| 主题系统 | [RFC-0011](./0011-theme-system.md)        | 📝 待编写 | P0     |
| 键盘导航 | [RFC-0012](./0012-keyboard-navigation.md) | 📝 待编写 | P1     |
| 可访问性 | [RFC-0013](./0013-accessibility.md)       | 📝 待编写 | P0     |

**交付物**：

- [ ] 主题系统（Light/Dark/自定义）
- [ ] 完整的键盘导航
- [ ] ARIA 属性和可访问性支持
- [ ] 主题定制文档
- [ ] 可访问性测试报告

---

### v0.5.0 - 数据导出和国际化（预计 2 周）

**目标**: 完善数据导出和多语言支持

| 功能     | RFC                                        | 状态      | 优先级 |
| -------- | ------------------------------------------ | --------- | ------ |
| 数据导出 | [RFC-0014](./0014-data-export.md)          | 📝 待编写 | P1     |
| 国际化   | [RFC-0015](./0015-internationalization.md) | 📝 待编写 | P1     |

**交付物**：

- [ ] CSV 和 Excel 导出
- [ ] 多语言支持（中文/英文/其他）
- [ ] 日期和数字格式化
- [ ] 国际化文档

---

### v1.0.0 - 正式版本（预计 TBD）

**目标**: 生产就绪，完整的功能和文档

**里程碑**：

- [ ] 所有 v0.x 功能稳定
- [ ] 完整的 API 文档
- [ ] 性能基准测试
- [ ] 100% 测试覆盖率
- [ ] 完整的 Storybook 文档
- [ ] 迁移指南和最佳实践
- [ ] 社区贡献指南

---

### 未来版本（v1.1.0+）

计划中的功能（优先级待定）：

- 服务端排序和过滤
- 树形数据展示
- 主从表格（Master-Detail）
- 右键菜单
- 列配置持久化
- Vue 和 Angular 适配器
- 图表集成
- 打印功能

> 📌 **灵活调整**: 版本规划会根据用户反馈和实际需求动态调整。每个功能的详细设计请参考对应的 RFC 文档。

> 📖 **RFC 索引**: 查看 [docs/rfc/README.md](./README.md) 了解所有 RFC 的状态和详情。

## 已实现功能的 Bug 修复记录

### Drag & Drop 功能修复 (2025-02-15)

#### 问题描述

原始实现中，拖拽功能存在以下问题：

1. **组件未集成**: `DraggableTableHeader` 和 `DraggableTableRow` 组件虽然存在，但 `Grid.wsx` 组件渲染时使用的是普通 `<div>` 元素，从未实例化拖拽组件
2. **事件回调未绑定**: `handleColumnDragEnd()` 和 `handleRowDragEnd()` 方法已定义但从未被调用
3. **无视觉反馈**: 拖拽过程中没有视觉反馈，用户体验不佳

#### 修复内容

**1. 直接集成拖拽功能到 Grid.wsx**

不再依赖独立的 `DraggableTableHeader` 和 `DraggableTableRow` 组件，而是直接在 `Grid.wsx` 的渲染逻辑中集成 `@atlaskit/pragmatic-drag-and-drop`：

```typescript
// 导入拖拽库
import {
    draggable,
    dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

// 在 header cell 的 ref 回调中初始化拖拽
ref={(el: HTMLElement | null) => {
    if (el) {
        const columnId = column.id;

        // 清理现有监听器
        const existingCleanup = this.headerDragCleanup.get(columnId);
        if (existingCleanup) existingCleanup();

        // 设置为可拖拽
        const dragCleanup = draggable({
            element: el,
            getInitialData: () => ({ columnId }),
            onDragStart: () => { this.draggingColumnId = columnId; },
            onDragEnd: () => { this.draggingColumnId = null; },
        });

        // 设置为可放置目标
        const dropCleanup = dropTargetForElements({
            element: el,
            getData: () => ({ columnId }),
            onDragEnter: () => { /* 视觉反馈 */ },
            onDragLeave: () => { /* 清理视觉反馈 */ },
            onDrop: ({ source }) => {
                this.handleColumnDragEnd(
                    source.data.columnId as string,
                    columnId
                );
            },
        });

        // 存储清理函数
        this.headerDragCleanup.set(columnId, () => {
            dragCleanup();
            dropCleanup();
        });
    }
}}
```

**2. 添加状态追踪实现视觉反馈**

```typescript
@state private draggingColumnId: string | null = null;
@state private dragOverColumnId: string | null = null;
@state private draggingRowId: string | null = null;
@state private dragOverRowId: string | null = null;
```

**3. 列级视觉反馈**

当拖拽列时，整个列（包括表头和所有单元格）都会显示视觉反馈：

```typescript
// 在渲染单元格时检查列拖拽状态
const isColumnDragging = this.draggingColumnId === column.id;
const isColumnDragOver = this.dragOverColumnId === column.id;

className={`grid-cell ${isColumnDragging ? 'column-dragging' : ''} ${isColumnDragOver ? 'column-drag-over' : ''}`}
```

**4. CSS 视觉样式**

```css
/* 表头拖拽状态 */
.ac-grid .grid-header-cell.dragging {
  opacity: 0.7;
  background-color: var(--ac-grid-bg-selected, #e6f7ff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 整列拖拽状态 */
.ac-grid .grid-cell.column-dragging {
  background-color: var(--ac-grid-bg-selected, #e6f7ff);
  opacity: 0.8;
}

/* 整列放置目标状态 */
.ac-grid .grid-cell.column-drag-over {
  background-color: var(--ac-grid-bg-hover, #e8f4fd);
}
```

**5. 添加生命周期清理**

```typescript
onDisconnected() {
    super.onDisconnected?.();

    // 清理列拖拽监听器
    this.headerDragCleanup.forEach((cleanup) => cleanup());
    this.headerDragCleanup.clear();

    // 清理行拖拽监听器
    this.rowDragCleanup.forEach((cleanup) => cleanup());
    this.rowDragCleanup.clear();
}
```

**6. 添加单元测试**

新增 `test/drag-drop.test.ts`，包含 15 个测试用例：

- `arrayMove` 工具函数测试
- 列重排序逻辑测试
- 行重排序逻辑测试
- 拖拽状态追踪测试
- 列级视觉反馈测试

#### 测试结果

```
✓ test/filter-functions.test.ts (6 tests)
✓ test/filtering.test.ts (2 tests)
✓ test/drag-drop.test.ts (15 tests)

Test Files: 3 passed
Tests: 23 passed
Build: ✓ Success
```

#### 当前状态

- ✅ 列拖拽重排序 - 完整实现，包含视觉反馈
- ✅ 行拖拽重排序 - 完整实现，包含视觉反馈
- ✅ 列级视觉反馈 - 拖拽时整列高亮
- ✅ 单元测试覆盖 - 15 个测试用例
- ✅ 内存泄漏防护 - 组件卸载时正确清理监听器

## 总结

AC Grid 是一个基于 Web Components 标准的数据表格组件库，通过结合 wsxjs、@tanstack/table-core 和 @atlaskit/pragmatic-drag-and-drop，实现了框架无关、类型安全、功能丰富的表格解决方案。

### 核心优势

1. **框架无关**: 可在任何环境中使用
2. **标准技术**: 基于 Web Components 标准
3. **类型安全**: 完整的 TypeScript 支持
4. **可扩展**: 基于成熟的库构建，易于扩展

### 技术亮点

1. **Property vs Attribute**: 正确处理复杂数据的传递
2. **自定义 flexRender**: 适配 wsx 的 JSX 元素
3. **状态管理**: 利用 `@state` 装饰器实现响应式更新
4. **拖拽实现**: 使用 pragmatic-drag-and-drop 实现流畅的拖拽体验

AC Grid 为开发者提供了一个现代化的、框架无关的数据表格解决方案，同时保持了良好的开发体验和类型安全。
