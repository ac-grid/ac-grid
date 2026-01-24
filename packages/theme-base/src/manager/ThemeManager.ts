/**
 * AC Grid 主题管理器
 * 
 * 单例模式，管理所有已注册的主题，提供主题注册、应用、切换等功能
 */

import type {
  ACGridTheme,
  ThemeChangeListener,
  ThemeValidationResult,
} from '../types/theme';
import { themeToCSSVariables } from '../utils/helpers';

/**
 * 主题管理器类
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
  registerTheme(theme: ACGridTheme): void {
    if (this.themes.has(theme.name)) {
      throw new Error(`Theme "${theme.name}" is already registered`);
    }

    // 验证主题
    const validation = this.validateTheme(theme);
    if (!validation.valid) {
      throw new Error(
        `Invalid theme: ${validation.errors?.join(', ')}`
      );
    }

    this.themes.set(theme.name, theme);
  }

  /**
   * 取消注册主题
   * @param name - 主题名称
   */
  unregisterTheme(name: string): void {
    this.themes.delete(name);
  }

  /**
   * 应用主题（设置 CSS 变量）
   * @param name - 主题名称
   * @throws 如果主题不存在
   */
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
    this.listeners.forEach((listener) => {
      listener(name, previousTheme);
    });
  }

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string | null {
    return this.currentTheme;
  }

  /**
   * 获取当前主题定义
   */
  getCurrentThemeDefinition(): ACGridTheme | null {
    if (!this.currentTheme) return null;
    return this.themes.get(this.currentTheme) || null;
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
   * 验证主题定义是否有效
   * @param theme - 主题定义
   * @returns 验证结果
   */
  validateTheme(theme: ACGridTheme): ThemeValidationResult {
    const errors: string[] = [];

    if (!theme.name) {
      errors.push('Theme name is required');
    }

    if (!theme.colors) {
      errors.push('Theme colors are required');
    }

    if (!theme.spacing) {
      errors.push('Theme spacing is required');
    }

    if (!theme.typography) {
      errors.push('Theme typography is required');
    }

    if (!theme.borders) {
      errors.push('Theme borders are required');
    }

    if (!theme.shadows) {
      errors.push('Theme shadows are required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// 导出单例实例
export const themeManager = new ThemeManager();
