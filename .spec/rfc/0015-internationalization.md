# RFC-0015: 国际化 (i18n)

**状态**: 📝 草稿  
**版本**: 0.5.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md)

## 目录

- [概述](#概述)
- [动机](#动机)
- [设计目标](#设计目标)
- [技术方案](#技术方案)
- [API 设计](#api-设计)
- [实现细节](#实现细节)
- [测试策略](#测试策略)
- [性能考虑](#性能考虑)
- [向后兼容性](#向后兼容性)
- [替代方案](#替代方案)
- [开放问题](#开放问题)
- [参考资料](#参考资料)

## 概述

为 AC Grid 添加国际化（i18n）支持，支持多语言界面文本、日期和数字格式化，以及 RTL（从右到左）布局支持。

## 动机

### 问题陈述
当前 AC Grid 的界面文本是硬编码的英文，日期和数字格式也是固定的。国际化支持可以让 AC Grid 在全球范围内使用。

### 用户场景

**场景 1：中文界面**
```typescript
// 用户设置语言为中文
// 所有界面文本显示为中文
// 日期格式使用中文格式
```

**场景 2：RTL 布局**
```typescript
// 用户使用阿拉伯语
// 表格布局从右到左
// 文本对齐自动调整
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 多语言支持
- ✅ 日期/数字格式化
- ✅ RTL 支持

## 设计目标

- [ ] **目标 1**: 支持多语言界面文本
- [ ] **目标 2**: 支持日期格式化
- [ ] **目标 3**: 支持数字格式化
- [ ] **目标 4**: 支持 RTL 布局
- [ ] **目标 5**: 提供语言包系统
- [ ] **目标 6**: 默认支持中文和英文

### 非目标
- ❌ 自动语言检测
- ❌ 动态语言切换动画

## 技术方案

### 方案概述
实现国际化系统，使用语言包管理界面文本，使用 Intl API 处理日期和数字格式化。

### 架构设计

```
设置语言
    ↓
加载语言包
    ↓
应用界面文本
    ↓
应用日期/数字格式
    ↓
应用 RTL 布局（如需要）
```

### 核心组件

#### 组件 1: I18nManager
**职责**：国际化管理器

**接口**：
```typescript
interface I18nManager {
  setLocale(locale: string): void;
  t(key: string, params?: Record<string, any>): string;
  formatDate(date: Date): string;
  formatNumber(number: number): string;
}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 语言代码
  locale?: string;
  // 自定义语言包
  messages?: Record<string, string>;
}
```

#### 方法
```typescript
class Grid {
  /**
   * 设置语言
   * @param locale - 语言代码（如 'zh-CN', 'en-US'）
   */
  setLocale(locale: string): void;

  /**
   * 获取当前语言
   */
  getLocale(): string;
}
```

### 语言包结构

```typescript
interface LanguagePack {
  locale: string;
  messages: {
    'grid.noData': string;
    'grid.loading': string;
    'grid.sort.asc': string;
    'grid.sort.desc': string;
    // ... 其他消息
  };
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}
```

## 实现细节

### 阶段 1: 基础 i18n
**预计时间**: 3 天

**任务清单**：
- [ ] 创建 I18nManager
- [ ] 实现语言包系统
- [ ] 实现文本翻译

### 阶段 2: 格式化
**预计时间**: 2 天

**任务清单**：
- [ ] 实现日期格式化
- [ ] 实现数字格式化
- [ ] 使用 Intl API

### 阶段 3: RTL 支持
**预计时间**: 2 天

**任务清单**：
- [ ] 实现 RTL 布局检测
- [ ] 实现 RTL 样式
- [ ] 测试 RTL 布局

## 测试策略

### 单元测试
- 测试语言切换
- 测试文本翻译
- 测试日期格式化
- 测试数字格式化
- 测试 RTL 布局

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **语言切换**: < 50ms
- **格式化**: < 1ms per value

## 向后兼容性

### 破坏性变更
无。国际化是可选的，默认使用英文。

## 参考资料

- [Intl API 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [ag-Grid 国际化文档](https://www.ag-grid.com/javascript-data-grid/internationalisation/)
