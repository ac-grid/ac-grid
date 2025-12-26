# AC Grid

一个高性能的数据表格组件库，基于 `@tanstack/table` 构建，支持列和行的拖拽重排序功能。

## 架构

本项目采用 monorepo 结构，使用 pnpm 和 Turbo 进行管理：

- `packages/ac-grid-react` - React 版本的 Grid 组件库（基于 @tanstack/react-table）
- `apps/demo-react` - React 版本的演示应用（包含 Storybook）

## 功能特性

- ✅ 数据渲染和列管理（基于 @tanstack/react-table）
- ✅ 列拖拽重排序（使用 @dnd-kit）
- ✅ 行拖拽重排序（使用 @dnd-kit）
- ✅ 自定义单元格渲染
- ✅ 类型安全（TypeScript）
- ✅ Storybook 文档

## 安装

```bash
pnpm add @systembug/ac-grid
```

## 使用

```tsx
import { Grid, DraggableHandler } from '@systembug/ac-grid';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<Person>[] = [
  {
    id: 'drag-handle',
    header: 'Move',
    cell: ({ row }) => <DraggableHandler rowId={row.id} />,
    size: 60,
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    size: 150,
  },
];

function App() {
  return <Grid data={data} columns={columns} />;
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（运行所有包的 dev 脚本）
pnpm dev

# 构建所有包
pnpm build

# 运行 React demo
cd apps/demo-react && pnpm dev

# 运行 Storybook
pnpm storybook
```

## 项目结构

```
ac-grid/
├── packages/
│   └── ac-grid-react/          # React 组件库
│       ├── src/
│       │   └── components/     # Grid 组件及其相关组件
│       ├── package.json
│       └── vite.config.ts
├── apps/
│   └── demo-react/             # React demo 应用
│       ├── src/
│       │   ├── App.tsx          # 主应用
│       │   └── stories/         # Storybook 故事
│       ├── .storybook/          # Storybook 配置
│       └── package.json
├── pnpm-workspace.yaml          # pnpm workspace 配置
├── turbo.json                   # Turbo 配置
└── package.json                 # 根 package.json
```

## AG-Grid 工作原理总结

AG-Grid 是一个高性能的数据网格库，其核心架构包括：

1. **核心引擎**：数据管理、虚拟滚动、渲染优化
2. **列系统**：列定义、排序、过滤、调整大小、重排序
3. **行系统**：行渲染、选择、分组、聚合
4. **交互层**：拖拽、编辑、键盘导航
5. **虚拟化**：仅渲染可见区域，支持大数据集
6. **框架适配**：通过适配器支持 React/Angular/Vue

AC Grid 实现了类似的核心功能：
- 使用 `@tanstack/react-table` 作为表格核心引擎
- 使用 `@dnd-kit` 实现拖拽功能
- 提供 React 组件 API，易于集成

## License

MIT

