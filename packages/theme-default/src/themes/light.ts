/**
 * Light 主题 - AC Grid 默认浅色主题
 */

import type { ACGridTheme } from '@systembug/ac-grid-theme-base';

export const lightTheme: ACGridTheme = {
  name: 'light',
  displayName: 'Light',
  description: 'AC Grid default light theme',
  author: 'AC Grid Team',
  version: '0.1.0',
  colors: {
    primary: '#2563eb', // 更现代的蓝色
    border: '#e5e7eb', // 柔和的边框
    bgHeader: '#f8fafc', // 更清爽的表头背景
    bgHover: '#f1f5f9', // 优雅的悬停效果
    bgCell: '#ffffff',
    bgSelected: '#dbeafe', // 选中状态
    textPrimary: '#0f172a', // 更深的文字，提高对比度
    textSecondary: '#64748b', // 次要文字
    textDisabled: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    width: {
      thin: '1px',
      base: '1px',
      thick: '2px',
    },
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};
