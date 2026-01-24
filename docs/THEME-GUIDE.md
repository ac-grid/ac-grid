# AC Grid 主题系统指南

> **版本**: v0.0.2  
> **最后更新**: 2026-01-24

## 📖 目录

- [快速开始](#快速开始)
- [主题系统架构](#主题系统架构)
- [使用默认主题](#使用默认主题)
- [创建自定义主题](#创建自定义主题)
- [主题切换](#主题切换)
- [响应系统主题](#响应系统主题)
- [高级用法](#高级用法)
- [FAQ](#faq)

## 快速开始

### 安装

```bash
# 标准安装（推荐）
npm install @systembug/ac-grid-core @systembug/ac-grid-theme-base @systembug/ac-grid-theme-default

# 或使用 pnpm
pnpm add @systembug/ac-grid-core @systembug/ac-grid-theme-base @systembug/ac-grid-theme-default
```

### 基础使用

```typescript
// 1. 导入 Grid 核心
import '@systembug/ac-grid-core';

// 2. 导入默认主题（自动应用 light 主题）
import '@systembug/ac-grid-theme-default';

// 3. 使用 Grid
// Grid 自动使用主题系统的样式
```

## 主题系统架构

AC Grid 的主题系统采用**独立包架构**：

```
@systembug/ac-grid-core          核心表格功能
    ↓ (使用 CSS 变量)
@systembug/ac-grid-theme-base    主题系统基础
    ↓ (提供主题管理)
@systembug/ac-grid-theme-default Light & Dark 预设主题
```

### 为什么独立包？

1. **按需加载**: 只安装需要的主题包
2. **关注点分离**: 核心功能和样式完全分离
3. **社区友好**: 易于创建和分享自定义主题包
4. **独立演进**: 核心和主题可以独立发版本

## 使用默认主题

### Light 主题（默认）

```typescript
import '@systembug/ac-grid-core';
import '@systembug/ac-grid-theme-default';

// 自动应用 light 主题，无需额外配置
```

### Dark 主题

```typescript
import '@systembug/ac-grid-core';
import '@systembug/ac-grid-theme-default';
import { themeManager } from '@systembug/ac-grid-theme-base';

// 切换到 dark 主题
themeManager.applyTheme('dark');
```

### 主题预览

| 主题 | 主色调 | 背景 | 适用场景 |
|------|--------|------|---------|
| Light | 蓝色 `#0078d4` | 白色 | 日间使用、打印 |
| Dark | 亮蓝 `#3b82f6` | 深灰 | 夜间使用、护眼 |

## 创建自定义主题

### 方式 1: 完全自定义

```typescript
import { themeManager, type ACGridTheme } from '@systembug/ac-grid-theme-base';

const customTheme: ACGridTheme = {
  name: 'my-theme',
  displayName: 'My Custom Theme',
  description: 'A beautiful custom theme',
  author: 'Your Name',
  version: '1.0.0',
  colors: {
    primary: '#ff6b6b',
    border: '#dee2e6',
    bgHeader: '#f8f9fa',
    bgHover: '#e9ecef',
    bgCell: '#ffffff',
    bgSelected: '#ffe0e0',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textDisabled: '#adb5bd',
    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
    info: '#74c0fc',
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

// 注册主题
themeManager.registerTheme(customTheme);

// 应用主题
themeManager.applyTheme('my-theme');
```

### 方式 2: 基于预设主题扩展

```typescript
import { lightTheme } from '@systembug/ac-grid-theme-default';
import { themeManager, type ACGridTheme } from '@systembug/ac-grid-theme-base';

// 基于 light 主题创建变体
const myLightTheme: ACGridTheme = {
  ...lightTheme,
  name: 'my-light',
  displayName: 'My Light Theme',
  colors: {
    ...lightTheme.colors,
    primary: '#ff6b6b',  // 只修改主色调
  },
};

themeManager.registerTheme(myLightTheme);
themeManager.applyTheme('my-light');
```

### 方式 3: 创建主题包（推荐用于分享）

```typescript
// my-theme-package/src/themes/brand.ts
import type { ACGridTheme } from '@systembug/ac-grid-theme-base';

export const brandTheme: ACGridTheme = {
  name: 'company-brand',
  displayName: 'Company Brand',
  // ... 主题定义
};

// my-theme-package/src/index.ts
import { themeManager } from '@systembug/ac-grid-theme-base';
import { brandTheme } from './themes/brand';

// 自动注册
themeManager.registerTheme(brandTheme);

export { brandTheme };
```

发布为 npm 包：
```json
{
  "name": "@company/ac-grid-theme-brand",
  "version": "1.0.0",
  "dependencies": {
    "@systembug/ac-grid-theme-base": "^0.1.0"
  }
}
```

## 主题切换

### 手动切换

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

// 获取当前主题
const current = themeManager.getCurrentTheme(); // 'light'

// 切换主题
themeManager.applyTheme('dark');

// 切换回 light
themeManager.applyTheme('light');
```

### 主题切换按钮

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

const toggleButton = document.getElementById('theme-toggle');

toggleButton?.addEventListener('click', () => {
  const current = themeManager.getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  themeManager.applyTheme(next);
  
  // 更新按钮文本
  toggleButton.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
});
```

### 监听主题变化

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

const unsubscribe = themeManager.onThemeChange((currentTheme, previousTheme) => {
  console.log(`Theme changed from ${previousTheme} to ${currentTheme}`);
  
  // 更新 UI
  document.body.setAttribute('data-theme', currentTheme);
  
  // 保存用户偏好
  localStorage.setItem('preferred-theme', currentTheme);
});

// 取消监听
// unsubscribe();
```

## 响应系统主题

### 自动跟随系统

```typescript
import '@systembug/ac-grid-theme-default';
import { watchSystemTheme } from '@systembug/ac-grid-theme-base';

// 自动响应系统主题变化
const unwatch = watchSystemTheme('light', 'dark');

// 取消监听
// unwatch();
```

### 手动检测系统主题

```typescript
import { applySystemTheme } from '@systembug/ac-grid-theme-base';

// 应用当前系统主题
applySystemTheme('light', 'dark');
```

### 带用户偏好的完整示例

```typescript
import '@systembug/ac-grid-theme-default';
import { themeManager, watchSystemTheme } from '@systembug/ac-grid-theme-base';

// 1. 读取用户偏好
const savedTheme = localStorage.getItem('preferred-theme');

if (savedTheme && themeManager.hasTheme(savedTheme)) {
  // 使用保存的主题
  themeManager.applyTheme(savedTheme);
} else {
  // 跟随系统主题
  watchSystemTheme('light', 'dark');
}

// 2. 保存用户选择
themeManager.onThemeChange((currentTheme) => {
  localStorage.setItem('preferred-theme', currentTheme);
});
```

## 高级用法

### 验证主题

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

const result = themeManager.validateTheme(customTheme);

if (!result.valid) {
  console.error('Invalid theme:', result.errors);
}
```

### 列出所有可用主题

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

const themes = themeManager.getThemes();
console.log('Available themes:', themes); // ['light', 'dark', ...]
```

### 获取主题定义

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

const lightTheme = themeManager.getTheme('light');
console.log('Light theme colors:', lightTheme?.colors);
```

### 动态主题选择器

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

function createThemeSelector() {
  const select = document.createElement('select');
  
  themeManager.getThemes().forEach(themeName => {
    const option = document.createElement('option');
    option.value = themeName;
    option.textContent = themeName;
    select.appendChild(option);
  });
  
  select.value = themeManager.getCurrentTheme() || 'light';
  
  select.addEventListener('change', (e) => {
    themeManager.applyTheme((e.target as HTMLSelectElement).value);
  });
  
  return select;
}

document.body.appendChild(createThemeSelector());
```

## FAQ

### Q: 主题切换会重新渲染 Grid 吗？
A: **不会**。主题切换只更新 CSS 变量，浏览器自动重绘，无 JavaScript 重渲染，性能极佳。

### Q: 可以在同一页面使用多个主题吗？
A: 当前版本（v0.0.2）暂不支持。计划在 v0.3.0 支持局部主题应用。

### Q: 如何创建渐变色主题？
A: CSS 变量支持任何 CSS 值，包括渐变：
```typescript
colors: {
  primary: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  // ...
}
```

### Q: 主题包的大小？
A: 
- `theme-base`: ~5KB (gzipped)
- `theme-default`: ~2KB (gzipped)
- 总计: ~7KB

### Q: 如何分享我的主题？
A: 
1. 创建 npm 包（参考[方式 3](#方式-3-创建主题包推荐用于分享)）
2. 发布到 npm
3. 提交到 [AC Grid 主题列表](https://github.com/systembugtj/ac-grid/issues)

### Q: 支持 CSS-in-JS 吗？
A: 不推荐。AC Grid 使用 CSS 变量以获得最佳性能，CSS-in-JS 会增加运行时开销。

## 相关资源

- [RFC-0016: 主题系统架构](../docs/rfc/0016-theme-system.md)
- [项目路线图](../ROADMAP.md)
- [theme-base API 文档](../packages/theme-base/README.md)
- [theme-default 文档](../packages/theme-default/README.md)

---

**贡献**: 欢迎提交您的主题包！查看 [贡献指南](../CONTRIBUTING.md)

**许可证**: MIT
