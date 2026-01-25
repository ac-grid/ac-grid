# @ac-grid/ac-grid-theme-default

AC Grid 默认主题预设包，提供 6 个精心设计的预设主题。

## 特性

- 🌞 **Light 主题**: 明亮清爽的浅色主题
- 🌙 **Dark 主题**: 舒适护眼的深色主题
- 🌊 **Ocean 主题**: 蓝色和青色调色板，清新专业
- 🌲 **Forest 主题**: 绿色和自然色调色板，清新自然
- 🌅 **Sunset 主题**: 橙色和紫色调色板，温暖活力
- 🎋 **Bamboo 主题**: 竹绿色和自然色调色板，清新宁静
- 🚀 **自动注册**: 导入即自动注册所有主题
- 🎨 **可扩展**: 可基于预设主题进行定制

## 安装

```bash
npm install @ac-grid/ac-grid-theme-base @ac-grid/ac-grid-theme-default
```

## 使用

### 自动使用（默认 Light 主题）

```typescript
// 导入即自动注册并应用 light 主题
import '@ac-grid/ac-grid-theme-default';
```

### 切换主题

```typescript
import '@ac-grid/ac-grid-theme-default';
import { themeManager } from '@ac-grid/ac-grid-theme-base';

// 切换到不同主题
themeManager.applyTheme('dark');    // 深色主题
themeManager.applyTheme('ocean');    // 海洋主题
themeManager.applyTheme('forest');   // 森林主题
themeManager.applyTheme('sunset');   // 日落主题
themeManager.applyTheme('bamboo');   // 竹子主题
```

### 响应系统主题

```typescript
import '@ac-grid/ac-grid-theme-default';
import { watchSystemTheme } from '@ac-grid/ac-grid-theme-base';

// 自动跟随系统主题
watchSystemTheme('light', 'dark');
```

### 基于预设主题定制

```typescript
import { lightTheme } from '@ac-grid/ac-grid-theme-default';
import { themeManager, type ACGridTheme } from '@ac-grid/ac-grid-theme-base';

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

### Ocean 主题
- 主色调: `#0ea5e9` (天空蓝)
- 背景: 白色
- 文字: 深蓝色

### Forest 主题
- 主色调: `#10b981` (翠绿色)
- 背景: 白色
- 文字: 深绿色

### Sunset 主题
- 主色调: `#f97316` (橙色)
- 背景: 白色
- 文字: 深橙色

### Bamboo 主题
- 主色调: `#22c55e` (竹绿色)
- 背景: 白色
- 文字: 深绿色

## 完整示例

```typescript
import '@ac-grid/ac-grid-core';
import '@ac-grid/ac-grid-theme-default';
import { themeManager } from '@ac-grid/ac-grid-theme-base';

// 1. 默认使用 light 主题
// Grid 自动应用 light 主题样式

// 2. 用户切换主题
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const current = themeManager.getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  themeManager.applyTheme(next);
});

// 3. 响应系统主题
import { watchSystemTheme } from '@ac-grid/ac-grid-theme-base';
watchSystemTheme('light', 'dark');
```

## 许可证

MIT
