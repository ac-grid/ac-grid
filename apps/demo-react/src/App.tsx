import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import { createGrid } from "@ac-grid/core";

import { makeData } from "./stories/makeData";
import {
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

function App() {
    const gridHostRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<GridHostElement | null>(null);
    const [rfcId, setRfcId] = useState<RfcValidationId>(() =>
        parseRfcIdFromUrl(window.location.search),
    );

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
                        <span className="demo-badge">localhost:5174</span>
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

                    <div ref={gridHostRef} className="demo-grid-host" />
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
