// 导入主题系统 - 必须在最前面
import "@ac-grid/theme-default";
import { themeManager } from "@ac-grid/theme-base";

// 立即应用 violet 主题（覆盖默认的 light 主题）
// 必须在导入 theme-default 之后立即调用，因为 theme-default 会在导入时应用 light 主题
themeManager.applyTheme("violet");

import "./App.wsx";

/**
 * 初始化应用
 */
function initApp() {
    const appContainer = document.getElementById("app");

    if (!appContainer) {
        return;
    }

    // 确保主题已应用（双重保险）
    themeManager.applyTheme("violet");

    // 挂载 WSX App 组件到 DOM
    // 使用自定义元素标签名（由 @autoRegister 定义）
    appContainer.innerHTML = "<wsx-app></wsx-app>";
}

// DOM 就绪后启动应用
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
