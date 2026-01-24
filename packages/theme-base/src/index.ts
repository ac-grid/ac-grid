/**
 * @systembug/ac-grid-theme-base
 * 
 * AC Grid 主题系统基础包
 * 提供主题管理、主题接口定义和工具函数
 */

// 导出类型
export type {
  ACGridTheme,
  ACGridThemeColors,
  ACGridThemeSpacing,
  ACGridThemeTypography,
  ACGridThemeBorders,
  ACGridThemeShadows,
  ThemeChangeListener,
  ThemeValidationResult,
} from './types/theme';

// 导出主题管理器
export { ThemeManager, themeManager } from './manager/ThemeManager';

// 导出工具函数
export {
  camelToKebab,
  themeToCSSVariables,
  applySystemTheme,
  watchSystemTheme,
} from './utils/helpers';
