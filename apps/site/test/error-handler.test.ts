import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (event: unknown) => void;

// ErrorHandler keeps a static error count, so load a fresh copy for every test.
async function loadInitialised() {
    vi.resetModules();
    const add = vi.spyOn(window, "addEventListener");
    const { ErrorHandler } = await import("../src/utils/error-handler");
    ErrorHandler.init();
    const handlerFor = (type: string) => add.mock.calls.find(([name]) => name === type)![1] as Handler;
    return { onError: handlerFor("error"), onRejection: handlerFor("unhandledrejection") };
}

describe("ErrorHandler", () => {
    let errorLog: ReturnType<typeof vi.spyOn>;
    let warnLog: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
        warnLog = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("listens for global errors and unhandled promise rejections", async () => {
        const { onError, onRejection } = await loadInitialised();

        expect(onError).toBeTypeOf("function");
        expect(onRejection).toBeTypeOf("function");
    });

    it("logs the details of a global error in development", async () => {
        const { onError } = await loadInitialised();

        onError({ message: "boom", error: { stack: "STACK" }, filename: "a.js", lineno: 3, colno: 7 });

        expect(errorLog).toHaveBeenCalledTimes(1);
        const [label, info] = errorLog.mock.calls[0];
        expect(label).toBe("Global error:");
        expect(info).toMatchObject({ message: "boom", stack: "STACK", url: "a.js", line: 3, column: 7 });
        expect(info.userAgent).toBe(navigator.userAgent);
    });

    it("names an error without a message as unknown", async () => {
        const { onError } = await loadInitialised();

        onError({ message: "" });

        expect(errorLog.mock.calls[0][1].message).toBe("Unknown error");
    });

    it("logs the reason of an unhandled promise rejection", async () => {
        const { onRejection } = await loadInitialised();

        onRejection({ reason: new Error("rejected") });

        const [label, info] = errorLog.mock.calls[0];
        expect(label).toBe("Unhandled promise rejection:");
        expect(info.message).toBe("rejected");
    });

    it("names a rejection without a reason message as unhandled", async () => {
        const { onRejection } = await loadInitialised();

        onRejection({ reason: undefined });

        expect(errorLog.mock.calls[0][1].message).toBe("Unhandled promise rejection");
    });

    it("stops logging after 10 errors and warns instead", async () => {
        const { onError, onRejection } = await loadInitialised();

        for (let i = 0; i < 10; i++) onError({ message: `e${i}` });
        expect(errorLog).toHaveBeenCalledTimes(10);
        expect(warnLog).not.toHaveBeenCalled();

        onError({ message: "eleventh" });
        onRejection({ reason: new Error("twelfth") });

        expect(errorLog).toHaveBeenCalledTimes(10);
        expect(warnLog).toHaveBeenCalledTimes(2);
        expect(warnLog).toHaveBeenCalledWith("Too many errors, stopping error logging");
    });
});
