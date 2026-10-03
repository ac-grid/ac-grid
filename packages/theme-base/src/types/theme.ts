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
  /** 弹出菜单背景色（不透明，用于 portal/dropdown） */
  bgPopup?: string;
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
  previousTheme: string | null,
) => void;

/**
 * 主题预览变化监听器
 */
export type ThemePreviewListener = (
  previewTheme: string | null,
  currentTheme: string | null,
) => void;

/**
 * 主题验证结果
 */
export interface ThemeValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * 递归深度 Partial 类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

/**
 * 社区主题包元数据规范（RFC-0011）
 */
export interface ThemePackageMetadata {
  /** 主题包名称 (例如 @awesome-dev/ac-grid-theme-cyberpunk) */
  name: string;
  /** 主题包版本 (遵循 SemVer) */
  version: string;
  /** 主题包描述 */
  description?: string;
  /** 主题包作者 */
  author?: string;
  /** 开源协议 (例如 MIT, Apache-2.0) */
  license?: string;
  /** 主页链接 */
  homepage?: string;
  /** 代码仓库 */
  repository?: string;
  /** 包含的主题列表 */
  themes: ACGridTheme[];
  /** 默认主题名称 */
  defaultTheme?: string;
}

/**
 * 主题切换过渡配置（RFC-0011）
 */
export interface ThemeTransitionOptions {
  /** 过渡时长（毫秒，默认 200） */
  duration?: number;
  /** 缓动函数（默认 'ease'） */
  timingFunction?: string;
  /** 目标容器元素（默认 document.documentElement） */
  target?: HTMLElement;
}

/**
 * 主题导出配置（RFC-0011）
 */
export interface ThemeExportOptions {
  /** 导出格式：JSON 或 CSS 样式表（默认 'json'） */
  format?: "json" | "css";
  /** CSS 选择器（当 format 为 'css' 时生效，默认 ':root'） */
  selector?: string;
  /** 是否压缩输出（默认 false） */
  minify?: boolean;
}

/**
 * 主题导入配置（RFC-0011）
 */
export interface ThemeImportOptions {
  /** 是否自动注册至 ThemeManager（默认 true） */
  autoRegister?: boolean;
  /** 若主题已存在是否允许覆盖（默认 false） */
  overwrite?: boolean;
}
