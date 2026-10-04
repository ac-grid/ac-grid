# RFC-0011: 主题系统（高级主题功能）

**状态**: ✔️ 已完成  
**版本**: 0.4.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**完成日期**: 2026-10-03  
**相关 RFC**: [0001-ac-grid-architecture](../0001-ac-grid-architecture.md), [0016-theme-system](../0016-theme-system.md)

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
- [参考资料](#参考资料)

## 概述

在 RFC-0016 的基础主题系统之上，添加高级主题功能，包括主题切换动画、主题预览与取消预览、主题编辑器工具、主题导入/导出，以及社区主题包规范支持。

## 动机

### 问题陈述

RFC-0016 提供了基础主题系统，但缺少：

- 主题切换动画（CSS transition 过渡）
- 主题预览功能（无需持久化应用即可即时预览并一键恢复）
- 主题编辑器工具（程序化定制、验证、构建和导出）
- 社区主题包生态系统规范与注册支持
- 主题导入/导出（JSON 与 CSS 变量样式表格式）

### 用户场景

**场景 1：主题切换动画**

```typescript
const grid = createGrid({
  data,
  columns,
  themeTransition: true,
  themeTransitionDuration: 300,
});
// 切换主题时具备平滑的 CSS 颜色与边框过渡效果
grid.applyTheme("dark");
```

**场景 2：主题实时预览与恢复**

```typescript
// 用户在主题选择器中鼠标悬停时实时预览
grid.previewTheme("cyberpunk");

// 取消预览，自动恢复先前应用的主题
grid.cancelPreview();
```

**场景 3：主题程序化编辑与导出**

```typescript
import { createThemeEditor } from "@ac-grid/theme-base";

const editor = createThemeEditor("light")
  .setName("brand-blue")
  .setDisplayName("Brand Blue")
  .setColor("primary", "#0052cc")
  .setSpacing({ md: "18px" });

const customTheme = editor.build();
const cssSheet = editor.export({ format: "css" });
```

### 与 RFC-0016 的关系

- **RFC-0016**: 基础主题系统架构（v0.0.2）
- **RFC-0011**: 高级主题功能和用户体验（v0.4.0）

## 设计目标

- [x] **目标 1**: 主题切换平滑动画（CSS transition）
- [x] **目标 2**: 主题预览与取消预览功能（全局及目标容器级别）
- [x] **目标 3**: 主题编辑器工具（`ThemeEditor` / `cloneTheme`）
- [x] **目标 4**: 社区主题包规范支持（`ThemePackageMetadata`）
- [x] **目标 5**: 主题导入/导出（JSON & CSS 变量）

### 非目标

- ❌ 主题市场/CDN
- ❌ 在线可视化主题编辑器 UI 页面

## 技术方案

### 方案概述

在 `@ac-grid/theme-base` 和 `@ac-grid/core` 中扩展能力：

1. **动画过渡**: 基于 CSS custom properties (`--ac-grid-theme-transition-duration`) 与 `.theme-transition` 类，在颜色、背景色、边框及阴影发生变化时自动平滑过渡；
2. **主题预览**: `ThemeManager` 与 `Grid` 支持保存预览前的当前状态，预览应用后可通过 `cancelPreview()` 还原，或通过 `applyTheme()` 提交；
3. **导入/导出**: 支持结构化 JSON 校验导入及 CSS Variables 样式表生成导出；
4. **社区主题包**: 规范化 `ThemePackageMetadata`，支持一次性注册包含多个主题的社区包；
5. **程序化编辑器**: `ThemeEditor` 链式调用，支持基于预设克隆、局部覆盖、校验、草稿预览及构建。

## API 设计

### 配置选项

```typescript
interface CreateGridOptions<TData> {
  // 主题切换动画
  themeTransition?: boolean;
  // 主题切换动画时长（毫秒，默认 200）
  themeTransitionDuration?: number;
  // 初始主题名称
  theme?: string;
}
```

### Grid 组件方法

```typescript
class Grid {
  /** 预览主题（不持久化为应用主题） */
  public previewTheme(themeName: string): void;

  /** 取消预览，恢复当前主题 */
  public cancelPreview(): void;

  /** 获取当前正在预览的主题名称 */
  public getPreviewTheme(): string | null;

  /** 应用主题到当前表格实例 */
  public applyTheme(themeName: string): void;

  /** 获取当前应用的主题名称 */
  public getTheme(): string | null;

  /** 设置主题过渡动画配置 */
  public setThemeTransition(enabled: boolean, duration?: number): void;

  /** 获取是否开启了过渡动画 */
  public isThemeTransitionEnabled(): boolean;

  /** 获取过渡动画时长 */
  public getThemeTransitionDuration(): number;
}
```

### ThemeManager 扩展方法

```typescript
class ThemeManager {
  previewTheme(name: string, target?: HTMLElement): void;
  cancelPreview(target?: HTMLElement): void;
  isPreviewing(target?: HTMLElement): boolean;
  getPreviewTheme(target?: HTMLElement): string | null;
  onPreviewChange(listener: ThemePreviewListener): () => void;

  enableTransition(options?: ThemeTransitionOptions): void;
  disableTransition(target?: HTMLElement): void;
  isTransitionEnabled(target?: HTMLElement): boolean;
  getTransitionDuration(target?: HTMLElement): number;

  exportTheme(name: string, options?: ThemeExportOptions): string;
  importTheme(
    themeData: string | object,
    options?: ThemeImportOptions,
  ): ACGridTheme;

  registerThemePackage(pkg: ThemePackageMetadata): void;
  unregisterThemePackage(name: string): void;
  getThemePackage(name: string): ThemePackageMetadata | undefined;
  getThemePackages(): ThemePackageMetadata[];
  validateThemePackage(pkg: unknown): ThemeValidationResult;
}
```

### ThemeEditor & cloneTheme

```typescript
class ThemeEditor {
  constructor(baseTheme?: ACGridTheme | string, manager?: ThemeManager);
  setName(name: string): this;
  setDisplayName(displayName: string): this;
  setColor(key: keyof ACGridThemeColors, value: string): this;
  setColors(colors: Partial<ACGridThemeColors>): this;
  setSpacing(spacing: Partial<ACGridThemeSpacing>): this;
  setTypography(typography: DeepPartial<ACGridThemeTypography>): this;
  setBorders(borders: DeepPartial<ACGridThemeBorders>): this;
  setShadows(shadows: Partial<ACGridThemeShadows>): this;
  preview(target?: HTMLElement): this;
  cancelPreview(target?: HTMLElement): this;
  validate(): ThemeValidationResult;
  build(): ACGridTheme;
  save(options?: { overwrite?: boolean }): ACGridTheme;
  export(options?: ThemeExportOptions): string;
}

function createThemeEditor(
  baseTheme?: ACGridTheme | string,
  manager?: ThemeManager,
): ThemeEditor;
function cloneTheme(
  base: ACGridTheme | string,
  newName: string,
  overrides?: DeepPartial<ACGridTheme>,
  manager?: ThemeManager,
): ACGridTheme;
```

## 实现细节

- `packages/theme-base/src/types/theme.ts`: 定义 `ThemePackageMetadata`、`ThemeTransitionOptions`、`ThemeExportOptions`、`ThemeImportOptions`、`DeepPartial` 等；
- `packages/theme-base/src/utils/helpers.ts`: 实现 `themeToCSS`、`deepClone`、`deepMerge`、`removeThemeVariables`；
- `packages/theme-base/src/manager/ThemeManager.ts`: 实现作用域/全局预览与恢复、动画控制、主题导入导出、社区包规范校验与注册；
- `packages/theme-base/src/editor/ThemeEditor.ts`: 实现链式程序化主题编辑器与快速克隆工具；
- `packages/core/src/components/Grid.css`: 添加平滑过渡动画样式规则；
- `packages/core/src/components/Grid.wsx`: 集成主题预览、取消预览、过渡动画配置和事件分发；
- `packages/core/src/utils/create-grid.ts`: 支持 `themeTransition`、`themeTransitionDuration`、`theme` 参数；
- `packages/core/src/index.ts`: 统一导出核心与高级主题 API。

## 测试策略

### 单元与集成测试

- `packages/theme-base/test/theme-advanced.test.ts`: 测试主题预览与取消、动画控制、主题导出（JSON/CSS）、主题导入校验、社区主题包注册与校验、ThemeEditor 链式定制与克隆；
- `packages/core/test/theme-integration.test.ts`: 测试 `createGrid` 主题参数、`grid.applyTheme()`、`grid.previewTheme()` 与 `grid.cancelPreview()`、动画属性响应与事件触发；
- `packages/theme-default/test/themes.test.ts`: 验证默认预设主题完整性与切换预览。

## 性能考虑

- **主题切换耗时**: < 300ms（单次主题切换与 CSS 变量应用耗时实测约 5ms，平滑过渡持续时间受用户配置控制）；
- **主题预览耗时**: < 50ms（实测 < 10ms，即时无闪烁）；
- **导入/导出耗时**: < 5ms。

## 向后兼容性

完全向后兼容。所有高级主题功能均为可选能力，未启用时保持 RFC-0016 纯 CSS 变量零损耗特性。

## 参考资料

- [RFC-0016: 主题系统架构](../0016-theme-system.md)
- [PARITY_MATRIX](../PARITY_MATRIX.md)
- [CSS Transitions (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)
