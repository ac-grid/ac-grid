import type { ChartAdapter, ChartInstance } from "../types.js";

interface ChartJsInstance {
  destroy(): void;
}

interface ChartJsConstructor {
  new (canvas: HTMLCanvasElement, config: Record<string, unknown>): ChartJsInstance;
}

/** Pass the Chart constructor exported from `chart.js/auto`. */
export function createChartJsAdapter(Chart: unknown): ChartAdapter {
  if (typeof Chart !== "function") {
    throw new TypeError("Expected the Chart constructor exported from chart.js/auto.");
  }
  return {
    render(container, spec): ChartInstance {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `${spec.type} chart`);
      canvas.style.backgroundColor = spec.themeOverrides?.backgroundColor ?? "";
      container.appendChild(canvas);

      const datasets = spec.type === "pie"
        ? [{
            label: spec.series[0]?.label ?? "",
            data: spec.series[0]?.values ?? [],
            backgroundColor: spec.themeOverrides?.colors,
            borderColor: spec.themeOverrides?.colors,
          }]
        : spec.series.map((series) => ({
            label: series.label,
            data: series.values,
            backgroundColor: spec.themeOverrides?.colors,
            borderColor: spec.themeOverrides?.colors,
          }));
      const instance = new (Chart as ChartJsConstructor)(canvas, {
        type: spec.type,
        data: { labels: spec.labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: spec.themeOverrides?.textColor,
          font: { family: spec.themeOverrides?.fontFamily },
          plugins: { legend: { labels: { color: spec.themeOverrides?.textColor } } },
          ...(spec.type === "pie"
            ? {}
            : {
                scales: {
                  x: { ticks: { color: spec.themeOverrides?.textColor } },
                  y: { ticks: { color: spec.themeOverrides?.textColor } },
                },
              }),
        },
      });

      return {
        destroy() {
          instance.destroy();
          canvas.remove();
        },
      };
    },
  };
}
