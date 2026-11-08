import type { ChartAdapter, ChartInstance } from "../types.js";

interface EChartsInstance {
  setOption(option: Record<string, unknown>): void;
  dispose(): void;
}

interface EChartsNamespace {
  init(element: HTMLElement): EChartsInstance;
}

export function createEChartsAdapter(echarts: EChartsNamespace): ChartAdapter {
  return {
    render(container, spec): ChartInstance {
      const chart = echarts.init(container);
      const series = spec.type === "pie"
        ? [{
            name: spec.series[0]?.label ?? "",
            type: "pie",
            data: (spec.series[0]?.values ?? []).map((value, index) => ({
              name: spec.labels[index],
              value,
            })),
          }]
        : spec.series.map((item) => ({
            name: item.label,
            type: spec.type,
            data: item.values,
          }));
      chart.setOption({
        backgroundColor: spec.themeOverrides?.backgroundColor,
        color: spec.themeOverrides?.colors,
        textStyle: {
          color: spec.themeOverrides?.textColor,
          fontFamily: spec.themeOverrides?.fontFamily,
        },
        tooltip: { trigger: spec.type === "pie" ? "item" : "axis" },
        legend: {},
        xAxis: spec.type === "pie" ? undefined : { type: "category", data: spec.labels },
        yAxis: spec.type === "pie" ? undefined : { type: "value" },
        series,
      });
      return { destroy: () => chart.dispose() };
    },
  };
}
