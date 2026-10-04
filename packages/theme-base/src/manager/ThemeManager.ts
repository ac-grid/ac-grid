/**
 * AC Grid 主题管理器
 *
 * 单例模式，管理所有已注册的主题，提供主题注册、应用、切换、预览、动画、导入导出等功能
 */

import type {
  ACGridTheme,
  ThemeChangeListener,
  ThemePreviewListener,
  ThemeValidationResult,
  ThemePackageMetadata,
  ThemeTransitionOptions,
  ThemeExportOptions,
  ThemeImportOptions,
} from "../types/theme";
import {
  themeToCSSVariables,
  themeToCSS,
  removeThemeVariables,
  deepClone,
} from "../utils/helpers";

/**
 * 主题管理器类
 */
export class ThemeManager {
  private themes: Map<string, ACGridTheme> = new Map();
  private packages: Map<string, ThemePackageMetadata> = new Map();
  private currentTheme: string | null = null;
  private previewThemeName: string | null = null;
  private previousThemeBeforePreview: string | null = null;
  private targetPreviews: WeakMap<
    HTMLElement,
    { previewTheme: string; previousTheme: string | null }
  > = new WeakMap();
  private targetThemes: WeakMap<HTMLElement, string> = new WeakMap();
  private listeners: Set<ThemeChangeListener> = new Set();
  private previewListeners: Set<ThemePreviewListener> = new Set();

  /**
   * 注册主题
   * @param theme - 主题定义
   * @throws 如果主题名称已存在或无效
   */
  registerTheme(theme: ACGridTheme): void {
    if (this.themes.has(theme.name)) {
      throw new Error(`Theme "${theme.name}" is already registered`);
    }

    // 验证主题
    const validation = this.validateTheme(theme);
    if (!validation.valid) {
      throw new Error(`Invalid theme: ${validation.errors?.join(", ")}`);
    }

    this.themes.set(theme.name, deepClone(theme));
  }

  /**
   * 取消注册主题
   * @param name - 主题名称
   */
  unregisterTheme(name: string): void {
    if (this.currentTheme === name) {
      this.currentTheme = null;
    }
    if (this.previewThemeName === name) {
      this.cancelPreview();
    }
    this.themes.delete(name);
  }

  /**
   * 应用主题（设置 CSS 变量）
   * @param name - 主题名称
   * @param target - 可选目标元素，若不传则应用到 document.documentElement
   * @throws 如果主题不存在
   */
  applyTheme(name: string, target?: HTMLElement): void {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme "${name}" not found`);
    }

    const element =
      target ||
      (typeof document !== "undefined" ? document.documentElement : null);
    if (element) {
      const cssVars = themeToCSSVariables(theme);
      Object.entries(cssVars).forEach(([key, value]) => {
        element.style.setProperty(key, value);
      });
    }

    if (target) {
      this.targetPreviews.delete(target);
      this.targetThemes.set(target, name);
    } else {
      const previousTheme = this.currentTheme;
      this.previewThemeName = null;
      this.previousThemeBeforePreview = null;
      this.currentTheme = name;

      // 通知监听器
      this.listeners.forEach((listener) => {
        listener(name, previousTheme);
      });
    }
  }

  /**
   * 预览主题（不持久化为正式当前主题，支持随后 cancelPreview 恢复）
   * @param name - 主题名称
   * @param target - 可选目标元素
   */
  previewTheme(name: string, target?: HTMLElement): void {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme "${name}" not found`);
    }

    const element =
      target ||
      (typeof document !== "undefined" ? document.documentElement : null);
    if (element) {
      const cssVars = themeToCSSVariables(theme);
      Object.entries(cssVars).forEach(([key, value]) => {
        element.style.setProperty(key, value);
      });
    }

    if (target) {
      const existingPreview = this.targetPreviews.get(target);
      const prev = existingPreview
        ? existingPreview.previousTheme
        : this.targetThemes.get(target) || null;
      this.targetPreviews.set(target, {
        previewTheme: name,
        previousTheme: prev,
      });
    } else {
      if (!this.previewThemeName) {
        this.previousThemeBeforePreview = this.currentTheme;
      }
      this.previewThemeName = name;

      this.previewListeners.forEach((listener) => {
        listener(name, this.currentTheme);
      });
    }
  }

  /**
   * 取消主题预览，恢复之前应用的主题
   * @param target - 可选目标元素
   */
  cancelPreview(target?: HTMLElement): void {
    if (target) {
      const preview = this.targetPreviews.get(target);
      if (!preview) return;

      if (preview.previousTheme && this.themes.has(preview.previousTheme)) {
        this.applyTheme(preview.previousTheme, target);
      } else {
        const previewThemeDef = this.themes.get(preview.previewTheme);
        if (previewThemeDef) {
          removeThemeVariables(target, previewThemeDef);
        }
        this.targetThemes.delete(target);
      }
      this.targetPreviews.delete(target);
    } else {
      if (!this.previewThemeName) return;

      const previousTheme = this.previousThemeBeforePreview;
      const previewedThemeDef = this.previewThemeName
        ? this.themes.get(this.previewThemeName)
        : null;
      this.previewThemeName = null;
      this.previousThemeBeforePreview = null;

      if (previousTheme && this.themes.has(previousTheme)) {
        this.applyTheme(previousTheme);
      } else if (typeof document !== "undefined" && document.documentElement) {
        // 清除根节点上之前预览设置的变量
        if (previewedThemeDef) {
          removeThemeVariables(document.documentElement, previewedThemeDef);
        }
      }

      this.previewListeners.forEach((listener) => {
        listener(null, this.currentTheme);
      });
    }
  }

  /**
   * 检查是否正处于主题预览模式
   */
  isPreviewing(target?: HTMLElement): boolean {
    if (target) {
      return this.targetPreviews.has(target);
    }
    return this.previewThemeName !== null;
  }

  /**
   * 获取当前预览的主题名称
   */
  getPreviewTheme(target?: HTMLElement): string | null {
    if (target) {
      return this.targetPreviews.get(target)?.previewTheme || null;
    }
    return this.previewThemeName;
  }

  /**
   * 监听主题预览变化
   */
  onPreviewChange(listener: ThemePreviewListener): () => void {
    this.previewListeners.add(listener);
    return () => {
      this.previewListeners.delete(listener);
    };
  }

  /**
   * 开启主题平滑过渡动画（RFC-0011）
   */
  enableTransition(options: ThemeTransitionOptions = {}): void {
    const { duration = 200, timingFunction = "ease", target } = options;
    const element =
      target ||
      (typeof document !== "undefined" ? document.documentElement : null);
    if (!element) return;

    element.style.setProperty(
      "--ac-grid-theme-transition-duration",
      `${duration}ms`,
    );
    element.style.setProperty(
      "--ac-grid-theme-transition-timing",
      timingFunction,
    );
    element.setAttribute("data-theme-transition", "true");
    element.classList.add("ac-grid-theme-transition");
  }

  /**
   * 关闭主题平滑过渡动画
   */
  disableTransition(target?: HTMLElement): void {
    const element =
      target ||
      (typeof document !== "undefined" ? document.documentElement : null);
    if (!element) return;

    element.removeAttribute("data-theme-transition");
    element.classList.remove("ac-grid-theme-transition");
  }

  /**
   * 检查过渡动画是否已开启
   */
  isTransitionEnabled(target?: HTMLElement): boolean {
    const element =
      target ||
      (typeof document !== "undefined" ? document.documentElement : null);
    if (!element) return false;
    return (
      element.getAttribute("data-theme-transition") === "true" ||
      element.classList.contains("ac-grid-theme-transition")
    );
  }

  /**
   * 获取当前设置的动画过渡时长（毫秒）
   */
  getTransitionDuration(target?: HTMLElement): number {
    const element =
      target ||
      (typeof document !== "undefined" ? document.documentElement : null);
    if (!element) return 0;
    const val = element.style.getPropertyValue(
      "--ac-grid-theme-transition-duration",
    );
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 200 : parsed;
  }

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(target?: HTMLElement): string | null {
    if (target) {
      return this.targetThemes.get(target) || this.currentTheme;
    }
    return this.currentTheme;
  }

  /**
   * 获取当前主题定义
   */
  getCurrentThemeDefinition(target?: HTMLElement): ACGridTheme | null {
    const themeName = this.getCurrentTheme(target);
    if (!themeName) return null;
    return this.themes.get(themeName) || null;
  }

  /**
   * 获取所有已注册的主题名称
   */
  getThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 获取主题定义
   * @param name - 主题名称
   */
  getTheme(name: string): ACGridTheme | undefined {
    return this.themes.get(name);
  }

  /**
   * 检查主题是否已注册
   * @param name - 主题名称
   */
  hasTheme(name: string): boolean {
    return this.themes.has(name);
  }

  /**
   * 监听主题变化
   * @param listener - 主题变化回调
   * @returns 取消监听函数
   */
  onThemeChange(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 导出主题为指定格式（JSON 或 CSS）
   * @param name - 主题名称
   * @param options - 导出选项
   */
  exportTheme(name: string, options: ThemeExportOptions = {}): string {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme "${name}" not found`);
    }

    const { format = "json", selector = ":root", minify = false } = options;
    if (format === "css") {
      return themeToCSS(theme, selector, minify);
    }
    return JSON.stringify(theme, null, minify ? 0 : 2);
  }

  /**
   * 从 JSON 导入主题
   * @param themeData - JSON 字符串或主题对象
   * @param options - 导入选项
   */
  importTheme(
    themeData: string | object,
    options: ThemeImportOptions = {},
  ): ACGridTheme {
    const { autoRegister = true, overwrite = false } = options;

    let theme: ACGridTheme;
    if (typeof themeData === "string") {
      try {
        theme = JSON.parse(themeData);
      } catch (err: any) {
        throw new Error(`Failed to parse theme JSON: ${err.message}`);
      }
    } else {
      theme = deepClone(themeData) as ACGridTheme;
    }

    const validation = this.validateTheme(theme);
    if (!validation.valid) {
      throw new Error(`Invalid theme: ${validation.errors?.join(", ")}`);
    }

    if (this.themes.has(theme.name)) {
      if (!overwrite) {
        throw new Error(
          `Theme "${theme.name}" is already registered. Set overwrite to true to replace.`,
        );
      }
      this.unregisterTheme(theme.name);
    }

    if (autoRegister) {
      this.registerTheme(theme);
    }

    return theme;
  }

  /**
   * 注册社区主题包（RFC-0011 规范）
   * @param pkg - 主题包元数据及主题列表
   */
  registerThemePackage(pkg: ThemePackageMetadata): void {
    const validation = this.validateThemePackage(pkg);
    if (!validation.valid) {
      throw new Error(
        `Invalid theme package: ${validation.errors?.join(", ")}`,
      );
    }

    pkg.themes.forEach((theme) => {
      if (this.themes.has(theme.name)) {
        this.unregisterTheme(theme.name);
      }
      this.registerTheme(theme);
    });

    this.packages.set(pkg.name, deepClone(pkg));

    if (
      pkg.defaultTheme &&
      !this.currentTheme &&
      this.themes.has(pkg.defaultTheme)
    ) {
      this.applyTheme(pkg.defaultTheme);
    }
  }

  /**
   * 取消注册社区主题包
   */
  unregisterThemePackage(name: string): void {
    const pkg = this.packages.get(name);
    if (pkg) {
      pkg.themes.forEach((theme) => {
        this.unregisterTheme(theme.name);
      });
      this.packages.delete(name);
    }
  }

  /**
   * 获取指定社区主题包
   */
  getThemePackage(name: string): ThemePackageMetadata | undefined {
    return this.packages.get(name);
  }

  /**
   * 获取所有已注册的社区主题包列表
   */
  getThemePackages(): ThemePackageMetadata[] {
    return Array.from(this.packages.values());
  }

  /**
   * 验证社区主题包元数据
   */
  validateThemePackage(pkg: unknown): ThemeValidationResult {
    const errors: string[] = [];
    if (!pkg || typeof pkg !== "object") {
      return { valid: false, errors: ["Theme package must be an object"] };
    }

    const candidate = pkg as Record<string, any>;
    if (!candidate.name || typeof candidate.name !== "string") {
      errors.push("Package name is required and must be a string");
    }
    if (!candidate.version || typeof candidate.version !== "string") {
      errors.push("Package version is required and must be a string");
    }
    if (!Array.isArray(candidate.themes) || candidate.themes.length === 0) {
      errors.push(
        'Package must contain at least one theme in the "themes" array',
      );
    } else {
      candidate.themes.forEach((theme: any, index: number) => {
        const res = this.validateTheme(theme);
        if (!res.valid) {
          errors.push(
            `Theme at index ${index} is invalid: ${res.errors?.join(", ")}`,
          );
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 验证主题定义是否有效
   * @param theme - 主题定义
   * @returns 验证结果
   */
  validateTheme(theme: ACGridTheme): ThemeValidationResult {
    const errors: string[] = [];

    if (!theme || typeof theme !== "object") {
      return { valid: false, errors: ["Theme must be an object"] };
    }

    if (!theme.name || typeof theme.name !== "string") {
      errors.push("Theme name is required");
    }

    if (!theme.colors || typeof theme.colors !== "object") {
      errors.push("Theme colors are required");
    }

    if (!theme.spacing || typeof theme.spacing !== "object") {
      errors.push("Theme spacing is required");
    }

    if (!theme.typography || typeof theme.typography !== "object") {
      errors.push("Theme typography is required");
    }

    if (!theme.borders || typeof theme.borders !== "object") {
      errors.push("Theme borders are required");
    }

    if (!theme.shadows || typeof theme.shadows !== "object") {
      errors.push("Theme shadows are required");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// 导出单例实例
export const themeManager = new ThemeManager();
