/**
 * Bamboo 主题 - AC Grid 竹子风格主题
 * 使用竹绿色和自然色调色板，营造清新、宁静的视觉效果
 */

import type { ACGridTheme } from "@ac-grid/ac-grid-theme-base";

export const bambooTheme: ACGridTheme = {
    name: "bamboo",
    displayName: "Bamboo",
    description:
        "AC Grid bamboo theme with natural green and bamboo color palette",
    author: "AC Grid Team",
    version: "0.1.0",
    colors: {
        primary: "#22c55e", // Green 500 - 主色调（竹绿色）
        border: "#d1fae5", // Green 100 - 边框（浅竹绿色）
        bgHeader: "#f0fdf4", // Green 50 - 表头背景（极浅绿色）
        bgHover: "#dcfce7", // Green 100 - 悬停效果
        bgCell: "#ffffff",
        bgSelected: "#bbf7d0", // Green 200 - 选中状态
        textPrimary: "#14532d", // Green 900 - 深绿色文字（如竹叶）
        textSecondary: "#65a30d", // Lime 600 - 次要文字（竹竿色）
        textDisabled: "#86efac", // Green 300 - 禁用文字
        success: "#22c55e", // Green 500
        warning: "#eab308", // Yellow 500
        error: "#dc2626", // Red 600
        info: "#0ea5e9", // Sky 500
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
        sm: "0 1px 2px 0 rgba(34, 197, 94, 0.1)",
        md: "0 4px 6px -1px rgba(34, 197, 94, 0.15)",
        lg: "0 10px 15px -3px rgba(34, 197, 94, 0.2)",
        xl: "0 20px 25px -5px rgba(34, 197, 94, 0.25)",
    },
};
