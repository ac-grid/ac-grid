/**
 * 轻量公式解析器（RFC-0030）。
 * 支持数字、四则运算、括号、A1 / A1:B2，以及 SUM / AVG|AVERAGE / MIN / MAX / COUNT。
 */

import type {
    CellAddress,
    FormulaError,
    FormulaParseResult,
    FormulaValue,
} from "../types/formulas";
import {
    expandRange,
    parseA1Cell,
    parseA1Range,
} from "./a1-notation";

const FORMULA_PREFIX = "=";

export const FORMULA_FN_SUM = "SUM";
export const FORMULA_FN_AVG = "AVG";
export const FORMULA_FN_AVERAGE = "AVERAGE";
export const FORMULA_FN_MIN = "MIN";
export const FORMULA_FN_MAX = "MAX";
export const FORMULA_FN_COUNT = "COUNT";

const BUILTIN_FUNCTIONS = new Set([
    FORMULA_FN_SUM,
    FORMULA_FN_AVG,
    FORMULA_FN_AVERAGE,
    FORMULA_FN_MIN,
    FORMULA_FN_MAX,
    FORMULA_FN_COUNT,
]);

type TokenType =
    | "number"
    | "string"
    | "ref"
    | "range"
    | "ident"
    | "op"
    | "lparen"
    | "rparen"
    | "comma"
    | "colon";

interface Token {
    type: TokenType;
    value: string;
}

type AstNode =
    | { kind: "number"; value: number }
    | { kind: "string"; value: string }
    | { kind: "ref"; address: CellAddress }
    | { kind: "range"; cells: CellAddress[] }
    | { kind: "unary"; op: "+" | "-"; expr: AstNode }
    | { kind: "binary"; op: "+" | "-" | "*" | "/"; left: AstNode; right: AstNode }
    | { kind: "call"; name: string; args: AstNode[] };

export function isFormula(raw: unknown): raw is string {
    return typeof raw === "string" && raw.trimStart().startsWith(FORMULA_PREFIX);
}

export function normalizeFormula(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed.startsWith(FORMULA_PREFIX)) {
        return `${FORMULA_PREFIX}${trimmed}`;
    }
    return trimmed;
}

function makeError(code: FormulaError["code"], message?: string): FormulaError {
    return { type: "error", code, message };
}

export function isFormulaError(value: FormulaValue): value is FormulaError {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        (value as FormulaError).type === "error"
    );
}

function tokenize(formulaBody: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < formulaBody.length) {
        const ch = formulaBody[i];
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        if (/[0-9.]/.test(ch)) {
            let j = i + 1;
            while (j < formulaBody.length && /[0-9.]/.test(formulaBody[j])) {
                j++;
            }
            tokens.push({ type: "number", value: formulaBody.slice(i, j) });
            i = j;
            continue;
        }
        if (ch === '"') {
            let j = i + 1;
            let value = "";
            while (j < formulaBody.length && formulaBody[j] !== '"') {
                value += formulaBody[j];
                j++;
            }
            tokens.push({ type: "string", value });
            i = j + 1;
            continue;
        }
        if (ch === "(") {
            tokens.push({ type: "lparen", value: ch });
            i++;
            continue;
        }
        if (ch === ")") {
            tokens.push({ type: "rparen", value: ch });
            i++;
            continue;
        }
        if (ch === ",") {
            tokens.push({ type: "comma", value: ch });
            i++;
            continue;
        }
        if (ch === ":") {
            tokens.push({ type: "colon", value: ch });
            i++;
            continue;
        }
        if ("+-*/".includes(ch)) {
            tokens.push({ type: "op", value: ch });
            i++;
            continue;
        }
        if (/[A-Za-z$]/.test(ch)) {
            let j = i + 1;
            while (j < formulaBody.length && /[A-Za-z0-9$]/.test(formulaBody[j])) {
                j++;
            }
            const ident = formulaBody.slice(i, j);
            const asCell = parseA1Cell(ident);
            if (asCell) {
                tokens.push({ type: "ref", value: ident });
            } else {
                tokens.push({ type: "ident", value: ident.toUpperCase() });
            }
            i = j;
            continue;
        }
        throw makeError("#ERROR!", `Unexpected character: ${ch}`);
    }
    return tokens;
}

class Parser {
    private pos = 0;
    constructor(private readonly tokens: Token[]) {}

    parse(): AstNode {
        const node = this.parseExpr();
        if (this.pos < this.tokens.length) {
            throw makeError("#ERROR!", "Unexpected trailing tokens");
        }
        return node;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private consume(): Token {
        const token = this.tokens[this.pos++];
        if (!token) {
            throw makeError("#ERROR!", "Unexpected end of formula");
        }
        return token;
    }

    private parseExpr(): AstNode {
        let left = this.parseTerm();
        while (this.peek()?.type === "op" && (this.peek()?.value === "+" || this.peek()?.value === "-")) {
            const op = this.consume().value as "+" | "-";
            const right = this.parseTerm();
            left = { kind: "binary", op, left, right };
        }
        return left;
    }

    private parseTerm(): AstNode {
        let left = this.parseUnary();
        while (this.peek()?.type === "op" && (this.peek()?.value === "*" || this.peek()?.value === "/")) {
            const op = this.consume().value as "*" | "/";
            const right = this.parseUnary();
            left = { kind: "binary", op, left, right };
        }
        return left;
    }

    private parseUnary(): AstNode {
        if (this.peek()?.type === "op" && (this.peek()?.value === "+" || this.peek()?.value === "-")) {
            const op = this.consume().value as "+" | "-";
            return { kind: "unary", op, expr: this.parseUnary() };
        }
        return this.parsePrimary();
    }

    private parsePrimary(): AstNode {
        const token = this.peek();
        if (!token) {
            throw makeError("#ERROR!", "Expected expression");
        }
        if (token.type === "number") {
            this.consume();
            const value = Number(token.value);
            if (Number.isNaN(value)) {
                throw makeError("#VALUE!", `Invalid number: ${token.value}`);
            }
            return { kind: "number", value };
        }
        if (token.type === "string") {
            this.consume();
            return { kind: "string", value: token.value };
        }
        if (token.type === "ref") {
            return this.parseRefOrRange();
        }
        if (token.type === "ident") {
            this.consume();
            if (this.peek()?.type === "lparen") {
                return this.parseCall(token.value);
            }
            throw makeError("#NAME?", `Unknown identifier: ${token.value}`);
        }
        if (token.type === "lparen") {
            this.consume();
            const expr = this.parseExpr();
            if (this.peek()?.type !== "rparen") {
                throw makeError("#ERROR!", "Expected )");
            }
            this.consume();
            return expr;
        }
        throw makeError("#ERROR!", `Unexpected token: ${token.value}`);
    }

    private parseRefOrRange(): AstNode {
        const refToken = this.consume();
        const start = parseA1Cell(refToken.value);
        if (!start) {
            throw makeError("#REF!", `Invalid reference: ${refToken.value}`);
        }
        if (this.peek()?.type === "colon") {
            this.consume();
            const endToken = this.consume();
            if (endToken.type !== "ref") {
                throw makeError("#REF!", "Expected cell after :");
            }
            const range = parseA1Range(`${refToken.value}:${endToken.value}`);
            if (!range) {
                throw makeError("#REF!", `Invalid range: ${refToken.value}:${endToken.value}`);
            }
            return { kind: "range", cells: expandRange(range) };
        }
        return { kind: "ref", address: { row: start.row, col: start.col } };
    }

    private parseCall(name: string): AstNode {
        if (!BUILTIN_FUNCTIONS.has(name)) {
            throw makeError("#NAME?", `Unknown function: ${name}`);
        }
        this.consume(); // (
        const args: AstNode[] = [];
        if (this.peek()?.type !== "rparen") {
            args.push(this.parseExpr());
            while (this.peek()?.type === "comma") {
                this.consume();
                args.push(this.parseExpr());
            }
        }
        if (this.peek()?.type !== "rparen") {
            throw makeError("#ERROR!", "Expected )");
        }
        this.consume();
        return { kind: "call", name, args };
    }
}

function collectDependencies(node: AstNode, out: Map<string, CellAddress>): void {
    switch (node.kind) {
        case "ref":
            out.set(`${node.address.row}:${node.address.col}`, node.address);
            break;
        case "range":
            for (const cell of node.cells) {
                out.set(`${cell.row}:${cell.col}`, cell);
            }
            break;
        case "unary":
            collectDependencies(node.expr, out);
            break;
        case "binary":
            collectDependencies(node.left, out);
            collectDependencies(node.right, out);
            break;
        case "call":
            for (const arg of node.args) {
                collectDependencies(arg, out);
            }
            break;
        default:
            break;
    }
}

/**
 * 解析公式并收集依赖。解析失败时抛出 FormulaError 形状的对象。
 */
export function parseFormula(raw: string): FormulaParseResult & { ast: AstNode } {
    const formula = normalizeFormula(raw);
    const body = formula.slice(1);
    if (!body.trim()) {
        throw makeError("#ERROR!", "Empty formula");
    }
    let tokens: Token[];
    try {
        tokens = tokenize(body);
    } catch (err) {
        throw err;
    }
    const ast = new Parser(tokens).parse();
    const depMap = new Map<string, CellAddress>();
    collectDependencies(ast, depMap);
    return {
        formula,
        dependencies: [...depMap.values()],
        ast,
    };
}

function toNumber(value: FormulaValue): number | FormulaError {
    if (isFormulaError(value)) {
        return value;
    }
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : makeError("#VALUE!");
    }
    if (typeof value === "boolean") {
        return value ? 1 : 0;
    }
    if (typeof value === "string") {
        if (value.trim() === "") {
            return 0;
        }
        const n = Number(value);
        return Number.isFinite(n) ? n : makeError("#VALUE!");
    }
    return makeError("#VALUE!");
}

function flattenNumericArgs(
    args: FormulaValue[],
    getCell: (address: CellAddress) => FormulaValue,
): number[] | FormulaError {
    const numbers: number[] = [];
    for (const arg of args) {
        if (isFormulaError(arg)) {
            return arg;
        }
        // range 求值结果以数组形式传入（见 evaluateAst）
        if (Array.isArray(arg)) {
            for (const item of arg as FormulaValue[]) {
                const n = toNumber(item);
                if (isFormulaError(n)) {
                    return n;
                }
                numbers.push(n);
            }
            continue;
        }
        const n = toNumber(arg);
        if (isFormulaError(n)) {
            return n;
        }
        numbers.push(n);
    }
    return numbers;
}

type EvalArg = FormulaValue | FormulaValue[];

function evaluateAst(
    node: AstNode,
    getCell: (address: CellAddress) => FormulaValue,
): EvalArg {
    switch (node.kind) {
        case "number":
            return node.value;
        case "string":
            return node.value;
        case "ref":
            return getCell(node.address);
        case "range":
            return node.cells.map((cell) => getCell(cell));
        case "unary": {
            const v = evaluateAst(node.expr, getCell);
            if (Array.isArray(v)) {
                return makeError("#VALUE!");
            }
            const n = toNumber(v);
            if (isFormulaError(n)) {
                return n;
            }
            return node.op === "-" ? -n : n;
        }
        case "binary": {
            const leftRaw = evaluateAst(node.left, getCell);
            const rightRaw = evaluateAst(node.right, getCell);
            if (Array.isArray(leftRaw) || Array.isArray(rightRaw)) {
                return makeError("#VALUE!");
            }
            const left = toNumber(leftRaw);
            const right = toNumber(rightRaw);
            if (isFormulaError(left)) {
                return left;
            }
            if (isFormulaError(right)) {
                return right;
            }
            switch (node.op) {
                case "+":
                    return left + right;
                case "-":
                    return left - right;
                case "*":
                    return left * right;
                case "/":
                    return right === 0 ? makeError("#DIV/0!") : left / right;
            }
            break;
        }
        case "call": {
            const args = node.args.map((arg) => evaluateAst(arg, getCell));
            return evaluateFunction(node.name, args, getCell);
        }
    }
    return makeError("#ERROR!");
}

function evaluateFunction(
    name: string,
    args: EvalArg[],
    getCell: (address: CellAddress) => FormulaValue,
): FormulaValue {
    const flat = flattenNumericArgs(args as FormulaValue[], getCell);
    if (isFormulaError(flat)) {
        return flat;
    }
    switch (name) {
        case FORMULA_FN_SUM:
            return flat.reduce((a, b) => a + b, 0);
        case FORMULA_FN_AVG:
        case FORMULA_FN_AVERAGE:
            return flat.length === 0 ? makeError("#DIV/0!") : flat.reduce((a, b) => a + b, 0) / flat.length;
        case FORMULA_FN_MIN:
            return flat.length === 0 ? makeError("#VALUE!") : Math.min(...flat);
        case FORMULA_FN_MAX:
            return flat.length === 0 ? makeError("#VALUE!") : Math.max(...flat);
        case FORMULA_FN_COUNT:
            return flat.length;
        default:
            return makeError("#NAME?", name);
    }
}

/**
 * 求值已解析的 AST。getCell 由引擎提供（含缓存 / 循环检测）。
 */
export function evaluateParsedFormula(
    ast: AstNode,
    getCell: (address: CellAddress) => FormulaValue,
): FormulaValue {
    const result = evaluateAst(ast, getCell);
    if (Array.isArray(result)) {
        return makeError("#VALUE!", "Range used as scalar");
    }
    return result;
}

/**
 * 一次性解析并求值。
 */
export function evaluateFormula(
    raw: string,
    getCell: (address: CellAddress) => FormulaValue,
): FormulaValue {
    try {
        const { ast } = parseFormula(raw);
        return evaluateParsedFormula(ast, getCell);
    } catch (err) {
        if (isFormulaError(err as FormulaValue)) {
            return err as FormulaError;
        }
        return makeError("#ERROR!", String(err));
    }
}

export type { AstNode };
