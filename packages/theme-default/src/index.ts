/**
 * @systembug/ac-grid-theme-default
 * 
 * AC Grid 默认主题预设包
 * 自动注册 Light 和 Dark 主题，并默认应用 Light 主题
 */

import { themeManager } from '@systembug/ac-grid-theme-base';
import { lightTheme } from './themes/light';
import { darkTheme } from './themes/dark';

// 自动注册主题
themeManager.registerTheme(lightTheme);
themeManager.registerTheme(darkTheme);

// 默认应用 light 主题
themeManager.applyTheme('light');

// 导出主题定义（用户可以基于这些主题进行扩展）
export { lightTheme, darkTheme };
