import type { ComponentType } from "../types/components";
import { resolveComponentRef } from "./component-registry";

function applyParamsToElement(
    element: HTMLElement,
    params: Record<string, unknown>,
): void {
    for (const [key, value] of Object.entries(params)) {
        (element as unknown as Record<string, unknown>)[key] = value;
    }
}

/** 渲染自定义组件 — 统一入口 */
export function renderComponent(
    component: ComponentType,
    params: Record<string, unknown> = {},
    context?: unknown,
): HTMLElement | string | number | null {
    const resolved = resolveComponentRef(component);
    if (resolved === undefined) {
        return null;
    }

    if (typeof resolved === "function") {
        const mergedParams =
            context !== undefined ? { ...params, context } : params;
        const result = resolved(mergedParams);
        if (result instanceof HTMLElement) {
            return result;
        }
        if (result == null) {
            return null;
        }
        return result;
    }

    const element = document.createElement(resolved);
    applyParamsToElement(element, params);
    if (context !== undefined) {
        (element as unknown as Record<string, unknown>).context = context;
    }
    return element;
}
