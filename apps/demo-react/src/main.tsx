import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import VirtualScrollingDemo from "./VirtualScrollingDemo.tsx";
import "./index.css";

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
