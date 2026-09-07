/**
 * 官网全局配置 - acgrid.dev
 * 用于 SEO、OG、Twitter、sitemap 等所有需要绝对 URL 或品牌名的场景
 */

/** 站点主域名（无尾部斜杠） */
export const SITE_BASE_URL = "https://acgrid.dev";

/** 站点名称，用于 title、manifest、nav */
export const SITE_NAME = "AC Grid";

/** 默认 OG 图片路径（相对站点根） */
export const SITE_OG_IMAGE_PATH = "/og-image.png";

/** 默认 OG 图片完整 URL */
export const SITE_OG_IMAGE_URL = `${SITE_BASE_URL}${SITE_OG_IMAGE_PATH}`;

/** 一句话定位（用于 meta description、manifest） */
export const SITE_TAGLINE =
    "Fully open source data grid to replace AG Grid. Framework-agnostic, high-performance, Web Components + TypeScript.";

/** GitHub 仓库 URL（用于文档 / RFC 外链） */
export const SITE_GITHUB_REPO = "https://github.com/systembugtj/ac-grid";
