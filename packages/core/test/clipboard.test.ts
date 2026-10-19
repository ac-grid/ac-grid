import { describe, expect, it } from "vitest";

import { parseTsv, serializeTsv } from "../src/utils/clipboard";

describe("parseTsv", () => {
    it("splits tabs into columns and newlines into rows", () => {
        expect(parseTsv("a\tb\nc\td")).toEqual([["a", "b"], ["c", "d"]]);
    });

    it("accepts CRLF line endings", () => {
        expect(parseTsv("a\tb\r\nc\td")).toEqual([["a", "b"], ["c", "d"]]);
    });

    it("drops the empty row a trailing newline would add", () => {
        expect(parseTsv("a\tb\n")).toEqual([["a", "b"]]);
    });

    it("keeps tabs, newlines and escaped quotes inside a quoted field", () => {
        expect(parseTsv('"a\tb"\t"line1\nline2"\t"say ""hi"""')).toEqual([["a\tb", "line1\nline2", 'say "hi"']]);
    });

    it("returns one empty cell for empty input", () => {
        expect(parseTsv("")).toEqual([[""]]);
    });

    it("keeps empty cells between tabs", () => {
        expect(parseTsv("a\t\tc")).toEqual([["a", "", "c"]]);
    });
});

describe("serializeTsv", () => {
    it("joins cells with tabs and rows with CRLF", () => {
        expect(serializeTsv([["a", "b"], ["c", "d"]])).toBe("a\tb\r\nc\td");
    });

    it("writes null and undefined as empty cells and numbers as text", () => {
        expect(serializeTsv([[null, undefined, 3]])).toBe("\t\t3");
    });

    it("quotes cells containing a tab, newline or quote, doubling quotes", () => {
        expect(serializeTsv([["a\tb", "x\ny", 'say "hi"']])).toBe('"a\tb"\t"x\ny"\t"say ""hi"""');
    });

    it("round-trips through parseTsv", () => {
        const rows = [["plain", "tab\there", 'quote"inside'], ["multi\nline", "", "end"]];
        expect(parseTsv(serializeTsv(rows))).toEqual(rows);
    });
});
