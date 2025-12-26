import "./App.wsx";

/**
 * 初始化应用
 */
function initApp() {
    const appContainer = document.getElementById("app");

    if (!appContainer) {
        return;
    }

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
