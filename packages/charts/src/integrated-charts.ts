import type { CellRange, RangeChartColumn } from "@ac-grid/core";
import type {
  ChartInstance,
  ChartRef,
  CreateRangeChartParams,
  GridChartHost,
  IntegratedChartsApi,
  IntegratedChartsOptions,
} from "./types.js";

function resolveRange(grid: GridChartHost, range?: CellRange): CellRange {
  const selected = range ?? grid.getCellRanges()[0];
  if (!selected) throw new Error("Select a cell range before creating a chart.");
  return selected;
}

function createSpec(grid: GridChartHost, params: CreateRangeChartParams) {
  const range = resolveRange(grid, params.range);
  const data = grid.getRangeChartData(range);
  if (data.rowCount === 0 || data.columns.length === 0) {
    throw new Error("The selected range has no chart data.");
  }

  const category = params.categoryColumn
    ? data.columns.find((column) => column.id === params.categoryColumn)
    : data.columns[0];
  if (params.categoryColumn && !category) {
    throw new Error(`Category column "${params.categoryColumn}" is not in the selected range.`);
  }

  const requestedSeries = params.seriesColumns
    ? new Set(params.seriesColumns)
    : undefined;
  const series = data.columns.filter((column) =>
    column.id !== category?.id && (!requestedSeries || requestedSeries.has(column.id))
  );
  const missingSeries = params.seriesColumns?.filter((id) =>
    !data.columns.some((column) => column.id === id)
  );
  if (missingSeries?.length) {
    throw new Error(`Series columns are not in the selected range: ${missingSeries.join(", ")}.`);
  }
  if (params.seriesColumns?.length && series.length === 0) {
    throw new Error("The selected range has no chart series after applying seriesColumns.");
  }
  if (series.length === 0) {
    const valueColumn = category;
    if (!valueColumn) throw new Error("The selected range has no chart series.");
    return {
      labels: valueColumn.values.map((_, index) => String(index + 1)),
      series: [toSeries(valueColumn)],
    };
  }
  return {
    labels: category?.values ?? data.columns[0].values.map((_, index) => String(index + 1)),
    series: series.map(toSeries),
  };
}

function toSeries(column: RangeChartColumn) {
  return { id: column.id, label: column.id, values: column.values };
}

function createContainer(
  grid: GridChartHost,
  mode: IntegratedChartsOptions["container"],
  chart: ChartRef,
): { element: HTMLElement; dialog?: HTMLDialogElement; destroy(): void } {
  if (typeof mode === "function") {
    return { element: mode(chart), destroy() {} };
  }
  if (mode === "modal") {
    const dialog = document.createElement("dialog");
    dialog.className = "ac-grid-chart-dialog";
    dialog.style.width = "min(90vw, 960px)";
    dialog.style.minHeight = "280px";
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close chart";
    closeButton.setAttribute("aria-label", "Close chart");
    dialog.appendChild(closeButton);
    document.body.appendChild(dialog);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    return { element: dialog, dialog, destroy: () => dialog.remove() };
  }
  const container = document.createElement("div");
  container.className = "ac-grid-chart-container";
  container.style.width = "100%";
  container.style.minHeight = "240px";
  if (grid.parentElement) grid.insertAdjacentElement("afterend", container);
  else grid.appendChild(container);
  return { element: container, destroy: () => container.remove() };
}

export function setupIntegratedCharts(
  grid: GridChartHost,
  options: IntegratedChartsOptions,
): IntegratedChartsApi {
  if (!grid.enableCharts) {
    throw new Error("Set enableCharts: true in createGrid before setting up integrated charts.");
  }
  const charts = new Set<ChartRef>();
  let destroyed = false;
  let observer: MutationObserver | undefined;

  const api: IntegratedChartsApi = {
    createRangeChart(params) {
      if (destroyed) throw new Error("Integrated charts have been destroyed.");
      const spec = createSpec(grid, params);
      const chartElement = document.createElement("div");
      chartElement.className = "ac-grid-chart";
      chartElement.setAttribute("role", "figure");
      chartElement.setAttribute("aria-label", `${params.type} chart`);
      chartElement.style.width = "100%";
      chartElement.style.height = "240px";
      let chartDestroyed = false;
      let rendered: ChartInstance | undefined;
      let mount: ReturnType<typeof createContainer> | undefined;
      const ref: ChartRef = {
        type: params.type,
        element: chartElement,
        destroy() {
          if (chartDestroyed) return;
          chartDestroyed = true;
          try {
            rendered?.destroy();
          } finally {
            chartElement.remove();
            mount?.destroy();
            charts.delete(ref);
          }
        },
      };
      mount = createContainer(grid, options.container ?? "dock", ref);
      if (chartDestroyed) {
        mount.destroy();
        return ref;
      }
      mount.element.appendChild(chartElement);
      try {
        rendered = options.adapter.render(chartElement, {
          ...spec,
          type: params.type,
          themeOverrides: options.chartThemeOverrides ?? grid.chartThemeOverrides,
        });
      } catch (error) {
        ref.destroy();
        throw error;
      }
      charts.add(ref);
      const dialog = mount.dialog;
      if (dialog) {
        dialog.querySelector("button")?.addEventListener("click", () => {
          if (typeof dialog.close === "function") dialog.close();
          ref.destroy();
        });
        dialog.addEventListener("close", () => ref.destroy(), { once: true });
      }
      return ref;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      let cleanupError: unknown;
      for (const chart of [...charts]) {
        try {
          chart.destroy();
        } catch (error) {
          cleanupError ??= error;
        }
      }
      if (cleanupError) throw cleanupError;
    },
  };

  if (typeof MutationObserver !== "undefined" && document.documentElement) {
    let wasConnected = grid.isConnected;
    observer = new MutationObserver(() => {
      if (grid.isConnected) {
        wasConnected = true;
      } else if (wasConnected) {
        api.destroy();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  return api;
}
