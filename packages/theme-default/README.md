# @systembug/ac-grid-theme-default

AC Grid 默认主题预设包，提供 Light 和 Dark 两个预设主题。

## 特性

- 🌞 **Light 主题**: 明亮清爽的浅色主题
- 🌙 **Dark 主题**: 舒适护眼的深色主题
- 🚀 **自动注册**: 导入即自动注册主题
- 🎨 **可扩展**: 可基于预设主题进行定制

## 安装

```bash
npm install @systembug/ac-grid-theme-base @systembug/ac-grid-theme-default
```

## 使用

### 自动使用（默认 Light 主题）

```typescript
// 导入即自动注册并应用 light 主题
import '@systembug/ac-grid-theme-default';
```

### 切换到 Dark 主题

```typescript
import '@systembug/ac-grid-theme-default';
import { themeManager } from '@systembug/ac-grid-theme-base';

// 切换到 dark 主题
themeManager.applyTheme('dark');
```

### 响应系统主题

```typescript
import '@systembug/ac-grid-theme-default';
import { watchSystemTheme } from '@systembug/ac-grid-theme-base';

// 自动跟随系统主题
watchSystemTheme('light', 'dark');
```

### 基于预设主题定制

```typescript
import { lightTheme } from '@systembug/ac-grid-theme-default';
import { themeManager, type ACGridTheme } from '@systembug/ac-grid-theme-base';

// 基于 light 主题创建自定义主题
const myTheme: ACGridTheme = {
  ...lightTheme,
  name: 'my-custom-light',
  colors: {
    ...lightTheme.colors,
    primary: '#ff6b6b',  // 自定义主色调
  },
};

themeManager.registerTheme(myTheme);
themeManager.applyTheme('my-custom-light');
```

## 主题预览

### Light 主题
- 主色调: `#0078d4` (蓝色)
- 背景: 白色
- 文字: 深灰色

### Dark 主题
- 主色调: `#3b82f6` (亮蓝色)
- 背景: 深灰色
- 文字: 浅灰色

## 完整示例

```typescript
import '@systembug/ac-grid-core';
import '@systembug/ac-grid-theme-default';
import { themeManager } from '@systembug/ac-grid-theme-base';

// 1. 默认使用 light 主题
// Grid 自动应用 light 主题样式

// 2. 用户切换主题
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const current = themeManager.getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  themeManager.applyTheme(next);
});

// 3. 响应系统主题
import { watchSystemTheme } from '@systembug/ac-grid-theme-base';
watchSystemTheme('light', 'dark');
```

## 许可证

MIT
