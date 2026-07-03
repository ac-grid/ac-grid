# AC Grid RFC 快速开始指南

本指南帮助您了解如何使用新的 RFC 系统开始开发 AC Grid 功能。

## RFC 系统概览

我们采用**模块化 RFC 方法**，将每个功能拆分为独立的 RFC 文档，便于：
- ✅ 聚焦单一功能
- ✅ 独立评审和实施
- ✅ 并行开发
- ✅ 清晰的进度跟踪

## 文件结构

```
docs/rfc/
├── README.md                          # RFC 索引和管理规则
├── GETTING-STARTED.md                 # 本文件：快速开始指南
├── RFC-TEMPLATE.md                    # RFC 模板
├── 0001-ac-grid-architecture.md       # 总体架构 RFC
└── 0002-sorting-feature.md            # 排序功能 RFC（示例）
```

## 快速开始步骤

### 1. 查看 RFC 索引

打开 [`README.md`](./README.md) 查看所有已规划的 RFC 和它们的状态。

### 2. 选择要实施的功能

从 RFC 索引中选择一个 **📝 草稿** 状态的 RFC，或者选择优先级最高的功能开始。

**推荐顺序（基于依赖关系）**：
1. ✅ **0002-sorting-feature** - 排序功能（已有 RFC）
2. 📝 **0003-filtering-feature** - 过滤功能（依赖排序）
3. 📝 **0004-column-resizing** - 列调整大小（独立功能）
4. 📝 **0005-virtual-scrolling** - 虚拟滚动（性能优化）
5. 📝 **0006-pagination** - 分页功能（与虚拟滚动二选一）

### 3. 编写或完善 RFC

#### 如果 RFC 已存在（如 0002）
直接阅读 RFC，了解设计方案，然后开始实施。

#### 如果 RFC 不存在
1. 复制 `RFC-TEMPLATE.md`
2. 重命名为 `XXXX-feature-name.md`
3. 填写 RFC 内容（参考 [0002-sorting-feature.md](./0002-sorting-feature.md) 作为示例）
4. 提交 PR 进行审查

### 4. 实施功能

按照 RFC 中的**实现细节**部分的步骤实施：

```typescript
// 示例：排序功能实施步骤
// 阶段 1: 集成 getSortedRowModel (2-3天)
// 阶段 2: 创建排序指示器组件 (1-2天)
// 阶段 3: 增强列头组件 (1-2天)
// 阶段 4: 添加样式 (1天)
// 阶段 5: 测试和文档 (2天)
```

### 5. 编写测试

RFC 中的**测试策略**部分提供了测试指南：
- 单元测试（100% 覆盖率）
- 集成测试
- E2E 测试（可选）

```bash
# 运行测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage
```

### 6. 更新文档

- 在主 `README.md` 中更新功能列表
- 在 `docs/rfc/README.md` 中更新 RFC 状态
- 创建 Storybook 示例

### 7. 提交 PR

```bash
# 提交代码
git checkout -b feature/sorting
git add .
git commit -m "feat: implement sorting feature (RFC-0002)"
git push origin feature/sorting
```

## 示例：实施排序功能

以下是实施 [RFC-0002: 排序功能](./0002-sorting-feature.md) 的完整流程：

### 第 1 步：阅读 RFC
```bash
# 打开并阅读 RFC
cat docs/rfc/0002-sorting-feature.md
```

### 第 2 步：设置开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:core
```

### 第 3 步：实施核心功能
```bash
# 编辑 Grid.wsx 添加排序支持
# 文件：packages/core/src/components/Grid.wsx
```

参考 RFC 中的**阶段 1** 代码示例。

### 第 4 步：创建排序指示器组件
```bash
# 创建新文件
touch packages/core/src/components/SortingIndicator.wsx
```

参考 RFC 中的**阶段 2** 代码示例。

### 第 5 步：增强列头组件
```bash
# 编辑 DraggableTableHeader.wsx
# 文件：packages/core/src/components/DraggableTableHeader.wsx
```

参考 RFC 中的**阶段 3** 代码示例。

### 第 6 步：添加样式
```bash
# 编辑 Grid.css
# 文件：packages/core/src/components/Grid.css
```

参考 RFC 中的**阶段 4** 代码示例。

### 第 7 步：编写测试
```bash
# 创建测试文件
mkdir -p packages/core/src/components/__tests__
touch packages/core/src/components/__tests__/sorting.test.ts
```

参考 RFC 中的**测试策略**部分。

### 第 8 步：验证功能
```bash
# 运行测试
pnpm test

# 运行覆盖率检查
pnpm test:coverage

# 检查 lint
pnpm lint

# 构建
pnpm build:core
```

### 第 9 步：创建示例
```bash
# 在 demo-wsx 中创建排序示例
# 文件：apps/demo-wsx/src/App.wsx
```

### 第 10 步：更新文档
```bash
# 更新 RFC 状态
# 文件：docs/rfc/README.md
# 将 0002 状态从 📝 草稿 改为 ✔️ 已完成

# 更新主架构 RFC
# 文件：docs/rfc/0001-ac-grid-architecture.md
# 在功能对比表中将排序标记为 ✅ 已实现
```

### 第 11 步：提交 PR
```bash
git add .
git commit -m "feat: implement sorting feature (RFC-0002)

- Add getSortedRowModel integration
- Create SortingIndicator component
- Enhance DraggableTableHeader with sorting support
- Add sorting styles
- Add comprehensive tests (100% coverage)
- Update documentation

Closes RFC-0002"

git push origin feature/sorting
```

## 常见问题

### Q1: 我应该从哪个功能开始？
**A**: 推荐从 **RFC-0002 排序功能** 开始，因为：
- RFC 文档已完成，设计清晰
- 技术栈熟悉（@tanstack/table-core）
- 相对独立，不依赖其他未实现功能
- 是表格的核心功能

### Q2: 如何处理 RFC 中的开放问题？
**A**: 
1. 在 PR 中提出讨论
2. 与团队成员沟通
3. 如有必要，更新 RFC 文档

### Q3: 测试覆盖率必须达到 100% 吗？
**A**: 是的。根据 `CLAUDE.md` 中的规范：
- 语句覆盖率: 100%
- 分支覆盖率: 100%
- 函数覆盖率: 100%
- 行覆盖率: 100%

### Q4: 可以修改 RFC 吗？
**A**: 可以，RFC 是活文档：
- 实施过程中发现问题，可以更新 RFC
- 提交 PR 并说明修改原因
- 获得审查批准后合并

### Q5: 如何并行开发多个功能？
**A**: 
1. 确保功能之间没有依赖关系
2. 使用独立的分支
3. 定期同步主分支避免冲突
4. 协调 API 设计避免冲突

## 资源链接

- [RFC 索引](./README.md)
- [RFC 模板](./RFC-TEMPLATE.md)
- [总体架构](./0001-ac-grid-architecture.md)
- [排序功能示例](./0002-sorting-feature.md)
- [项目主 README](../../README.md)
- [CLAUDE.md 开发规范](../../CLAUDE.md)

## 获取帮助

如有问题或需要帮助：
1. 查看 RFC 文档
2. 查看已实现的示例代码
3. 查看 `CLAUDE.md` 开发规范
4. 向团队成员咨询

---

**Happy Coding! 🚀**
