# AC Grid 文档索引

> **最后更新**: 2026-01-24

欢迎来到 AC Grid 文档中心！这里包含了完整的使用指南、API 参考和设计文档。

## 📚 用户指南

### 功能指南

所有用户指南位于站点文档系统中：`apps/site/public/docs/guide/features/`

| 指南 | 描述 | 版本 | 状态 |
|------|------|------|------|
| [排序功能指南](../apps/site/public/docs/guide/features/sorting.md) | 学习如何使用排序功能，包括单列排序、多列排序和自定义比较器 | v0.1.0 | ✅ 已完成 |
| [过滤功能指南](../apps/site/public/docs/guide/features/filtering.md) | 学习如何使用过滤功能，包括列过滤、全局搜索和自定义过滤函数 | v0.1.0 | 📝 规划中 |
| [主题系统指南](../apps/site/public/docs/guide/features/theming.md) | 学习如何使用和自定义主题系统 | v0.0.2 | ✅ 已完成 |

### 快速链接

- [项目路线图](../ROADMAP.md) - 了解开发计划和版本规划
- [RFC 文档](./spec/rfc/README.md) - 查看详细的设计文档
- [站点文档指南](../apps/site/public/docs/guide/) - 完整的用户指南

## 📖 指南详情

### 排序功能指南

**位置**: `apps/site/public/docs/guide/features/sorting.md`

学习如何：
- 启用和配置排序功能
- 使用单列和多列排序
- 创建自定义排序函数（比较器）
- 编程式控制排序状态
- 持久化排序状态

**相关 RFC**: [RFC-0002](./rfc/completed/0002-sorting-feature.md)

### 过滤功能指南

**位置**: `apps/site/public/docs/guide/features/filtering.md`

学习如何：
- 启用和配置过滤功能
- 使用列过滤和全局搜索
- 创建自定义过滤函数
- 编程式控制过滤状态
- 持久化过滤状态

**相关 RFC**: [RFC-0003](./rfc/0003-filtering-feature.md)

### 主题系统指南

**位置**: `apps/site/public/docs/guide/features/theming.md`

学习如何：
- 使用默认主题（Light, Dark, Ocean, Forest, Sunset, Bamboo）
- 创建自定义主题
- 切换和持久化主题
- 响应系统主题变化

**相关 RFC**: [RFC-0016](./rfc/0016-theme-system.md)

## 🔍 查找文档

### 按功能查找

- **数据操作**: [排序指南](../apps/site/public/docs/guide/features/sorting.md) | [过滤指南](../apps/site/public/docs/guide/features/filtering.md)
- **样式定制**: [主题指南](../apps/site/public/docs/guide/features/theming.md)
- **架构设计**: [RFC 文档](./rfc/README.md)

### 按类型查找

- **用户指南**: `apps/site/public/docs/guide/features/` 目录
- **设计文档**: [RFC 目录](./rfc/)
- **角色定义**: [Persona 目录](./persona/)

## 📝 贡献指南

欢迎贡献文档改进！

1. 发现问题或需要改进？请提交 Issue
2. 想要添加新指南？请参考现有指南的格式
3. 想要更新 RFC？请查看 [RFC 管理规则](./rfc/README.md)

## 🔗 相关资源

- [GitHub 仓库](https://github.com/systembugtj/ac-grid)
- [项目路线图](../ROADMAP.md)
- [RFC 索引](./rfc/README.md)

---

**许可证**: MIT
