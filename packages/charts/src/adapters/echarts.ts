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
        // ECharts 6 no longer applies the global textStyle.color to legend and axis text, so set it on each.
        legend: { textStyle: { color: spec.themeOverrides?.textColor } },
        xAxis: spec.type === "pie" ? undefined : {
          type: "category",
          data: spec.labels,
          axisLabel: { color: spec.themeOverrides?.textColor },
        },
        yAxis: spec.type === "pie" ? undefined : {
          type: "value",
          axisLabel: { color: spec.themeOverrides?.textColor },
        },
        series,
      });
      return { destroy: () => chart.dispose() };
    },
  };
}
