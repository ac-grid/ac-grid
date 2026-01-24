# RFC-0016: 主题系统架构（独立包设计）

**状态**: 📝 草稿  
**版本**: 0.0.2  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md)

## 目录

- [概述](#概述)
- [动机](#动机)
- [设计目标](#设计目标)
- [架构设计](#架构设计)
- [包设计](#包设计)
- [API 设计](#api-设计)
- [实现细节](#实现细节)
- [测试策略](#测试策略)
- [向后兼容性](#向后兼容性)
- [替代方案](#替代方案)
- [开放问题](#开放问题)
- [参考资料](#参考资料)

## 概述

建立 AC Grid 的主题系统基础架构，采用**独立包设计**，将主题系统拆分为三个独立的 npm 包：
1. `@systembug/ac-grid-theme-base` - 主题系统基础
2. `@systembug/ac-grid-theme-default` - 默认主题预设（Light & Dark）
3. `@systembug/ac-grid-core` - 核心表格功能（使用主题系统）

## 动机

### 问题陈述

当前 AC Grid 存在以下样式问题：

```css
/* packages/core/src/components/Grid.css */
/* ❌ 硬编码颜色 */
border: 1px solid #e5e7eb;
background-color: #f9fafb;

/* ❌ 无主题系统 */
/* ❌ 无暗色模式 */
/* ❌ 无法定制 */
```

**如果现在就实施功能（排序、过滤等）**：
- ❌ 每个功能都会硬编码样式
- ❌ 后期统一管理困难
- ❌ 技术债务积累

### 为什么需要独立包？

#### 方案对比

| 特性 | 内置主题 | 独立包 |
|------|---------|--------|
| 包大小 | 大（包含所有主题） | 小（按需安装） |
| 扩展性 | 受限 | 优秀 |
| 社区贡献 | 困难 | 容易 |
| 版本管理 | 耦合 | 独立 |
| 关注点分离 | 混合 | 清晰 |

#### 独立包的优势

1. **关注点分离**
   - Core 专注表格功能
   - Theme-base 专注系统架构
   - Theme-* 专注主题实现

2. **按需加载**
   ```bash
   # 最小安装
   npm i @systembug/ac-grid-core @systembug/ac-grid-theme-base
   
   # 标准安装（+ 默认主题）
   npm i @systembug/ac-grid-core @systembug/ac-grid-theme-base @systembug/ac-grid-theme-default
   ```

3. **独立演进**
   - Core 功能更新不影响主题
   - 主题包可独立发版本
   - 减少不必要的 breaking changes

4. **社区友好**
   - 社区可发布自己的主题包
   - 企业可发布品牌主题
   ```bash
   @awesome-dev/ac-grid-theme-cyberpunk
   @company/ac-grid-theme-brand
   ```

### 用户场景

**场景 1: 使用默认主题（最常见）**
```typescript
import '@systembug/ac-grid-core';
import '@systembug/ac-grid-theme-default';  // light & dark

import { themeManager } from '@systembug/ac-grid-theme-base';
themeManager.applyTheme('dark');
```

**场景 2: 完全自定义主题**
```typescript
import '@systembug/ac-grid-core';
import { themeManager, type ACGridTheme } from '@systembug/ac-grid-theme-base';

const customTheme: ACGridTheme = {
  name: 'custom',
  colors: { /* 自定义颜色 */ },
  // ...
};

themeManager.registerTheme(customTheme);
themeManager.applyTheme('custom');
```

**场景 3: 使用社区主题**
```typescript
import '@systembug/ac-grid-core';
import '@community/ac-grid-theme-material';  // 社区主题包

import { themeManager } from '@systembug/ac-grid-theme-base';
themeManager.applyTheme('material-light');
```

## 设计目标

- [x] **目标 1**: 建立清晰的主题系统架构
- [x] **目标 2**: 三个独立包，职责明确
- [x] **目标 3**: 完整的 TypeScript 类型支持
- [x] **目标 4**: 支持 Light & Dark 预设主题
- [x] **目标 5**: 支持完全自定义主题
- [x] **目标 6**: 支持社区主题包
- [x] **目标 7**: CSS 变量驱动，无运行时性能损耗
- [x] **目标 8**: 响应式主题切换（支持系统主题）

### 非目标

- ❌ 主题动画效果（将在后续版本考虑）
- ❌ 主题市场/CDN（将在后续版本考虑）
- ❌ 可视化主题编辑器（将在后续版本考虑）

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────┐
│  用户应用                                        │
│  ┌──────────────────────────────────────────┐  │
│  │  import '@systembug/ac-grid-core'        │  │
│  │  import '@systembug/ac-grid-theme-...'   │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ @systembug/  │  │ @systembug/  │  │ @systembug/  │
│ ac-grid-core │  │ ac-grid-     │  │ ac-grid-     │
│              │←─│ theme-base   │←─│ theme-       │
│ v0.0.2       │  │ v0.1.0       │  │ default      │
│              │  │              │  │ v0.1.0       │
└──────────────┘  └──────────────┘  └──────────────┘
     │                  │                   │
     │                  │                   │
 Grid组件          ThemeManager        Light/Dark主题
 使用CSS变量        管理主题系统          具体主题实现
```

### 包依赖关系

```
ac-grid-core
  └── peerDependency → ac-grid-theme-base

ac-grid-theme-default
  └── dependency → ac-grid-theme-base

ac-grid-theme-base
  └── (无外部依赖)
```

### 数据流

```
用户导入主题包
    ↓
主题包自动注册主题
    ↓
ThemeManager 存储主题定义
    ↓
用户调用 applyTheme(name)
    ↓
ThemeManager 读取主题定义
    ↓
将主题值设置为 CSS 变量（:root）
    ↓
Grid 组件自动使用新的 CSS 变量值
    ↓
浏览器重新渲染（纯 CSS 更新，无 JS 重渲染）
```

## 包设计

### 包 1: @systembug/ac-grid-theme-base

**职责**: 主题系统基础架构

**包含**:
- `ACGridTheme` 接口定义
- `ThemeManager` 类
- 主题工具函数
- CSS 变量命名规范

**不包含**:
- ❌ 任何具体主题实现

**包结构**:
```
packages/theme-base/
├── src/
│   ├── types/
│   │   └── theme.ts              # 主题接口定义
│   ├── manager/
│   │   └── ThemeManager.ts       # 主题管理器
│   ├── utils/
│   │   ├── helpers.ts            # 工具函数
│   │   └── validators.ts         # 主题验证
│   └── index.ts                  # 导出
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**package.json**:
```json
{
  "name": "@systembug/ac-grid-theme-base",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.6.2",
    "vite": "^5.4.4",
    "vite-plugin-dts": "^4.2.1"
  }
}
```

---

### 包 2: @systembug/ac-grid-theme-default

**职责**: 默认主题预设

**包含**:
- Light 主题定义
- Dark 主题定义
- 自动注册逻辑

**包结构**:
```
packages/theme-default/
├── src/
│   ├── themes/
│   │   ├── light.ts              # Light 主题
│   │   └── dark.ts               # Dark 主题
│   └── index.ts                  # 自动注册
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**package.json**:
```json
{
  "name": "@systembug/ac-grid-theme-default",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@systembug/ac-grid-theme-base": "workspace:^"
  },
  "devDependencies": {
    "typescript": "^5.6.2",
    "vite": "^5.4.4",
    "vite-plugin-dts": "^4.2.1"
  }
}
```

---

### 包 3: @systembug/ac-grid-core（更新）

**职责**: 核心表格功能

**更新内容**:
- 移除硬编码颜色
- 使用 CSS 变量
- 添加 theme-base 为 peerDependency

**package.json 更新**:
```json
{
  "name": "@systembug/ac-grid-core",
  "version": "0.0.2",
  "peerDependencies": {
    "@systembug/ac-grid-theme-base": "^0.1.0"
  },
  "dependencies": {
    "@wsxjs/wsx-core": "^0.0.30",
    "@tanstack/table-core": "^8.20.6",
    "@atlaskit/pragmatic-drag-and-drop": "^1.7.7"
  }
}
```

## API 设计

### @systembug/ac-grid-theme-base

#### 类型定义

```typescript
/**
 * 主题颜色定义
 */
export interface ACGridThemeColors {
  /** 主色调 */
  primary: string;
  /** 边框颜色 */
  border: string;
  /** 表头背景色 */
  bgHeader: string;
  /** 悬停背景色 */
  bgHover: string;
  /** 单元格背景色 */
  bgCell: string;
  /** 选中行背景色 */
  bgSelected: string;
  /** 主文本颜色 */
  textPrimary: string;
  /** 次要文本颜色 */
  textSecondary: string;
  /** 禁用文本颜色 */
  textDisabled: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
}

/**
 * 主题间距定义
 */
export interface ACGridThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 主题排版定义
 */
export interface ACGridThemeTypography {
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * 主题边框定义
 */
export interface ACGridThemeBorders {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  width: {
    thin: string;
    base: string;
    thick: string;
  };
}

/**
 * 主题阴影定义
 */
export interface ACGridThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 完整的主题定义接口
 */
export interface ACGridTheme {
  /** 主题名称（唯一标识） */
  name: string;
  /** 主题显示名称 */
  displayName?: string;
  /** 主题描述 */
  description?: string;
  /** 主题作者 */
  author?: string;
  /** 主题版本 */
  version?: string;
  /** 颜色定义 */
  colors: ACGridThemeColors;
  /** 间距定义 */
  spacing: ACGridThemeSpacing;
  /** 排版定义 */
  typography: ACGridThemeTypography;
  /** 边框定义 */
  borders: ACGridThemeBorders;
  /** 阴影定义 */
  shadows: ACGridThemeShadows;
}
```

#### ThemeManager 类

```typescript
/**
 * 主题管理器
 * 单例模式，管理所有已注册的主题
 */
export class ThemeManager {
  private themes: Map<string, ACGridTheme> = new Map();
  private currentTheme: string | null = null;
  private listeners: Set<ThemeChangeListener> = new Set();

  /**
   * 注册主题
   * @param theme - 主题定义
   * @throws 如果主题名称已存在
   */
  registerTheme(theme: ACGridTheme): void;

  /**
   * 取消注册主题
   * @param name - 主题名称
   */
  unregisterTheme(name: string): void;

  /**
   * 应用主题（设置 CSS 变量）
   * @param name - 主题名称
   * @throws 如果主题不存在
   */
  applyTheme(name: string): void;

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string | null;

  /**
   * 获取当前主题定义
   */
  getCurrentThemeDefinition(): ACGridTheme | null;

  /**
   * 获取所有已注册的主题名称
   */
  getThemes(): string[];

  /**
   * 获取主题定义
   * @param name - 主题名称
   */
  getTheme(name: string): ACGridTheme | undefined;

  /**
   * 检查主题是否已注册
   * @param name - 主题名称
   */
  hasTheme(name: string): boolean;

  /**
   * 监听主题变化
   * @param listener - 主题变化回调
   * @returns 取消监听函数
   */
  onThemeChange(listener: ThemeChangeListener): () => void;

  /**
   * 验证主题定义是否有效
   * @param theme - 主题定义
   * @returns 验证结果
   */
  validateTheme(theme: ACGridTheme): ThemeValidationResult;
}

/**
 * 主题变化监听器
 */
export type ThemeChangeListener = (
  currentTheme: string,
  previousTheme: string | null
) => void;

/**
 * 主题验证结果
 */
export interface ThemeValidationResult {
  valid: boolean;
  errors?: string[];
}

// 导出单例实例
export const themeManager: ThemeManager;
```

#### 工具函数

```typescript
/**
 * 从系统主题偏好应用主题
 * @param lightTheme - 浅色主题名称
 * @param darkTheme - 深色主题名称
 */
export function applySystemTheme(
  lightTheme: string = 'light',
  darkTheme: string = 'dark'
): void;

/**
 * 监听系统主题变化并自动应用
 * @param lightTheme - 浅色主题名称
 * @param darkTheme - 深色主题名称
 * @returns 取消监听函数
 */
export function watchSystemTheme(
  lightTheme: string = 'light',
  darkTheme: string = 'dark'
): () => void;

/**
 * camelCase 转 kebab-case
 */
export function camelToKebab(str: string): string;

/**
 * 从主题创建 CSS 变量对象
 */
export function themeToCSSVariables(theme: ACGridTheme): Record<string, string>;
```

### @systembug/ac-grid-theme-default

#### Light 主题

```typescript
export const lightTheme: ACGridTheme = {
  name: 'light',
  displayName: 'Light',
  description: 'Default light theme',
  author: 'AC Grid Team',
  version: '0.1.0',
  colors: {
    primary: '#0078d4',
    border: '#e5e7eb',
    bgHeader: '#f9fafb',
    bgHover: '#f3f4f6',
    bgCell: '#ffffff',
    bgSelected: '#e0f2fe',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    width: {
      thin: '1px',
      base: '1px',
      thick: '2px',
    },
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};
```

#### Dark 主题

```typescript
export const darkTheme: ACGridTheme = {
  name: 'dark',
  displayName: 'Dark',
  description: 'Default dark theme',
  author: 'AC Grid Team',
  version: '0.1.0',
  colors: {
    primary: '#3b82f6',
    border: '#374151',
    bgHeader: '#1f2937',
    bgHover: '#374151',
    bgCell: '#111827',
    bgSelected: '#1e3a8a',
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textDisabled: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // ... spacing, typography, borders, shadows 与 light 相同
};
```

#### 自动注册

```typescript
// src/index.ts
import { themeManager } from '@systembug/ac-grid-theme-base';
import { lightTheme } from './themes/light';
import { darkTheme } from './themes/dark';

// 自动注册主题
themeManager.registerTheme(lightTheme);
themeManager.registerTheme(darkTheme);

// 默认应用 light 主题
themeManager.applyTheme('light');

// 导出主题定义
export { lightTheme, darkTheme };
```

### @systembug/ac-grid-core（CSS 变量使用）

```css
/* src/styles/base.css */

/**
 * AC Grid 基础样式
 * 所有颜色/间距使用 CSS 变量
 */

.ac-grid {
  background-color: var(--ac-grid-bg-cell);
  color: var(--ac-grid-text-primary);
}

.ac-grid th,
.ac-grid td {
  padding: var(--ac-grid-spacing-sm);
  border: var(--ac-grid-border-width-base) solid var(--ac-grid-border);
  font-size: var(--ac-grid-font-size-base);
  line-height: var(--ac-grid-line-height-normal);
}

.ac-grid th {
  background-color: var(--ac-grid-bg-header);
  font-weight: var(--ac-grid-font-weight-medium);
  color: var(--ac-grid-text-primary);
}

.ac-grid tbody tr:hover {
  background-color: var(--ac-grid-bg-hover);
}

.ac-grid tbody tr.selected {
  background-color: var(--ac-grid-bg-selected);
}

/* 排序指示器（未来功能） */
.sort-indicator {
  color: var(--ac-grid-primary);
}

/* 过滤器（未来功能） */
.filter-active {
  color: var(--ac-grid-primary);
  background-color: var(--ac-grid-bg-hover);
}
```

## 实现细节

### 阶段 1: 创建 theme-base 包（2天）

**任务清单**:
- [ ] 创建包目录结构
- [ ] 定义 `ACGridTheme` 接口及所有子接口
- [ ] 实现 `ThemeManager` 类
  - [ ] 主题注册/取消注册
  - [ ] 主题应用（CSS 变量设置）
  - [ ] 主题验证
  - [ ] 事件监听
- [ ] 实现工具函数
  - [ ] `applySystemTheme`
  - [ ] `watchSystemTheme`
  - [ ] `camelToKebab`
  - [ ] `themeToCSSVariables`
- [ ] 编写单元测试（100% 覆盖率）
- [ ] 编写 README 和 API 文档

**关键代码**:

```typescript
// src/manager/ThemeManager.ts
export class ThemeManager {
  private themes = new Map<string, ACGridTheme>();
  private currentTheme: string | null = null;
  private listeners = new Set<ThemeChangeListener>();

  registerTheme(theme: ACGridTheme): void {
    if (this.themes.has(theme.name)) {
      throw new Error(`Theme "${theme.name}" is already registered`);
    }
    
    // 验证主题
    const validation = this.validateTheme(theme);
    if (!validation.valid) {
      throw new Error(`Invalid theme: ${validation.errors?.join(', ')}`);
    }
    
    this.themes.set(theme.name, theme);
  }

  applyTheme(name: string): void {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme "${name}" not found`);
    }

    const root = document.documentElement;
    const cssVars = themeToCSSVariables(theme);
    
    // 应用 CSS 变量
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    const previousTheme = this.currentTheme;
    this.currentTheme = name;

    // 通知监听器
    this.listeners.forEach(listener => {
      listener(name, previousTheme);
    });
  }

  // ... 其他方法
}

// 导出单例
export const themeManager = new ThemeManager();
```

### 阶段 2: 创建 theme-default 包（1天）

**任务清单**:
- [ ] 创建包目录结构
- [ ] 实现 Light 主题定义
- [ ] 实现 Dark 主题定义
- [ ] 实现自动注册逻辑
- [ ] 编写测试
- [ ] 编写 README

**关键代码**:

```typescript
// src/index.ts
import { themeManager } from '@systembug/ac-grid-theme-base';
import { lightTheme } from './themes/light';
import { darkTheme } from './themes/dark';

// 自动注册
themeManager.registerTheme(lightTheme);
themeManager.registerTheme(darkTheme);

// 应用默认主题
themeManager.applyTheme('light');

export { lightTheme, darkTheme };
```

### 阶段 3: 更新 core 包（1天）

**任务清单**:
- [ ] 移除 Grid.css 中的硬编码颜色
- [ ] 更新为使用 CSS 变量
- [ ] 添加 theme-base 为 peerDependency
- [ ] 更新 package.json
- [ ] 更新所有组件的样式
- [ ] 更新测试

**关键修改**:

```css
/* 之前 */
.ac-grid th {
  background-color: #f9fafb;  /* ❌ 硬编码 */
  border: 1px solid #e5e7eb;
}

/* 之后 */
.ac-grid th {
  background-color: var(--ac-grid-bg-header);  /* ✅ 使用变量 */
  border: var(--ac-grid-border-width-base) solid var(--ac-grid-border);
}
```

### 阶段 4: 更新文档和示例（1天）

**任务清单**:
- [ ] 更新主 README
- [ ] 创建主题系统文档
- [ ] 更新 demo-wsx 应用
- [ ] 创建主题切换示例
- [ ] 创建自定义主题示例
- [ ] 更新 Storybook

### 阶段 5: 发布和集成测试（0.5天）

**任务清单**:
- [ ] 发布 theme-base@0.1.0
- [ ] 发布 theme-default@0.1.0
- [ ] 发布 core@0.0.2
- [ ] 集成测试
- [ ] 更新 ROADMAP.md

**总计**: 5.5天

## 测试策略

### theme-base 包测试

```typescript
describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = new ThemeManager();
  });

  it('should register a theme', () => {
    const theme = createMockTheme('test');
    manager.registerTheme(theme);
    expect(manager.hasTheme('test')).toBe(true);
  });

  it('should throw error for duplicate theme', () => {
    const theme = createMockTheme('test');
    manager.registerTheme(theme);
    expect(() => manager.registerTheme(theme)).toThrow();
  });

  it('should apply theme and set CSS variables', () => {
    const theme = createMockTheme('test');
    manager.registerTheme(theme);
    manager.applyTheme('test');
    
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ac-grid-primary')).toBe(theme.colors.primary);
  });

  it('should notify listeners on theme change', () => {
    const listener = vi.fn();
    manager.onThemeChange(listener);
    
    const theme = createMockTheme('test');
    manager.registerTheme(theme);
    manager.applyTheme('test');
    
    expect(listener).toHaveBeenCalledWith('test', null);
  });

  // ... 更多测试
});
```

### theme-default 包测试

```typescript
describe('Default Themes', () => {
  it('should have valid light theme', () => {
    const validation = themeManager.validateTheme(lightTheme);
    expect(validation.valid).toBe(true);
  });

  it('should have valid dark theme', () => {
    const validation = themeManager.validateTheme(darkTheme);
    expect(validation.valid).toBe(true);
  });

  it('should auto-register themes on import', () => {
    expect(themeManager.hasTheme('light')).toBe(true);
    expect(themeManager.hasTheme('dark')).toBe(true);
  });
});
```

### 测试覆盖率目标
- **theme-base**: 100% 覆盖率
- **theme-default**: 100% 覆盖率
- **core 样式更新**: 视觉回归测试

## 性能考虑

### 性能目标
- **主题切换时间**: < 50ms
- **CSS 变量设置**: < 10ms
- **内存占用**: 每个主题 < 1KB

### 性能优化策略

1. **CSS 变量优化**
   - 使用浏览器原生 CSS 变量
   - 无 JavaScript 重渲染
   - 纯 CSS 更新

2. **主题注册优化**
   - 主题定义存储在 Map 中（O(1) 查找）
   - 延迟验证（仅在注册时验证）

3. **事件监听优化**
   - 使用 Set 存储监听器
   - 提供取消监听机制

## 向后兼容性

### 破坏性变更

1. **CSS 类名变化**
   - 之前: 部分样式硬编码
   - 之后: 所有样式使用 CSS 变量
   - **影响**: 自定义样式可能需要更新

2. **新增 peerDependency**
   - core 包需要 theme-base 包
   - **影响**: 用户需要安装 theme-base

### 迁移指南

#### 从 v0.0.1 升级到 v0.0.2

```bash
# 1. 更新依赖
npm install @systembug/ac-grid-core@0.0.2
npm install @systembug/ac-grid-theme-base@0.1.0
npm install @systembug/ac-grid-theme-default@0.1.0

# 2. 更新导入
# 之前
import '@systembug/ac-grid-core';

# 之后
import '@systembug/ac-grid-core';
import '@systembug/ac-grid-theme-default';  // 添加主题包
```

#### 自定义样式迁移

```css
/* 之前 */
.ac-grid th {
  background-color: red !important;  /* ❌ 覆盖硬编码 */
}

/* 之后 */
:root {
  --ac-grid-bg-header: red;  /* ✅ 覆盖 CSS 变量 */
}
```

## 替代方案

### 方案 A: 内置主题系统（不独立包）

**描述**: 所有主题代码放在 core 包内

**优点**:
- 简单，只需一个包
- 用户安装方便

**缺点**:
- 包体积大
- 无法按需加载
- 社区贡献困难
- 关注点混合

### 方案 B: CSS-in-JS 方案

**描述**: 使用 styled-components 或 emotion

**优点**:
- 动态样式强大
- TypeScript 类型支持好

**缺点**:
- 运行时性能损耗
- 增加包体积
- 与 Web Components 集成复杂
- 不符合项目轻量级目标

### 为什么选择当前方案

1. **性能最优**: 纯 CSS 变量，无运行时开销
2. **架构清晰**: 独立包，职责分离
3. **社区友好**: 易于贡献和扩展
4. **轻量级**: 符合项目目标

## 开放问题

- [ ] **问题 1**: 是否支持主题继承？
  - 允许主题基于其他主题扩展
  - 建议在 v0.2.0 考虑

- [ ] **问题 2**: 是否需要主题 CDN？
  - 方便快速加载社区主题
  - 建议在 v1.0.0 后考虑

- [ ] **问题 3**: 是否支持主题局部应用？
  - 同一页面不同 Grid 使用不同主题
  - 建议在 v0.3.0 考虑

## 参考资料

- [CSS 变量 (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens (W3C)](https://www.w3.org/community/design-tokens/)
- [Material Design Theming](https://material.io/design/color/the-color-system.html)
- [Ant Design Theme](https://ant.design/docs/react/customize-theme)
- [Bootstrap Theming](https://getbootstrap.com/docs/5.0/customize/sass/)

---

**总结**: 通过独立包架构，我们建立了一个清晰、可扩展、高性能的主题系统，为 AC Grid 的所有功能提供统一的样式基础。
