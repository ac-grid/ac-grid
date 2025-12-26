# RFC: AC Grid - 基于 Web Components 的数据表格组件库

**状态**: 已实现  
**版本**: 0.0.1  
**日期**: 2024  
**作者**: Albert Li

## 目录

- [概述](#概述)
- [背景与动机](#背景与动机)
- [技术选型](#技术选型)
- [架构设计](#架构设计)
- [实现细节](#实现细节)
- [API 设计](#api-设计)
- [已知问题与限制](#已知问题与限制)
- [未来计划](#未来计划)

## 概述

AC Grid 是一个高性能的数据表格组件库，旨在作为 AG Grid 的替代方案。与 AG Grid 不同，AC Grid 基于原生 Web Components 技术栈构建，不依赖任何前端框架（如 React、Vue、Angular），同时提供类似的功能和性能。

### 核心特性

- ✅ **框架无关**: 基于 Web Components 标准，可在任何框架或纯 HTML 中使用
- ✅ **类型安全**: 完整的 TypeScript 支持
- ✅ **列拖拽重排序**: 支持列的拖拽重排序功能
- ✅ **行拖拽重排序**: 支持行的拖拽重排序功能
- ✅ **灵活渲染**: 支持自定义单元格、表头和表尾渲染
- ✅ **状态管理**: 基于 `@tanstack/table-core` 的强大状态管理
- ✅ **Monorepo 架构**: 使用 pnpm + Turborepo 管理多包项目

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
import { createGrid } from '@systembug/ac-grid-core';

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
gridElement.data = data;        // ✅ property，支持复杂对象
gridElement.columns = columns;  // ✅ property，支持复杂对象
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
    context: T
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
import { type ColumnDef } from "@systembug/ac-grid-core";
import "@systembug/ac-grid-core";

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
import { createGrid, type ColumnDef } from '@systembug/ac-grid-core';

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
    className: 'my-grid'
});

// 方式 1: 手动挂载
document.getElementById('app')?.appendChild(gridElement);

// 方式 2: 自动挂载（通过 container 选项）
createGrid({
    data: myData,
    columns: columns,
    className: 'my-grid',
    container: document.getElementById('app')!
});
```

**在 HTML 中直接使用**:
```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import { createGrid } from './node_modules/@systembug/ac-grid-core/dist/index.js';
        
        const data = [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Smith' }
        ];
        
        const columns = [
            { id: 'firstName', accessorKey: 'firstName', header: 'First Name' },
            { id: 'lastName', accessorKey: 'lastName', header: 'Last Name' }
        ];
        
        createGrid({
            data,
            columns,
            container: document.getElementById('app')
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

## 未来计划

### 短期（v0.1.0）
- [ ] 添加列调整大小功能
- [ ] 添加排序功能
- [ ] 添加过滤功能
- [ ] 完善文档和示例
- [ ] 添加单元测试

### 中期（v0.2.0）
- [ ] 实现虚拟滚动（支持大数据集）
- [ ] 添加分页功能
- [ ] 添加行选择功能
- [ ] 添加列固定（pinning）功能
- [ ] 性能优化

### 长期（v1.0.0）
- [ ] 完整的 API 文档
- [ ] Storybook 文档
- [ ] 多语言支持
- [ ] 主题系统
- [ ] 可访问性（a11y）支持
- [ ] 与其他框架的适配器（React、Vue、Angular）

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

