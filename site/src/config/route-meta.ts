/**
 * 路由 Meta 配置
 * 定义每个路由的 SEO meta 信息
 */

import type { RouteMeta } from "../utils/meta-manager";

export const routeMeta: Record<string, RouteMeta> = {
    "/": {
        title: "AC Grid – Open Source Data Grid to Replace AG Grid | acgrid.dev",
        description:
            "Fully open source data grid to replace AG Grid. Framework-agnostic, high-performance, Web Components + TypeScript.",
        keywords:
            "AC Grid, ag-grid alternative, open source data grid, Web Components, Table, TypeScript, acgrid.dev",
        image: "/og-image.png",
        type: "website",
    },
    "/examples": {
        title: "Samples | AC Grid – acgrid.dev",
        description:
            "Interactive examples: sorting, filtering, column reorder, theming. AC Grid – open source AG Grid alternative.",
        keywords: "AC Grid examples, data grid examples, ag-grid alternative examples",
        image: "/og-image.png",
    },
    "/docs": {
        title: "Documentation | AC Grid – acgrid.dev",
        description:
            "Guides, API reference, and RFCs for AC Grid – the open source data grid to replace AG Grid.",
        keywords: "AC Grid documentation, AC Grid guide, AC Grid API, ag-grid alternative",
        image: "/og-image.png",
    },
    // 404 页面（通配符路由）
    "*": {
        title: "404 – Page Not Found | AC Grid",
        description: "The page you're looking for doesn't exist or has been moved.",
        keywords: "404, page not found, AC Grid",
        image: "/og-image.png",
    },
};

/**
 * 获取路由的 meta 信息
 * 优先检查精确匹配，然后检查参数化路由（如 /docs/:category/:page），最后是通配符 "*"，最后回退到首页
 */
export function getRouteMeta(path: string): RouteMeta {
    // 1. 优先返回精确匹配的路由 meta
    if (routeMeta[path]) {
        return routeMeta[path];
    }
    // 2. 检查文档路由：/docs/* (支持多级路径)
    if (path.startsWith("/docs/")) {
        // 支持多级路径，例如：/docs/guide/essentials/getting-started
        const docPath = path.slice(6); // 移除 "/docs/" 前缀
        if (docPath) {
            // 使用文档路由的 meta，但可以根据需要动态生成标题
            const baseMeta = routeMeta["/docs"] || routeMeta["/"];
            // 从路径中提取最后一个部分作为标题（如果没有元数据）
            const lastPart = docPath.split("/").pop() || docPath;
            return {
                ...baseMeta,
                title: `${lastPart} | Documentation – AC Grid`,
                description: baseMeta.description || "AC Grid Documentation",
            };
        }
    }
    // 3. 如果没有精确匹配，检查通配符 "*"（用于 404 页面）
    if (routeMeta["*"]) {
        return routeMeta["*"];
    }
    // 4. 最后回退到首页 meta
    return routeMeta["/"];
}
