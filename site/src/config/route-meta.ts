/**
 * 路由 Meta 配置
 * 定义每个路由的 SEO meta 信息
 */

import type { RouteMeta } from "../utils/meta-manager";

export const routeMeta: Record<string, RouteMeta> = {
    "/": {
        title: "AC Grid - High-Performance Data Grid Component",
        description:
            "A high-performance data grid component library built with Web Components and @tanstack/table-core. Framework-agnostic, TypeScript-first, production-ready.",
        keywords: "AC Grid, Data Grid, Web Components, Table, @tanstack/table-core, TypeScript",
        image: "/og-image.png",
        type: "website",
    },
    "/examples": {
        title: "Examples - AC Grid",
        description:
            "Explore interactive examples showcasing AC Grid capabilities: sorting, filtering, column resizing, and more.",
        keywords: "AC Grid examples, data grid examples, table examples",
        image: "/og-image.png",
    },
    "/docs": {
        title: "Documentation - AC Grid",
        description:
            "Complete documentation for AC Grid, including guides, API reference, RFCs, and examples.",
        keywords: "AC Grid documentation, AC Grid guide, AC Grid API",
        image: "/og-image.png",
    },
    // 404 页面（通配符路由）
    "*": {
        title: "404 - Page Not Found | AC Grid",
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
                title: `${lastPart} - Documentation | AC Grid`,
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
