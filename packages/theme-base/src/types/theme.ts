/**
 * AC Grid 主题系统类型定义
 * 
 * 定义了主题的完整类型接口，包括颜色、间距、排版、边框、阴影等
 */

/**
 * 主题颜色定义
 */
export interface ACGridThemeColors {
  /** 主色调 */
  primary: string;
  /** 边框颜色 */
  border: string;
  /** 表头背景色 */
  bgHeader: string;
  /** 悬停背景色 */
  bgHover: string;
  /** 单元格背景色 */
  bgCell: string;
  /** 选中行背景色 */
  bgSelected: string;
  /** 主文本颜色 */
  textPrimary: string;
  /** 次要文本颜色 */
  textSecondary: string;
  /** 禁用文本颜色 */
  textDisabled: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
}

/**
 * 主题间距定义
 */
export interface ACGridThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 主题排版定义
 */
export interface ACGridThemeTypography {
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * 主题边框定义
 */
export interface ACGridThemeBorders {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  width: {
    thin: string;
    base: string;
    thick: string;
  };
}

/**
 * 主题阴影定义
 */
export interface ACGridThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 完整的主题定义接口
 */
export interface ACGridTheme {
  /** 主题名称（唯一标识） */
  name: string;
  /** 主题显示名称 */
  displayName?: string;
  /** 主题描述 */
  description?: string;
  /** 主题作者 */
  author?: string;
  /** 主题版本 */
  version?: string;
  /** 颜色定义 */
  colors: ACGridThemeColors;
  /** 间距定义 */
  spacing: ACGridThemeSpacing;
  /** 排版定义 */
  typography: ACGridThemeTypography;
  /** 边框定义 */
  borders: ACGridThemeBorders;
  /** 阴影定义 */
  shadows: ACGridThemeShadows;
}

/**
 * 主题变化监听器
 */
export type ThemeChangeListener = (
  currentTheme: string,
  previousTheme: string | null
) => void;

/**
 * 主题验证结果
 */
export interface ThemeValidationResult {
  valid: boolean;
  errors?: string[];
}
