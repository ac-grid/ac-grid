import { afterEach, describe, expect, it, vi } from "vitest";

import {
    BODY_SCROLL_HANDLER_KEY,
    HEADER_SCROLL_HANDLER_KEY,
    bindBodyToHeaderScrollSync,
    bindHeaderToBodyScrollSync,
    removeScrollListener,
    syncTargetScrollLeft,
    type ScrollSyncSession,
} from "../src/utils/scroll-sync";

describe("scroll-sync", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("syncTargetScrollLeft", () => {
        it("copies scrollLeft onto the target element", () => {
            const session: ScrollSyncSession = { isSyncingScroll: false };
            const target = document.createElement("div");

            syncTargetScrollLeft(88, target, session, (callback) => callback());

            expect(target.scrollLeft).toBe(88);
            expect(session.isSyncingScroll).toBe(false);
        });

        it("skips when target is null", () => {
            const session: ScrollSyncSession = { isSyncingScroll: false };

            syncTargetScrollLeft(88, null, session, (callback) => callback());

            expect(session.isSyncingScroll).toBe(false);
        });

        it("skips when a sync is already in progress", () => {
            const session: ScrollSyncSession = { isSyncingScroll: true };
            const target = document.createElement("div");

            syncTargetScrollLeft(88, target, session, (callback) => callback());

            expect(target.scrollLeft).toBe(0);
        });
    });

    describe("removeScrollListener", () => {
        it("no-ops for null elements", () => {
            expect(() => removeScrollListener(null, HEADER_SCROLL_HANDLER_KEY)).not.toThrow();
        });

        it("removes a stored scroll listener", () => {
            const element = document.createElement("div");
            const handler = vi.fn();
            element.addEventListener("scroll", handler);
            (element as HTMLElement & Record<string, EventListener>)[HEADER_SCROLL_HANDLER_KEY] =
                handler;

            removeScrollListener(element, HEADER_SCROLL_HANDLER_KEY);
            element.dispatchEvent(new Event("scroll"));

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe("bindBodyToHeaderScrollSync", () => {
        it("syncs header scrollLeft and invokes onBodyScroll", () => {
            const session: ScrollSyncSession = { isSyncingScroll: false };
            const body = document.createElement("div");
            const header = document.createElement("div");
            const onBodyScroll = vi.fn();

            bindBodyToHeaderScrollSync(
                body,
                () => header,
                session,
                onBodyScroll,
                (callback) => callback(),
            );

            body.scrollLeft = 140;
            body.dispatchEvent(new Event("scroll"));

            expect(header.scrollLeft).toBe(140);
            expect(onBodyScroll).toHaveBeenCalledWith(body);
            expect(
                (body as HTMLElement & Record<string, EventListener>)[HEADER_SCROLL_HANDLER_KEY],
            ).toBeTruthy();
        });

        it("replaces an existing body scroll listener", () => {
            const session: ScrollSyncSession = { isSyncingScroll: false };
            const body = document.createElement("div");
            const staleHandler = vi.fn();
            body.addEventListener("scroll", staleHandler);
            (body as HTMLElement & Record<string, EventListener>)[HEADER_SCROLL_HANDLER_KEY] =
                staleHandler;

            bindBodyToHeaderScrollSync(body, () => null, session, undefined, (callback) =>
                callback(),
            );
            body.dispatchEvent(new Event("scroll"));

            expect(staleHandler).not.toHaveBeenCalled();
        });
    });

    describe("bindHeaderToBodyScrollSync", () => {
        it("syncs body scrollLeft when header scrolls", () => {
            const session: ScrollSyncSession = { isSyncingScroll: false };
            const body = document.createElement("div");
            const header = document.createElement("div");

            bindHeaderToBodyScrollSync(header, () => body, session, (callback) => callback());

            header.scrollLeft = 95;
            header.dispatchEvent(new Event("scroll"));

            expect(body.scrollLeft).toBe(95);
            expect(
                (header as HTMLElement & Record<string, EventListener>)[BODY_SCROLL_HANDLER_KEY],
            ).toBeTruthy();
        });

        it("does not sync body while session is locked", () => {
            const session: ScrollSyncSession = { isSyncingScroll: true };
            const body = document.createElement("div");
            const header = document.createElement("div");

            bindHeaderToBodyScrollSync(header, () => body, session, (callback) => callback());

            header.scrollLeft = 95;
            header.dispatchEvent(new Event("scroll"));

            expect(body.scrollLeft).toBe(0);
        });
    });
});
