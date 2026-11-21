import { describe, expect, it } from "vitest";
import { getRouteMeta, routeMeta } from "../src/config/route-meta";

describe("getRouteMeta", () => {
    it("returns the configured meta for an exact route", () => {
        expect(getRouteMeta("/examples")).toBe(routeMeta["/examples"]);
        expect(getRouteMeta("/")).toBe(routeMeta["/"]);
    });

    it("titles a documentation page after its last path segment and keeps the docs description", () => {
        const meta = getRouteMeta("/docs/guide/essentials/getting-started");

        expect(meta.title).toBe("getting-started | Documentation – AC Grid");
        expect(meta.description).toBe(routeMeta["/docs"].description);
        expect(meta.keywords).toBe(routeMeta["/docs"].keywords);
    });

    it("titles an RFC page with its id and keeps the RFC description", () => {
        const meta = getRouteMeta("/rfc/0007/extra");

        expect(meta.title).toBe("RFC-0007 | Completed RFCs – AC Grid");
        expect(meta.description).toBe(routeMeta["/rfc"].description);
    });

    it("falls back to the 404 meta for an unknown route", () => {
        expect(getRouteMeta("/no/such/page")).toBe(routeMeta["*"]);
    });

    it("treats a bare /docs/ prefix as an unknown route, not a documentation page", () => {
        expect(getRouteMeta("/docs/")).toBe(routeMeta["*"]);
    });
});

describe("routeMeta", () => {
    it.each(Object.entries(routeMeta))("%s has a title and a description for search results", (_path, meta) => {
        expect(meta.title.trim()).not.toBe("");
        expect(meta.description.trim()).not.toBe("");
    });
});
