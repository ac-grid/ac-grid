import * as echarts from "echarts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEChartsAdapter } from "../src/adapters/echarts";
import type { ChartSpec } from "../src/types";

// Real ECharts 6, rendered as SVG so no canvas is needed. Only init() is wrapped to choose the renderer and size.
const svgEcharts = {
  init: (element: HTMLElement) => echarts.init(element, null, { renderer: "svg", width: 480, height: 320 }),
};

const adapter = createEChartsAdapter(svgEcharts);

const barSpec: ChartSpec = {
  type: "bar",
  labels: ["Q1", "Q2", "Q3"],
  series: [
    { id: "revenue", label: "Revenue", values: [10, 20, 30] },
    { id: "cost", label: "Cost", values: [5, 8, 13] },
  ],
};

// ECharts paints on the next frame, so wait for it before reading the SVG.
const rendered = (container: HTMLElement) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(container.innerHTML), 100));

const textFill = (container: HTMLElement, text: string) =>
  Array.from(container.querySelectorAll("text"))
    .find((node) => node.textContent === text)
    ?.getAttribute("fill")
    ?.toLowerCase();

describe("createEChartsAdapter on ECharts 6", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders a bar chart with its series names and category labels", async () => {
    const chart = adapter.render(container, barSpec);
    const svg = await rendered(container);

    expect(container.querySelector("svg")).not.toBeNull();
    for (const text of ["Revenue", "Cost", "Q1", "Q2", "Q3"]) expect(svg).toContain(text);
    chart.destroy();
  });

  it("renders a line chart from the same spec", async () => {
    const chart = adapter.render(container, { ...barSpec, type: "line" });
    const svg = await rendered(container);

    expect(container.querySelector("svg")).not.toBeNull();
    expect(svg).toContain("Revenue");
    expect(svg).toContain("Q2");
    chart.destroy();
  });

  it("renders a pie chart with one sector per label", async () => {
    const chart = adapter.render(container, {
      type: "pie",
      labels: ["Red", "Green", "Blue"],
      series: [{ id: "share", label: "Share", values: [3, 2, 1] }],
    });
    const svg = await rendered(container);

    for (const text of ["Red", "Green", "Blue"]) expect(svg).toContain(text);
    chart.destroy();
  });

  it("applies the theme overrides to the rendered chart", async () => {
    const chart = adapter.render(container, {
      ...barSpec,
      themeOverrides: { backgroundColor: "#102030", colors: ["#aa0011", "#00bb22"], textColor: "#334455" },
    });
    const svg = (await rendered(container)).toLowerCase();

    expect(svg).toContain("#102030");
    expect(svg).toContain("#aa0011");
    // ECharts 6 ignores the global text color for these, so each kind of text must carry it.
    expect(textFill(container, "Revenue")).toBe("#334455"); // legend
    expect(textFill(container, "Q1")).toBe("#334455"); // category axis
    expect(textFill(container, "10")).toBe("#334455"); // value axis
    chart.destroy();
  });

  it("keeps the ECharts default text colors when no override is given", async () => {
    const chart = adapter.render(container, barSpec);
    const svg = await rendered(container);

    expect(svg).not.toContain("undefined");
    expect(textFill(container, "Q1")).toMatch(/^#[0-9a-f]{6}$/);
    expect(textFill(container, "Q1")).not.toBe("#334455");
    chart.destroy();
  });

  it("destroy() disposes the chart and removes it from the container", async () => {
    const chart = adapter.render(container, barSpec);
    await rendered(container);
    expect(container.querySelector("svg")).not.toBeNull();

    chart.destroy();

    expect(container.querySelector("svg")).toBeNull();
  });
});
