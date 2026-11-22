import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SITE_BASE_URL, SITE_OG_IMAGE_PATH } from "../src/config/site";
import { MetaManager } from "../src/utils/meta-manager";

const byName = (name: string) => document.head.querySelector(`meta[name="${name}"]`)?.getAttribute("content");
const byProperty = (property: string) =>
    document.head.querySelector(`meta[property="${property}"]`)?.getAttribute("content");

describe("MetaManager", () => {
    beforeEach(() => {
        document.head.replaceChildren();
        document.title = "";
        window.history.replaceState({}, "", "/examples");
    });

    afterEach(() => {
        document.head.replaceChildren();
    });

    describe("update", () => {
        it("writes the title, description, Open Graph and Twitter tags", () => {
            MetaManager.update({ title: "T", description: "D", keywords: "k1, k2", author: "A" });

            expect(document.title).toBe("T");
            expect(byName("description")).toBe("D");
            expect(byName("keywords")).toBe("k1, k2");
            expect(byName("author")).toBe("A");
            expect(byProperty("og:title")).toBe("T");
            expect(byProperty("og:description")).toBe("D");
            expect(byName("twitter:card")).toBe("summary_large_image");
            expect(byName("twitter:title")).toBe("T");
            expect(byName("twitter:description")).toBe("D");
        });

        it("defaults og:type, og:url and the images to the site values", () => {
            MetaManager.update({ title: "T", description: "D" });

            expect(byProperty("og:type")).toBe("website");
            expect(byProperty("og:url")).toBe(`${SITE_BASE_URL}/examples`);
            expect(byProperty("og:image")).toBe(`${SITE_BASE_URL}${SITE_OG_IMAGE_PATH}`);
            expect(byName("twitter:image")).toBe(`${SITE_BASE_URL}${SITE_OG_IMAGE_PATH}`);
        });

        it("uses the given type and url, and resolves a relative image against the site", () => {
            MetaManager.update({ title: "T", description: "D", type: "article", url: "https://x.test/p", image: "pic.png" });

            expect(byProperty("og:type")).toBe("article");
            expect(byProperty("og:url")).toBe("https://x.test/p");
            expect(byName("twitter:image")).toBe(`${SITE_BASE_URL}/pic.png`);
        });

        it("keeps an absolute image URL as given", () => {
            MetaManager.update({ title: "T", description: "D", image: "https://cdn.test/o.png" });

            expect(byName("twitter:image")).toBe("https://cdn.test/o.png");
        });

        it("omits keywords, author and article times when they are not given", () => {
            MetaManager.update({ title: "T", description: "D" });

            expect(byName("keywords")).toBeUndefined();
            expect(byName("author")).toBeUndefined();
            expect(byProperty("article:published_time")).toBeUndefined();
            expect(byProperty("article:modified_time")).toBeUndefined();
        });

        it("writes article times when given", () => {
            MetaManager.update({
                title: "T",
                description: "D",
                publishedTime: "2026-01-01",
                modifiedTime: "2026-02-02",
            });

            expect(byProperty("article:published_time")).toBe("2026-01-01");
            expect(byProperty("article:modified_time")).toBe("2026-02-02");
        });

        it("updates tags in place on the next call instead of adding duplicates", () => {
            MetaManager.update({ title: "First", description: "One" });
            MetaManager.update({ title: "Second", description: "Two" });

            expect(document.title).toBe("Second");
            expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
            expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
            expect(byName("description")).toBe("Two");
            expect(byProperty("og:title")).toBe("Second");
        });

        it("updateMeta behaves the same as update", () => {
            MetaManager.updateMeta({ title: "Alias", description: "D" });

            expect(document.title).toBe("Alias");
            expect(byProperty("og:title")).toBe("Alias");
        });
    });

    describe("setStructuredData", () => {
        const scripts = () => document.head.querySelectorAll('script[type="application/ld+json"]');

        it("adds the data as a JSON-LD script", () => {
            MetaManager.setStructuredData({ "@type": "WebSite", name: "AC Grid" });

            expect(scripts()).toHaveLength(1);
            expect(JSON.parse(scripts()[0].textContent!)).toEqual({ "@type": "WebSite", name: "AC Grid" });
        });

        it("replaces the previous JSON-LD script", () => {
            MetaManager.setStructuredData({ name: "old" });
            MetaManager.setStructuredData({ name: "new" });

            expect(scripts()).toHaveLength(1);
            expect(JSON.parse(scripts()[0].textContent!)).toEqual({ name: "new" });
        });
    });
});
