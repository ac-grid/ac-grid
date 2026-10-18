import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import { createFormulaEngineFromMatrix, createGrid } from "@ac-grid/core";

import { makeData } from "./stories/makeData";
import {
    DEMO_CLIPBOARD_COPY_EVENT,
    DEMO_CLIPBOARD_SOURCE_ID,
    getAdjacentRfcId,
    parseRfcIdFromUrl,
    RFC_VALIDATION_ORDER,
    RFC_VALIDATION_SPECS,
    type GridHostElement,
    type RfcValidationId,
} from "./rfcValidationDemos";

function SearchIcon() {
    return (
        <svg
            className="demo-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
        >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16.5 16.5" />
        </svg>
    );
}

const FORMULA_SHEET_DEFAULT = [
    ["10", "5", "=SUM(A1:B1)"],
    ["10", "4", "=AVG(A2:B2)"],
    ["3", "9", "=MAX(A3:B3)-MIN(A3:B3)"],
    ["7", "8", "=COUNT(A4:B4)"],
    ["=B5", "=A5", "=A1/0"],
];
const FORMULA_COLUMNS = ["A", "B", "C"];

function toRawValue(text: string): string | number {
    const trimmed = text.trim();
    if (trimmed.startsWith("=")) return trimmed;
    const number = Number(trimmed);
    return trimmed !== "" && Number.isFinite(number) ? number : text;
}

function formatFormulaValue(value: unknown): string {
    if (value && typeof value === "object" && "code" in value) return String((value as { code: string }).code);
    return value === null || value === undefined ? "" : String(value);
}

/** RFC-0030: edit raw values or `=` formulas; the core FormulaEngine recalculates incrementally. */
function FormulaSheet() {
    const [raw, setRaw] = useState(FORMULA_SHEET_DEFAULT);
    const [engine] = useState(() =>
        createFormulaEngineFromMatrix(FORMULA_SHEET_DEFAULT.map((row) => row.map(toRawValue))),
    );

    const edit = (row: number, col: number, text: string) => {
        engine.setCell(row, col, toRawValue(text));
        setRaw((previous) =>
            previous.map((cells, r) => (r === row ? cells.map((cell, c) => (c === col ? text : cell)) : cells)),
        );
    };

    return (
        <table className="demo-formula-sheet" data-testid="formula-sheet">
            <thead>
                <tr>
                    <th />
                    {FORMULA_COLUMNS.map((name) => (
                        <th key={name}>{name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {raw.map((cells, row) => (
                    <tr key={row}>
                        <th>{row + 1}</th>
                        {cells.map((text, col) => {
                            const label = `${FORMULA_COLUMNS[col]}${row + 1}`;
                            return (
                                <td key={label}>
                                    <input
                                        aria-label={`raw ${label}`}
                                        data-testid={`raw-${label}`}
                                        value={text}
                                        onChange={(event) => edit(row, col, event.target.value)}
                                    />
                                    <output data-testid={`val-${label}`}>
                                        {formatFormulaValue(engine.getValue(row, col))}
                                    </output>
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function App() {
    const gridHostRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<GridHostElement | null>(null);
    const [rfcId, setRfcId] = useState<RfcValidationId>(() =>
        parseRfcIdFromUrl(window.location.search),
    );
    const [themeStatus, setThemeStatus] = useState("applied=light preview=none");
    const [copiedText, setCopiedText] = useState("");
    const syncThemeStatus = useCallback(() => {
        const grid = gridRef.current;
        setThemeStatus(
            `applied=${grid?.getTheme?.() ?? "none"} preview=${grid?.getPreviewTheme?.() ?? "none"}`,
        );
    }, []);

    useEffect(() => {
        const onCopy = (event: Event) => setCopiedText((event as CustomEvent<string>).detail);
        window.addEventListener(DEMO_CLIPBOARD_COPY_EVENT, onCopy);
        return () => window.removeEventListener(DEMO_CLIPBOARD_COPY_EVENT, onCopy);
    }, []);
    const spec = RFC_VALIDATION_SPECS[rfcId];
    const data = useMemo(
        () => makeData(RFC_VALIDATION_SPECS[rfcId].rowCount),
        [rfcId],
    );

    const rfcIndex = RFC_VALIDATION_ORDER.indexOf(rfcId) + 1;
    const rfcTotal = RFC_VALIDATION_ORDER.length;

    const navigateRfc = useCallback((nextId: RfcValidationId) => {
        const url = new URL(window.location.href);
        url.searchParams.set("rfc", nextId);
        url.searchParams.delete("e2e");
        window.history.replaceState({}, "", url);
        setRfcId(nextId);
    }, []);

    useEffect(() => {
        const onPopState = () => {
            setRfcId(parseRfcIdFromUrl(window.location.search));
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    const columns = useMemo(() => spec.columns, [spec.columns]);
    const gridOptions = useMemo(
        () => spec.buildOptions(data, columns),
        [spec, data, columns],
    );

    useEffect(() => {
        const host = gridHostRef.current;
        if (!host) {
            return;
        }

        host.replaceChildren();
        const grid = createGrid(gridOptions) as GridHostElement;
        spec.afterMount?.(grid);
        grid.style.display = "block";
        grid.style.height = "100%";
        grid.style.width = "100%";
        gridRef.current = grid;
        host.appendChild(grid);

        return () => {
            host.replaceChildren();
            gridRef.current = null;
        };
    }, [gridOptions, spec]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        gridRef.current?.setGlobalFilter?.(e.target.value);
    };

    const prevId = getAdjacentRfcId(rfcId, "prev");
    const nextId = getAdjacentRfcId(rfcId, "next");

    return (
        <div className="demo-shell">
            <div className="demo-panel">
                <header className="demo-header">
                    <div className="demo-brand">
                        <div className="demo-brand-row">
                            <div className="demo-logo" aria-hidden>
                                AG
                            </div>
                            <h1 className="demo-title">
                                RFC-{rfcId} · {spec.title}
                            </h1>
                        </div>
                        <p className="demo-subtitle">
                            demo-react 手动验收 · {spec.rowCount.toLocaleString()} 行
                        </p>
                    </div>
                    <div className="demo-meta">
                        <span className="demo-badge demo-badge--accent">
                            {spec.multicaIssue}
                        </span>
                        <span className="demo-badge">localhost:5198</span>
                        <span className="demo-badge">
                            {rfcIndex}/{rfcTotal}
                        </span>
                    </div>
                </header>

                <div className="demo-body">
                    <nav className="demo-rfc-nav" aria-label="RFC validation">
                        {RFC_VALIDATION_ORDER.map((id) => (
                            <button
                                key={id}
                                type="button"
                                className={`demo-rfc-pill${id === rfcId ? " is-active" : ""}`}
                                onClick={() => navigateRfc(id)}
                                aria-current={id === rfcId ? "step" : undefined}
                            >
                                {id}
                            </button>
                        ))}
                    </nav>

                    <p className="demo-hint">{spec.hint}</p>

                    {rfcId === "0010" ? (
                        <div className="demo-grouping-panel" data-testid="grouping-panel">
                            <button
                                type="button"
                                className="demo-btn"
                                data-testid="expand-all-btn"
                                onClick={() => gridRef.current?.expandAll?.()}
                            >
                                全部展开
                            </button>
                            <button
                                type="button"
                                className="demo-btn"
                                data-testid="collapse-all-btn"
                                onClick={() => gridRef.current?.collapseAll?.()}
                            >
                                全部折叠
                            </button>
                        </div>
                    ) : null}

                    {rfcId === "0011" ? (
                        <div className="demo-theme-panel" data-testid="theme-panel">
                            {["ocean", "dark"].map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    className="demo-btn"
                                    data-testid={`preview-${name}-btn`}
                                    onClick={() => {
                                        gridRef.current?.previewTheme?.(name);
                                        syncThemeStatus();
                                    }}
                                >
                                    预览 {name}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="demo-btn"
                                data-testid="cancel-preview-btn"
                                onClick={() => {
                                    gridRef.current?.cancelPreview?.();
                                    syncThemeStatus();
                                }}
                            >
                                取消预览
                            </button>
                            <button
                                type="button"
                                className="demo-btn"
                                data-testid="apply-ocean-btn"
                                onClick={() => {
                                    gridRef.current?.applyTheme?.("ocean");
                                    syncThemeStatus();
                                }}
                            >
                                应用 ocean
                            </button>
                            <span data-testid="theme-status">{themeStatus}</span>
                        </div>
                    ) : null}

                    {rfcId === "0023" ? (
                        <div className="demo-clipboard-panel" data-testid="clipboard-panel">
                            <label>
                                粘贴源（TSV）
                                <textarea
                                    id={DEMO_CLIPBOARD_SOURCE_ID}
                                    data-testid="clipboard-source"
                                    defaultValue={"Alpha\tOne\nBeta\tTwo"}
                                    rows={2}
                                />
                            </label>
                            <div>
                                最近复制：
                                <pre data-testid="clipboard-copied">{copiedText}</pre>
                            </div>
                        </div>
                    ) : null}

                    {rfcId === "0030" ? <FormulaSheet /> : null}

                    <div className="demo-toolbar">
                        {spec.showGlobalSearch ? (
                            <div className="demo-search-wrap">
                                <SearchIcon />
                                <input
                                    type="search"
                                    className="demo-search"
                                    placeholder="全局搜索所有列…"
                                    onChange={handleSearch}
                                    aria-label="全局搜索"
                                />
                            </div>
                        ) : (
                            <div />
                        )}

                        <div className="demo-nav-actions">
                            <button
                                type="button"
                                className="demo-btn"
                                disabled={!prevId}
                                onClick={() => prevId && navigateRfc(prevId)}
                            >
                                ← 上一个
                            </button>
                            <button
                                type="button"
                                className="demo-btn demo-btn--primary"
                                disabled={!nextId}
                                onClick={() => nextId && navigateRfc(nextId)}
                            >
                                下一个 →
                            </button>
                        </div>
                    </div>

                    {spec.hideGrid ? null : <div ref={gridHostRef} className="demo-grid-host" />}
                </div>

                <footer className="demo-footer">
                    <span>AC Grid RFC 验收台</span>
                    <span>Multica done: 0002–0009</span>
                </footer>
            </div>
        </div>
    );
}

export default App;
