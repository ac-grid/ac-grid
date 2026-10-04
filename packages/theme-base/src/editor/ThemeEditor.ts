/**
 * AC Grid 主题编辑器（RFC-0011）
 *
 * 提供程序化主题创建、定制、编辑、实时预览与构建工具
 */

import type {
  ACGridTheme,
  ACGridThemeColors,
  ACGridThemeSpacing,
  ACGridThemeTypography,
  ACGridThemeBorders,
  ACGridThemeShadows,
  DeepPartial,
  ThemeValidationResult,
  ThemeExportOptions,
} from "../types/theme";
import { ThemeManager, themeManager } from "../manager/ThemeManager";
import { deepClone, deepMerge, themeToCSS } from "../utils/helpers";

/** 默认骨架主题 */
const DEFAULT_SKELETON_THEME: ACGridTheme = {
  name: "custom-theme",
  displayName: "Custom Theme",
  colors: {
    primary: "#1677ff",
    border: "#d9d9d9",
    bgHeader: "#fafafa",
    bgHover: "#f5f5f5",
    bgCell: "#ffffff",
    bgPopup: "#ffffff",
    bgSelected: "#e6f4ff",
    textPrimary: "#1f1f1f",
    textSecondary: "#666666",
    textDisabled: "#bfbfbf",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    info: "#1677ff",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "13px",
      base: "14px",
      lg: "16px",
      xl: "18px",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  borders: {
    radius: {
      none: "0",
      sm: "2px",
      md: "4px",
      lg: "8px",
      full: "9999px",
    },
    width: {
      thin: "1px",
      base: "1px",
      thick: "2px",
    },
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
};

/**
 * 主题编辑器类
 */
export class ThemeEditor {
  private initialDraft: ACGridTheme;
  private draft: ACGridTheme;
  private manager: ThemeManager;

  constructor(
    baseTheme?: ACGridTheme | string,
    manager: ThemeManager = themeManager,
  ) {
    this.manager = manager;
    if (typeof baseTheme === "string") {
      const found = this.manager.getTheme(baseTheme);
      if (!found) {
        throw new Error(`Base theme "${baseTheme}" not found in themeManager`);
      }
      this.initialDraft = deepClone(found);
    } else if (baseTheme) {
      this.initialDraft = deepClone(baseTheme);
    } else {
      this.initialDraft = deepClone(DEFAULT_SKELETON_THEME);
    }
    this.draft = deepClone(this.initialDraft);
  }

  /** 设置主题唯一标识名 */
  setName(name: string): this {
    this.draft.name = name;
    return this;
  }

  /** 设置主题显示名称 */
  setDisplayName(displayName: string): this {
    this.draft.displayName = displayName;
    return this;
  }

  /** 设置主题描述 */
  setDescription(description: string): this {
    this.draft.description = description;
    return this;
  }

  /** 设置主题作者 */
  setAuthor(author: string): this {
    this.draft.author = author;
    return this;
  }

  /** 设置主题版本 */
  setVersion(version: string): this {
    this.draft.version = version;
    return this;
  }

  /** 设置单个颜色 */
  setColor(key: keyof ACGridThemeColors, value: string): this {
    this.draft.colors[key] = value;
    return this;
  }

  /** 批量设置颜色 */
  setColors(colors: Partial<ACGridThemeColors>): this {
    this.draft.colors = { ...this.draft.colors, ...colors };
    return this;
  }

  /** 设置间距 */
  setSpacing(spacing: Partial<ACGridThemeSpacing>): this {
    this.draft.spacing = { ...this.draft.spacing, ...spacing };
    return this;
  }

  /** 设置排版 */
  setTypography(typography: DeepPartial<ACGridThemeTypography>): this {
    this.draft.typography = deepMerge(this.draft.typography, typography);
    return this;
  }

  /** 设置边框 */
  setBorders(borders: DeepPartial<ACGridThemeBorders>): this {
    this.draft.borders = deepMerge(this.draft.borders, borders);
    return this;
  }

  /** 设置阴影 */
  setShadows(shadows: Partial<ACGridThemeShadows>): this {
    this.draft.shadows = { ...this.draft.shadows, ...shadows };
    return this;
  }

  /** 实时预览当前草稿主题 */
  preview(target?: HTMLElement): this {
    const tempName = `__preview_${this.draft.name}`;
    const previewTheme: ACGridTheme = {
      ...deepClone(this.draft),
      name: tempName,
    };

    if (this.manager.hasTheme(tempName)) {
      this.manager.unregisterTheme(tempName);
    }
    this.manager.registerTheme(previewTheme);
    this.manager.previewTheme(tempName, target);
    return this;
  }

  /** 取消预览并清理临时预览主题 */
  cancelPreview(target?: HTMLElement): this {
    this.manager.cancelPreview(target);
    const tempName = `__preview_${this.draft.name}`;
    if (this.manager.hasTheme(tempName)) {
      this.manager.unregisterTheme(tempName);
    }
    return this;
  }

  /** 验证当前主题草稿 */
  validate(): ThemeValidationResult {
    return this.manager.validateTheme(this.draft);
  }

  /** 重置为初始草稿 */
  reset(): this {
    this.draft = deepClone(this.initialDraft);
    return this;
  }

  /** 获取当前草稿主题对象（克隆） */
  build(): ACGridTheme {
    const val = this.validate();
    if (!val.valid) {
      throw new Error(`Cannot build invalid theme: ${val.errors?.join(", ")}`);
    }
    return deepClone(this.draft);
  }

  /** 保存并注册到 ThemeManager */
  save(options: { overwrite?: boolean } = {}): ACGridTheme {
    const built = this.build();
    if (this.manager.hasTheme(built.name)) {
      if (!options.overwrite) {
        throw new Error(
          `Theme "${built.name}" is already registered. Use { overwrite: true } to replace.`,
        );
      }
      this.manager.unregisterTheme(built.name);
    }
    this.manager.registerTheme(built);
    return built;
  }

  /** 导出当前主题草稿 */
  export(options: ThemeExportOptions = {}): string {
    const { format = "json", selector = ":root", minify = false } = options;
    if (format === "css") {
      return themeToCSS(this.draft, selector, minify);
    }
    return JSON.stringify(this.draft, null, minify ? 0 : 2);
  }
}

/**
 * 创建主题编辑器实例
 */
export function createThemeEditor(
  baseTheme?: ACGridTheme | string,
  manager: ThemeManager = themeManager,
): ThemeEditor {
  return new ThemeEditor(baseTheme, manager);
}

/**
 * 快速基于已有主题克隆并覆盖生成新主题
 */
export function cloneTheme(
  base: ACGridTheme | string,
  newName: string,
  overrides?: DeepPartial<ACGridTheme>,
  manager: ThemeManager = themeManager,
): ACGridTheme {
  const editor = new ThemeEditor(base, manager);
  editor.setName(newName);
  if (overrides) {
    if (overrides.displayName) editor.setDisplayName(overrides.displayName);
    if (overrides.description) editor.setDescription(overrides.description);
    if (overrides.author) editor.setAuthor(overrides.author);
    if (overrides.version) editor.setVersion(overrides.version);
    if (overrides.colors)
      editor.setColors(overrides.colors as Partial<ACGridThemeColors>);
    if (overrides.spacing)
      editor.setSpacing(overrides.spacing as Partial<ACGridThemeSpacing>);
    if (overrides.typography) editor.setTypography(overrides.typography);
    if (overrides.borders) editor.setBorders(overrides.borders);
    if (overrides.shadows)
      editor.setShadows(overrides.shadows as Partial<ACGridThemeShadows>);
  }
  return editor.build();
}
