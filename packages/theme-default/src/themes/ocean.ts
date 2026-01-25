/**
 * Ocean 主题 - AC Grid 海洋风格主题
 * 使用蓝色和青色调色板，营造清新、专业的视觉效果
 */

import type { ACGridTheme } from "@ac-grid/ac-grid-theme-base";

export const oceanTheme: ACGridTheme = {
    name: "ocean",
    displayName: "Ocean",
    description: "AC Grid ocean theme with blue and cyan color palette",
    author: "AC Grid Team",
    version: "0.1.0",
    colors: {
        primary: "#0ea5e9", // Sky blue - 主色调
        border: "#cbd5e1", // Light slate - 边框
        bgHeader: "#f0f9ff", // Sky 50 - 表头背景（浅蓝色）
        bgHover: "#e0f2fe", // Sky 100 - 悬停效果
        bgCell: "#ffffff",
        bgSelected: "#bae6fd", // Sky 200 - 选中状态
        textPrimary: "#0c4a6e", // Sky 900 - 深蓝色文字
        textSecondary: "#64748b", // Slate 500 - 次要文字
        textDisabled: "#94a3b8", // Slate 400
        success: "#10b981", // Emerald 500
        warning: "#f59e0b", // Amber 500
        error: "#ef4444", // Red 500
        info: "#06b6d4", // Cyan 500
    },
    spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
    },
    typography: {
        fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
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
            sm: "0.125rem",
            md: "0.25rem",
            lg: "0.5rem",
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
        sm: "0 1px 2px 0 rgba(14, 165, 233, 0.1)",
        md: "0 4px 6px -1px rgba(14, 165, 233, 0.15)",
        lg: "0 10px 15px -3px rgba(14, 165, 233, 0.2)",
        xl: "0 20px 25px -5px rgba(14, 165, 233, 0.25)",
    },
};
