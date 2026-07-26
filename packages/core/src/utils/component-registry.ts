import type { ComponentType } from "../types/components";

const COMPONENT_REGISTRY = new Map<string, ComponentType>();

/** 注册单个自定义组件 */
export function registerComponent(
    name: string,
    component: ComponentType,
): void {
    COMPONENT_REGISTRY.set(name, component);
}

/** 批量注册自定义组件 */
export function registerComponents(
    components: Record<string, ComponentType>,
): void {
    for (const [name, component] of Object.entries(components)) {
        registerComponent(name, component);
    }
}

export function getRegisteredComponent(
    name: string,
): ComponentType | undefined {
    return COMPONENT_REGISTRY.get(name);
}

export function unregisterComponent(name: string): boolean {
    return COMPONENT_REGISTRY.delete(name);
}

export function clearComponentRegistry(): void {
    COMPONENT_REGISTRY.clear();
}

/** 解析组件引用：注册名 → 渲染函数，未知名称视为自定义元素标签 */
export function resolveComponentRef(
    component: ComponentType | undefined,
): ComponentType | undefined {
    if (component === undefined) {
        return undefined;
    }
    if (typeof component === "string") {
        return getRegisteredComponent(component) ?? component;
    }
    return component;
}
