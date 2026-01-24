/**
 * AC Grid 主题工具函数
 */

import type { ACGridTheme } from '../types/theme';
import { themeManager } from '../manager/ThemeManager';

/**
 * camelCase 转 kebab-case
 * @param str - camelCase 字符串
 * @returns kebab-case 字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 从主题创建 CSS 变量对象
 * @param theme - 主题定义
 * @returns CSS 变量对象
 */
export function themeToCSSVariables(
  theme: ACGridTheme
): Record<string, string> {
  const vars: Record<string, string> = {};
  const prefix = '--ac-grid';

  // 颜色
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`${prefix}-${camelToKebab(key)}`] = value;
  });

  // 间距
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`${prefix}-spacing-${key}`] = value;
  });

  // 字体大小
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    vars[`${prefix}-font-size-${key}`] = value;
  });

  // 字体粗细
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    vars[`${prefix}-font-weight-${key}`] = String(value);
  });

  // 行高
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    vars[`${prefix}-line-height-${key}`] = value;
  });

  // 边框圆角
  Object.entries(theme.borders.radius).forEach(([key, value]) => {
    vars[`${prefix}-border-radius-${key}`] = value;
  });

  // 边框宽度
  Object.entries(theme.borders.width).forEach(([key, value]) => {
    vars[`${prefix}-border-width-${key}`] = value;
  });

  // 阴影
  Object.entries(theme.shadows).forEach(([key, value]) => {
    vars[`${prefix}-shadow-${key}`] = value;
  });

  return vars;
}

/**
 * 从系统主题偏好应用主题
 * @param lightTheme - 浅色主题名称
 * @param darkTheme - 深色主题名称
 */
export function applySystemTheme(
  lightTheme: string = 'light',
  darkTheme: string = 'dark'
): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = prefersDark.matches ? darkTheme : lightTheme;
  themeManager.applyTheme(theme);
}

/**
 * 监听系统主题变化并自动应用
 * @param lightTheme - 浅色主题名称
 * @param darkTheme - 深色主题名称
 * @returns 取消监听函数
 */
export function watchSystemTheme(
  lightTheme: string = 'light',
  darkTheme: string = 'dark'
): () => void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    const theme = e.matches ? darkTheme : lightTheme;
    themeManager.applyTheme(theme);
  };

  prefersDark.addEventListener('change', handler);

  // 初始应用
  applySystemTheme(lightTheme, darkTheme);

  // 返回取消监听函数
  return () => {
    prefersDark.removeEventListener('change', handler);
  };
}
