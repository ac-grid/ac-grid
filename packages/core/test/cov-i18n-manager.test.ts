/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import { I18nManager, isRtlLocale } from "../src/i18n/manager";
import { enUS } from "../src/i18n/locales";

describe("isRtlLocale", () => {
    it("returns false for empty input", () => {
        expect(isRtlLocale("")).toBe(false);
    });
    it("matches exact, case-insensitive and language-prefix codes", () => {
        expect(isRtlLocale("AR-EG")).toBe(true);
        expect(isRtlLocale("he-XX")).toBe(true);
        expect(isRtlLocale("en-US")).toBe(false);
    });
});

describe("I18nManager construction options", () => {
    it("applies locale, messages, dir, dateFormat and numberFormat", () => {
        const m = new I18nManager({
            locale: "zh-CN",
            messages: { hello: "你好" },
            dir: "rtl",
            dateFormat: "YYYY/MM/DD",
            numberFormat: { minimumFractionDigits: 2 },
        });
        expect(m.getLocale()).toBe("zh-CN");
        expect(m.t("hello")).toBe("你好");
        expect(m.getDirection()).toBe("rtl");
        expect(m.formatDate(new Date(2024, 0, 5))).toBe("2024/01/05");
        expect(m.formatNumber(1)).toBe("1.00");
    });
});

describe("I18nManager locale handling", () => {
    it("notifies listeners, survives a throwing listener, and unsubscribes", () => {
        const m = new I18nManager();
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        const bad = vi.fn(() => {
            throw new Error("boom");
        });
        const good = vi.fn();
        m.onLocaleChange(bad);
        const off = m.onLocaleChange(good);
        m.setLocale("zh-CN");
        expect(good).toHaveBeenCalledWith("zh-CN");
        expect(err).toHaveBeenCalled();
        off();
        m.setLocale("en-US");
        expect(good).toHaveBeenCalledTimes(1);
        err.mockRestore();
    });

    it("ignores empty or unchanged locale", () => {
        const m = new I18nManager();
        const l = vi.fn();
        m.onLocaleChange(l);
        m.setLocale("");
        m.setLocale("en-US");
        expect(l).not.toHaveBeenCalled();
    });

    it("resolves language packs by exact, short code, then en-US fallback", () => {
        const m = new I18nManager();
        expect(m.getLanguagePack("zh-CN").locale).toBe("zh-CN");
        expect(m.getLanguagePack("zh-TW").locale).toBe("zh-CN");
        expect(m.getLanguagePack("fr-FR").locale).toBe("en-US");
    });

    it("does not overwrite an existing short-code mapping when registering", () => {
        const m = new I18nManager();
        m.registerLanguagePack({ locale: "zh-TW", messages: { a: "繁" } });
        expect(m.getLanguagePack("zh").locale).toBe("zh-CN");
        expect(m.getLanguagePack("zh-TW").messages.a).toBe("繁");
    });
});

describe("I18nManager direction", () => {
    it("uses RTL locale detection, pack dir, explicit dir, and ltr default", () => {
        const m = new I18nManager({ locale: "ar-SA" });
        expect(m.getDirection()).toBe("rtl");
        m.registerLanguagePack({ locale: "xx-YY", messages: {}, dir: "rtl" });
        expect(m.getDirection("xx-YY")).toBe("rtl");
        m.registerLanguagePack({ locale: "zz-ZZ", messages: {} });
        expect(m.getDirection("zz-ZZ")).toBe("ltr");
        expect(m.getDirection("en-US")).toBe("ltr");
        expect(m.getDirection("fr-FR")).toBe("ltr");
        m.setDirection("rtl");
        expect(m.getDirection("en-US")).toBe("rtl");
        m.setDirection(undefined);
        expect(m.getDirection("en-US")).toBe("ltr");
    });
});

describe("I18nManager.t", () => {
    it("prefers custom messages, then pack, then en-US, then default, then key", () => {
        const m = new I18nManager({ locale: "zh-CN" });
        m.setMessages({ custom: "C" });
        expect(m.t("custom")).toBe("C");
        expect(m.t("grid.noData")).toBe(m.getLanguagePack("zh-CN").messages["grid.noData"]);
        m.registerLanguagePack({ locale: "zh-CN", messages: {} });
        expect(m.t("grid.noData")).toBe(enUS.messages["grid.noData"]);
        expect(m.t("missing", undefined, "fallback")).toBe("fallback");
        expect(m.t("missing")).toBe("missing");
    });

    it("interpolates known params and leaves unknown placeholders", () => {
        const m = new I18nManager();
        expect(m.t("hi {name} {other}", { name: "Bob" })).toBe("hi Bob {other}");
    });
});

describe("I18nManager.formatDate", () => {
    const d = new Date(2024, 2, 4, 5, 6, 7);
    it("returns input as string when the date is invalid", () => {
        expect(new I18nManager().formatDate("not a date")).toBe("not a date");
    });
    it("accepts timestamps and string patterns", () => {
        const m = new I18nManager();
        expect(m.formatDate(d.getTime(), "YYYY-MM-DD HH:mm:ss")).toBe("2024-03-04 05:06:07");
    });
    it("uses Intl options passed explicitly", () => {
        const m = new I18nManager();
        expect(m.formatDate(d, { year: "numeric" })).toBe("2024");
    });
    it("uses language pack default, and custom default over it", () => {
        const m = new I18nManager();
        expect(m.formatDate(d)).toBe(new Intl.DateTimeFormat("en-US", m.getLanguagePack().dateFormat as Intl.DateTimeFormatOptions).format(d));
        const c = new I18nManager({ dateFormat: { year: "numeric" } });
        expect(c.formatDate(d)).toBe("2024");
    });
    it("falls back to toLocaleDateString when Intl rejects the options", () => {
        const m = new I18nManager();
        expect(m.formatDate(d, { timeZone: "Not/AZone" })).toBe(d.toLocaleDateString("en-US"));
    });
});

describe("I18nManager.formatNumber", () => {
    it("returns non-numbers and NaN as strings", () => {
        const m = new I18nManager();
        expect(m.formatNumber(NaN)).toBe("NaN");
        expect(m.formatNumber("x" as unknown as number)).toBe("x");
    });
    it("formats with explicit, custom default and pack default options", () => {
        const m = new I18nManager();
        expect(m.formatNumber(1234.5, { minimumFractionDigits: 2 })).toBe("1,234.50");
        expect(m.formatNumber(1234.5)).toBe(
            new Intl.NumberFormat("en-US", m.getLanguagePack().numberFormat).format(1234.5),
        );
        const c = new I18nManager({ numberFormat: { style: "percent" } });
        expect(c.formatNumber(0.5)).toBe("50%");
    });
    it("falls back to toLocaleString when Intl rejects the options", () => {
        const m = new I18nManager();
        expect(m.formatNumber(1234.5, { style: "currency" })).toBe((1234.5).toLocaleString("en-US"));
    });
});
