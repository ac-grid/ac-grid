/**
 * flexRender 工具函数 - 用于渲染 @tanstack/table-core 的 cell/header/footer
 * 这是 React 版本的替代实现，适用于 vanilla JS/WSX
 *
 * 在 wsx 中，JSX 返回的是 HTMLElement，所以我们应该直接返回元素而不是字符串
 */

/**
 * 渲染单元格、表头或表尾的内容
 * 返回类型：HTMLElement | string | number | null
 */
export function flexRender<T>(
    render:
        | string
        | number
        | boolean
        | null
        | undefined
        | ((context: T) => any),
    context: T
): HTMLElement | string | number | null {
    if (render == null) {
        return null;
    }

    if (typeof render === "function") {
        const result = render(context);
        // 如果结果是 JSX 元素（HTMLElement），直接返回
        if (result && typeof result === "object") {
            // 处理 JSX 元素（在 wsx 中可能是 HTMLElement）
            if (result instanceof HTMLElement) {
                return result;
            }
            // 处理其他对象类型，转换为字符串
            return String(result);
        }
        // 处理基本类型
        if (result == null) {
            return null;
        }
        return result;
    }

    // 处理基本类型
    if (typeof render === "boolean") {
        return render ? "true" : "false";
    }
    if (render === undefined) {
        return null;
    }
    return render;
}
