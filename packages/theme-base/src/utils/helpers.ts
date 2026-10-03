/**
 * AC Grid 主题工具函数
 */

import type { ACGridTheme } from "../types/theme";
import { themeManager } from "../manager/ThemeManager";

/**
 * camelCase 转 kebab-case
 * @param str - camelCase 字符串
 * @returns kebab-case 字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * 从主题创建 CSS 变量对象
 * @param theme - 主题定义
 * @returns CSS 变量对象
 */
export function themeToCSSVariables(
  theme: ACGridTheme,
): Record<string, string> {
  const vars: Record<string, string> = {};
  const prefix = "--ac-grid";

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
  lightTheme: string = "light",
  darkTheme: string = "dark",
): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
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
  lightTheme: string = "light",
  darkTheme: string = "dark",
): () => void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    const theme = e.matches ? darkTheme : lightTheme;
    themeManager.applyTheme(theme);
  };

  prefersDark.addEventListener("change", handler);

  // 初始应用
  applySystemTheme(lightTheme, darkTheme);

  // 返回取消监听函数
  return () => {
    prefersDark.removeEventListener("change", handler);
  };
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = deepClone(value);
  }
  return result as T;
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object>(target: T, source: unknown): T {
  if (!source || typeof source !== "object") {
    return target;
  }
  const output = deepClone(target);
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      key in output &&
      typeof (output as any)[key] === "object"
    ) {
      (output as any)[key] = deepMerge((output as any)[key], value);
    } else if (value !== undefined) {
      (output as any)[key] = deepClone(value);
    }
  }
  return output;
}

/**
 * 将主题转换为 CSS 样式文本（RFC-0011 导出功能）
 * @param theme - 主题定义
 * @param selector - CSS 选择器（默认为 :root）
 * @param minify - 是否压缩
 */
export function themeToCSS(
  theme: ACGridTheme,
  selector: string = ":root",
  minify: boolean = false,
): string {
  const vars = themeToCSSVariables(theme);
  const entries = Object.entries(vars);

  if (minify) {
    const rules = entries.map(([k, v]) => `${k}:${v}`).join(";");
    return `${selector}{${rules}}`;
  }

  const lines = entries.map(([k, v]) => `  ${k}: ${v};`).join("\n");
  return `/**\n * AC Grid Theme: ${theme.displayName || theme.name}\n * Version: ${theme.version || "1.0.0"}\n */\n${selector} {\n${lines}\n}`;
}

/**
 * 从元素上移除主题变量（用于预览取消或局部重置）
 */
export function removeThemeVariables(
  element: HTMLElement,
  theme: ACGridTheme,
): void {
  const vars = themeToCSSVariables(theme);
  Object.keys(vars).forEach((key) => {
    element.style.removeProperty(key);
  });
}
