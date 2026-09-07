/**
 * MetaManager - 动态管理页面的 meta 标签和 SEO 信息
 *
 * 功能：
 * - 更新 title 和 description
 * - 管理 Open Graph 标签
 * - 管理 Twitter Card 标签
 * - 管理结构化数据（JSON-LD）
 */

import { SITE_BASE_URL, SITE_OG_IMAGE_PATH } from "../config/site";

export interface RouteMeta {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string; // og:type, 默认 "website"
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

export class MetaManager {
    private static readonly DEFAULT_TYPE = "website";

    /**
     * 更新页面的 meta 标签
     */
    static update(meta: RouteMeta): void {
        // 更新 title
        document.title = meta.title;

        // 更新基础 meta 标签
        this.setMeta("description", meta.description);
        if (meta.keywords) {
            this.setMeta("keywords", meta.keywords);
        }
        if (meta.author) {
            this.setMeta("author", meta.author);
        }

        // 更新 Open Graph 标签
        this.setOGMeta("og:title", meta.title);
        this.setOGMeta("og:description", meta.description);
        this.setOGMeta("og:type", meta.type || this.DEFAULT_TYPE);
        this.setOGMeta("og:url", meta.url || this.getCurrentUrl());
        this.setOGMeta("og:image", meta.image || this.getFullUrl(SITE_OG_IMAGE_PATH));

        // 更新 Twitter Card 标签
        this.setMeta("twitter:card", "summary_large_image");
        this.setMeta("twitter:title", meta.title);
        this.setMeta("twitter:description", meta.description);
        this.setMeta(
            "twitter:image",
            this.getFullUrl(meta.image || SITE_OG_IMAGE_PATH),
        );

        // 更新文章相关 meta（如果有）
        if (meta.publishedTime) {
            this.setOGMeta("article:published_time", meta.publishedTime);
        }
        if (meta.modifiedTime) {
            this.setOGMeta("article:modified_time", meta.modifiedTime);
        }
    }

    /**
     * 设置或更新 meta 标签（name 属性）
     */
    private static setMeta(name: string, content: string): void {
        let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

        if (!element) {
            element = document.createElement("meta");
            element.setAttribute("name", name);
            document.head.appendChild(element);
        }

        element.setAttribute("content", content);
    }

    /**
     * 设置或更新 Open Graph meta 标签（property 属性）
     */
    private static setOGMeta(property: string, content: string): void {
        let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;

        if (!element) {
            element = document.createElement("meta");
            element.setAttribute("property", property);
            document.head.appendChild(element);
        }

        element.setAttribute("content", content);
    }

    /**
     * 添加或更新结构化数据（JSON-LD）
     */
    static setStructuredData(data: Record<string, unknown>): void {
        // 移除旧的 JSON-LD script（如果有）
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        // 创建新的 JSON-LD script
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    /**
     * 获取当前页面的完整 URL
     */
    private static getCurrentUrl(): string {
        return SITE_BASE_URL + window.location.pathname;
    }

    /**
     * 获取完整的 URL（相对路径转绝对路径）
     */
    private static getFullUrl(path: string): string {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return SITE_BASE_URL + (path.startsWith("/") ? path : "/" + path);
    }

    /** updateMeta 为 update 的别名，保持调用方兼容 */
    static updateMeta(meta: RouteMeta): void {
        this.update(meta);
    }
}
