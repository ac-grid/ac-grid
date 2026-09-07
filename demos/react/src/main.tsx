import React from "react";
import ReactDOM from "react-dom/client";
import "@ac-grid/theme-default";
import { themeManager } from "@ac-grid/theme-base";

import App from "./App.tsx";
import VirtualScrollingDemo from "./VirtualScrollingDemo.tsx";
import "./index.css";

themeManager.applyTheme("violet");

const isVirtualScrollE2E =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("e2e") === "virtual-scroll";

ReactDOM.createRoot(document.getElementById("root")!).render(
    isVirtualScrollE2E ? (
        <VirtualScrollingDemo />
    ) : (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    ),
);
