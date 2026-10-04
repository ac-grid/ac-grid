import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createGrid, themeManager, type ACGridTheme } from "../src";

const testThemeLight: ACGridTheme = {
  name: "test-light",
  displayName: "Test Light",
  colors: {
    primary: "#1890ff",
    border: "#d9d9d9",
    bgHeader: "#fafafa",
    bgHover: "#f5f5f5",
    bgCell: "#ffffff",
    bgPopup: "#ffffff",
    bgSelected: "#e6f7ff",
    textPrimary: "#000000",
    textSecondary: "#666666",
    textDisabled: "#cccccc",
    success: "#52c41a",
    warning: "#faad14",
    error: "#f5222d",
    info: "#1890ff",
  },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" },
  typography: {
    fontSize: { xs: "12px", sm: "13px", base: "14px", lg: "16px", xl: "18px" },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: "1.25", normal: "1.5", relaxed: "1.75" },
  },
  borders: {
    radius: { none: "0", sm: "2px", md: "4px", lg: "8px", full: "9999px" },
    width: { thin: "1px", base: "1px", thick: "2px" },
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.1)",
  },
};

const testThemeDark: ACGridTheme = {
  ...testThemeLight,
  name: "test-dark",
  displayName: "Test Dark",
  colors: {
    ...testThemeLight.colors,
    primary: "#177ddc",
    border: "#434343",
    bgHeader: "#1f1f1f",
    bgHover: "#262626",
    bgCell: "#141414",
    bgSelected: "#111b26",
    textPrimary: "#ffffff",
    textSecondary: "#8c8c8c",
  },
};

describe("Grid Theme Advanced Integration (RFC-0011)", () => {
  let container: HTMLElement;

  const sampleColumns = [
    { id: "id", header: "ID", accessorKey: "id" },
    { id: "name", header: "Name", accessorKey: "name" },
  ];

  const sampleData = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    if (!themeManager.hasTheme("test-light")) {
      themeManager.registerTheme(testThemeLight);
    }
    if (!themeManager.hasTheme("test-dark")) {
      themeManager.registerTheme(testThemeDark);
    }
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (themeManager.hasTheme("test-light")) {
      themeManager.unregisterTheme("test-light");
    }
    if (themeManager.hasTheme("test-dark")) {
      themeManager.unregisterTheme("test-dark");
    }
  });

  it("should initialize grid with theme and themeTransition options in createGrid", () => {
    const grid = createGrid({
      data: sampleData,
      columns: sampleColumns,
      container,
      theme: "test-light",
      themeTransition: true,
      themeTransitionDuration: 350,
    }) as any;

    expect(grid.isThemeTransitionEnabled()).toBe(true);
    expect(grid.getThemeTransitionDuration()).toBe(350);
    expect(grid.getAttribute("data-theme-transition")).toBe("true");
    expect(grid.classList.contains("theme-transition")).toBe(true);
    expect(
      grid.style.getPropertyValue("--ac-grid-theme-transition-duration"),
    ).toBe("350ms");
    expect(grid.getTheme()).toBe("test-light");
    expect(grid.style.getPropertyValue("--ac-grid-primary")).toBe("#1890ff");
  });

  it("should apply theme to grid instance and dispatch theme-change event", () => {
    const grid = createGrid({
      data: sampleData,
      columns: sampleColumns,
      container,
    }) as any;

    const changeHandler = vi.fn();
    grid.addEventListener("theme-change", changeHandler);

    const startTime = performance.now();
    grid.applyTheme("test-dark");
    const duration = performance.now() - startTime;

    // RFC-0011 budget: switch < 300ms
    expect(duration).toBeLessThan(300);
    expect(grid.getTheme()).toBe("test-dark");
    expect(grid.style.getPropertyValue("--ac-grid-primary")).toBe("#177ddc");
    expect(grid.style.getPropertyValue("--ac-grid-bg-header")).toBe("#1f1f1f");
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler.mock.calls[0][0].detail).toEqual({
      theme: "test-dark",
    });
  });

  it("should preview theme and cancel preview, restoring previous theme", () => {
    const grid = createGrid({
      data: sampleData,
      columns: sampleColumns,
      container,
      theme: "test-light",
    }) as any;

    expect(grid.getTheme()).toBe("test-light");
    expect(grid.style.getPropertyValue("--ac-grid-primary")).toBe("#1890ff");

    const previewHandler = vi.fn();
    const cancelHandler = vi.fn();
    grid.addEventListener("theme-preview", previewHandler);
    grid.addEventListener("theme-preview-cancel", cancelHandler);

    const startTime = performance.now();
    grid.previewTheme("test-dark");
    const previewDuration = performance.now() - startTime;

    // RFC-0011 budget: preview < 50ms
    expect(previewDuration).toBeLessThan(50);
    expect(grid.getPreviewTheme()).toBe("test-dark");
    expect(grid.getTheme()).toBe("test-light"); // unchanged active theme
    expect(grid.style.getPropertyValue("--ac-grid-primary")).toBe("#177ddc");
    expect(previewHandler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { theme: "test-dark" } }),
    );

    // Cancel preview
    grid.cancelPreview();
    expect(grid.getPreviewTheme()).toBeNull();
    expect(grid.getTheme()).toBe("test-light");
    expect(grid.style.getPropertyValue("--ac-grid-primary")).toBe("#1890ff");
    expect(cancelHandler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { restoredTheme: "test-light" } }),
    );
  });

  it("should toggle and update themeTransition dynamically", () => {
    const grid = createGrid({
      data: sampleData,
      columns: sampleColumns,
      container,
      themeTransition: false,
    }) as any;

    expect(grid.isThemeTransitionEnabled()).toBe(false);
    expect(grid.getAttribute("data-theme-transition")).toBeNull();

    grid.setThemeTransition(true, 400);
    expect(grid.isThemeTransitionEnabled()).toBe(true);
    expect(grid.getThemeTransitionDuration()).toBe(400);
    expect(grid.getAttribute("data-theme-transition")).toBe("true");
    expect(
      grid.style.getPropertyValue("--ac-grid-theme-transition-duration"),
    ).toBe("400ms");

    grid.setThemeTransition(false);
    expect(grid.isThemeTransitionEnabled()).toBe(false);
    expect(grid.getAttribute("data-theme-transition")).toBeNull();
  });
});
