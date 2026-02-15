/**
 * 复制 .wsx-press 到 dist
 * 生产环境通过 /.wsx-press 提供 docs-meta.json、search-index.json、docs-toc.json
 */

import { cpSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_DIR = resolve(__dirname, "..");
const WSX_PRESS_DIR = join(SITE_DIR, ".wsx-press");
const DIST_DIR = join(SITE_DIR, "dist");
const DIST_WSX_PRESS = join(DIST_DIR, ".wsx-press");

function copyWsxPress(): void {
    if (!existsSync(DIST_DIR)) {
        console.error("❌ dist 目录不存在:", DIST_DIR);
        console.error("   请先运行构建命令");
        process.exit(1);
    }

    if (!existsSync(WSX_PRESS_DIR)) {
        console.warn("⚠️ .wsx-press 不存在，跳过复制（wsxPress 插件应在 buildStart 已生成）");
        return;
    }

    try {
        cpSync(WSX_PRESS_DIR, DIST_WSX_PRESS, { recursive: true });
        console.log("✅ 已复制 .wsx-press 到 dist");
    } catch (error) {
        console.error("❌ 复制 .wsx-press 失败:", error);
        process.exit(1);
    }
}

copyWsxPress();
