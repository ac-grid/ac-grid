/**
 * Dark 主题 - AC Grid 默认深色主题
 */

import type { ACGridTheme } from "@ac-grid/ac-grid-theme-base";

export const darkTheme: ACGridTheme = {
    name: "dark",
    displayName: "Dark",
    description: "AC Grid default dark theme",
    author: "AC Grid Team",
    version: "0.1.0",
    colors: {
        primary: "#3b82f6",
        border: "#374151",
        bgHeader: "#1f2937",
        bgHover: "#374151",
        bgCell: "#111827",
        bgSelected: "#1e3a8a",
        textPrimary: "#f9fafb",
        textSecondary: "#d1d5db",
        textDisabled: "#6b7280",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
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
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
    },
};
