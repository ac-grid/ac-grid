import type { ComponentType } from "../types/components";
import { renderComponent } from "./render-component";

/** 将自定义组件挂载到 DOM 槽位，卸载时清理无泄漏 */
export class ComponentPortal {
    private host: HTMLElement | null = null;

    mount(
        host: HTMLElement,
        component: ComponentType,
        params: Record<string, unknown> = {},
        context?: unknown,
    ): void {
        this.unmount();
        this.host = host;
        host.replaceChildren();

        const rendered = renderComponent(component, params, context);
        if (rendered instanceof HTMLElement) {
            host.appendChild(rendered);
            return;
        }
        if (rendered != null) {
            host.textContent = String(rendered);
        }
    }

    unmount(): void {
        this.host?.replaceChildren();
        this.host = null;
    }

    isMounted(): boolean {
        return this.host !== null;
    }
}
