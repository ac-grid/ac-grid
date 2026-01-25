/**
 * Violet 主题 - AC Grid 深紫色主题（深色模式）
 */

import type { ACGridTheme } from "@ac-grid/theme-base";

export const violetTheme: ACGridTheme = {
    name: "violet",
    displayName: "Violet",
    description: "AC Grid dark violet theme with purple color palette",
    author: "AC Grid Team",
    version: "0.1.0",
    colors: {
        primary: "#8b5cf6", // Violet 500
        border: "rgba(139, 92, 246, 0.3)", // 半透明紫色边框
        bgHeader: "rgba(49, 46, 129, 0.6)", // 深紫色表头背景
        bgHover: "rgba(76, 29, 149, 0.4)", // 悬停效果
        bgCell: "rgba(30, 27, 75, 0.5)", // 深色单元格背景
        bgSelected: "rgba(109, 40, 217, 0.3)", // 紫色选中状态
        textPrimary: "#c4b5fd", // Violet 300 - 浅紫色文字
        textSecondary: "rgba(196, 181, 253, 0.7)", // 次要文字
        textDisabled: "rgba(196, 181, 253, 0.4)",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#8b5cf6",
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
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
    },
};
