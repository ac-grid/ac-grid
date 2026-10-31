/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    toFilterCondition,
    defaultTextFilter,
    numberFilter,
    dateFilter,
} from "../src/utils/filter-functions";

const row = (v: unknown) => ({ getValue: () => v });
const cond = (operator: string, value: unknown) => ({ operator, value });

describe("toFilterCondition", () => {
    it("wraps a plain string with the default operator", () => {
        expect(toFilterCondition("abc", "contains")).toEqual({ value: "abc", operator: "contains" });
    });
    it("parses a serialized JSON condition", () => {
        expect(toFilterCondition('{"value":"x","operator":"equals"}', "contains")).toEqual({
            value: "x",
            operator: "equals",
        });
    });
    it("uses default operator and stringifies value when JSON omits operator or has null value", () => {
        expect(toFilterCondition('{"value":5,"operator":null}', "contains")).toEqual({
            value: "5",
            operator: "contains",
        });
        expect(toFilterCondition('{"value":null,"operator":"equals"}', "contains")).toEqual({
            value: "",
            operator: "equals",
        });
    });
    it("treats JSON without a value, or invalid JSON, as a plain string", () => {
        const noValue = '{"operator":"equals","note":"value"}';
        expect(toFilterCondition(noValue, "contains")).toEqual({ value: noValue, operator: "contains" });
        const bad = "{value operator";
        expect(toFilterCondition(bad, "contains")).toEqual({ value: bad, operator: "contains" });
    });
    it("treats brace strings lacking value/operator keywords as plain strings", () => {
        expect(toFilterCondition("{value}", "contains")).toEqual({ value: "{value}", operator: "contains" });
        expect(toFilterCondition("{a:1}", "contains")).toEqual({ value: "{a:1}", operator: "contains" });
    });
    it("returns condition objects unchanged", () => {
        const c = { value: "a", operator: "equals" };
        expect(toFilterCondition(c, "contains")).toBe(c);
    });
    it("handles null, undefined, other objects and numbers", () => {
        expect(toFilterCondition(null, "equals")).toEqual({ value: "", operator: "equals" });
        expect(toFilterCondition(undefined, "equals")).toEqual({ value: "", operator: "equals" });
        expect(toFilterCondition({ operator: "equals" }, "equals")).toEqual({
            value: "[object Object]",
            operator: "equals",
        });
        expect(toFilterCondition(7, "equals")).toEqual({ value: "7", operator: "equals" });
    });
});

describe("defaultTextFilter", () => {
    it("applies each text operator case-insensitively", () => {
        expect(defaultTextFilter(row("Hello"), "c", cond("equals", "hello"))).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("equals", "hell"))).toBe(false);
        expect(defaultTextFilter(row("Hello"), "c", cond("startsWith", "he"))).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("startsWith", "lo"))).toBe(false);
        expect(defaultTextFilter(row("Hello"), "c", cond("endsWith", "LO"))).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("endsWith", "he"))).toBe(false);
        expect(defaultTextFilter(row("Hello"), "c", cond("contains", "ell"))).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("contains", "zz"))).toBe(false);
        expect(defaultTextFilter(row("Hello"), "c", cond("notContains", "zz"))).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("notContains", "ell"))).toBe(false);
        expect(defaultTextFilter(row("Hello"), "c", cond("notEqual", "hello"))).toBe(false);
        expect(defaultTextFilter(row("Hello"), "c", cond("notEqual", "x"))).toBe(true);
    });
    it("handles blank / notBlank for null, undefined, empty and filled values", () => {
        for (const v of [null, undefined, ""]) {
            expect(defaultTextFilter(row(v), "c", cond("blank", ""))).toBe(true);
            expect(defaultTextFilter(row(v), "c", cond("notBlank", ""))).toBe(false);
        }
        expect(defaultTextFilter(row("x"), "c", cond("blank", ""))).toBe(false);
        expect(defaultTextFilter(row("x"), "c", cond("notBlank", ""))).toBe(true);
        expect(defaultTextFilter(row(null), "c", cond("notBlank", ""))).toBe(false);
    });
    it("passes every row when the search term is empty", () => {
        expect(defaultTextFilter(row("x"), "c", cond("equals", ""))).toBe(true);
        expect(defaultTextFilter(row("x"), "c", cond("equals", undefined))).toBe(true);
        expect(defaultTextFilter(row("x"), "c", "")).toBe(true);
    });
    it("defaults to contains for plain strings and unknown operators", () => {
        expect(defaultTextFilter(row("Hello"), "c", "ELL")).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("greaterThan", "ell"))).toBe(true);
        expect(defaultTextFilter(row("Hello"), "c", cond("greaterThan", "zz"))).toBe(false);
    });
});

describe("numberFilter", () => {
    it("supports equals, greaterThan, lessThan", () => {
        expect(numberFilter(row(5), "c", cond("equals", "5"))).toBe(true);
        expect(numberFilter(row(5), "c", cond("equals", "6"))).toBe(false);
        expect(numberFilter(row(5), "c", cond("greaterThan", "4"))).toBe(true);
        expect(numberFilter(row(5), "c", cond("greaterThan", "5"))).toBe(false);
        expect(numberFilter(row(5), "c", cond("lessThan", "6"))).toBe(true);
        expect(numberFilter(row(5), "c", cond("lessThan", "5"))).toBe(false);
    });
    it("treats a plain string and unknown operators as equals", () => {
        expect(numberFilter(row(5), "c", "5")).toBe(true);
        expect(numberFilter(row(5), "c", cond("contains", "6"))).toBe(false);
    });
    it("does not filter on empty or non-numeric input", () => {
        expect(numberFilter(row(5), "c", "")).toBe(true);
        expect(numberFilter(row(5), "c", "  ")).toBe(true);
        expect(numberFilter(row(5), "c", cond("equals", undefined))).toBe(true);
        expect(numberFilter(row(5), "c", "abc")).toBe(true);
    });
});

describe("dateFilter", () => {
    it("matches on the same calendar day regardless of time", () => {
        expect(dateFilter(row("2024-03-04T01:00:00"), "c", "2024-03-04T23:00:00")).toBe(true);
        expect(dateFilter(row("2024-03-04T01:00:00"), "c", "2024-03-05T01:00:00")).toBe(false);
    });
    it("does not filter on empty or invalid dates", () => {
        expect(dateFilter(row("2024-03-04"), "c", "")).toBe(true);
        expect(dateFilter(row("2024-03-04"), "c", cond("equals", undefined))).toBe(true);
        expect(dateFilter(row("garbage"), "c", "2024-03-04")).toBe(true);
        expect(dateFilter(row("2024-03-04"), "c", "garbage")).toBe(true);
    });
});
