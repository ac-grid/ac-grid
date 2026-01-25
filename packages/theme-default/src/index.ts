/**
 * @ac-grid/theme-default
 *
 * AC Grid 默认主题预设包
 * 自动注册 Light 和 Dark 主题，并默认应用 Light 主题
 */

import { themeManager } from "@ac-grid/theme-base";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";
import { oceanTheme } from "./themes/ocean";
import { forestTheme } from "./themes/forest";
import { sunsetTheme } from "./themes/sunset";
import { bambooTheme } from "./themes/bamboo";

// 自动注册所有主题
themeManager.registerTheme(lightTheme);
themeManager.registerTheme(darkTheme);
themeManager.registerTheme(oceanTheme);
themeManager.registerTheme(forestTheme);
themeManager.registerTheme(sunsetTheme);
themeManager.registerTheme(bambooTheme);

// 默认应用 light 主题
themeManager.applyTheme("light");

// 导出主题定义（用户可以基于这些主题进行扩展）
export {
    lightTheme,
    darkTheme,
    oceanTheme,
    forestTheme,
    sunsetTheme,
    bambooTheme,
};
