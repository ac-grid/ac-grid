/**
 * AC Grid Documentation Site - Main Entry Point
 */

import "uno.css";
import "./main.css";
// Import base components package (includes CSS)
import "@wsxjs/wsx-base-components";
// Initialize error handler
import { ErrorHandler } from "./utils/error-handler";
import "./App.wsx";

// Initialize the application
function initApp() {
    // 初始化全局错误处理
    ErrorHandler.init();

    const appContainer = document.getElementById("app");

    if (!appContainer) {
        console.error("App container not found");
        return;
    }

    // Mount the AC Grid App component
    const appElement = document.createElement("ac-grid-app");
    appContainer.appendChild(appElement);

    console.info("AC Grid Documentation Site initialized");
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
