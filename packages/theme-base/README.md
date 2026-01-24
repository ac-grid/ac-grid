# @systembug/ac-grid-theme-base

AC Grid 主题系统基础包，提供主题管理能力、类型定义和工具函数。

## 特性

- 🎨 **主题管理**: 注册、应用、切换主题
- 📝 **类型安全**: 完整的 TypeScript 类型定义
- ⚡ **高性能**: CSS 变量驱动，零运行时开销
- 🔧 **可扩展**: 支持自定义主题和社区主题包
- 🌍 **系统主题**: 支持响应系统主题偏好

## 安装

```bash
npm install @systembug/ac-grid-theme-base
```

## 使用

### 基础使用

```typescript
import { themeManager, type ACGridTheme } from '@systembug/ac-grid-theme-base';

// 定义主题
const myTheme: ACGridTheme = {
  name: 'my-theme',
  displayName: 'My Theme',
  colors: {
    primary: '#0078d4',
    border: '#e5e7eb',
    // ... 其他颜色
  },
  // ... 其他配置
};

// 注册主题
themeManager.registerTheme(myTheme);

// 应用主题
themeManager.applyTheme('my-theme');
```

### 监听主题变化

```typescript
import { themeManager } from '@systembug/ac-grid-theme-base';

const unsubscribe = themeManager.onThemeChange((currentTheme, previousTheme) => {
  console.log(`Theme changed from ${previousTheme} to ${currentTheme}`);
});

// 取消监听
unsubscribe();
```

### 响应系统主题

```typescript
import { watchSystemTheme } from '@systembug/ac-grid-theme-base';

// 自动响应系统主题变化
const unwatch = watchSystemTheme('light', 'dark');

// 取消监听
unwatch();
```

## API 文档

详见 [RFC-0016](../../docs/rfc/0016-theme-system.md)

## 许可证

MIT
