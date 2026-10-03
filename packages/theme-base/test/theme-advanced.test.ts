import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ThemeManager,
  themeManager,
  createThemeEditor,
  cloneTheme,
  themeToCSS,
  deepMerge,
  deepClone,
  type ACGridTheme,
  type ThemePackageMetadata,
} from "../src";

const mockTheme: ACGridTheme = {
  name: "cyberpunk",
  displayName: "Cyberpunk Neon",
  description: "High contrast cyberpunk neon theme",
  author: "NeonDev",
  version: "1.0.0",
  colors: {
    primary: "#00ffcc",
    border: "#ff007f",
    bgHeader: "#0a0a14",
    bgHover: "#1a1a2e",
    bgCell: "#0f0f1c",
    bgPopup: "#141424",
    bgSelected: "#2a1b4e",
    textPrimary: "#ffffff",
    textSecondary: "#a0a0c0",
    textDisabled: "#505070",
    success: "#00ff66",
    warning: "#ffcc00",
    error: "#ff0033",
    info: "#00ccff",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "13px",
      base: "14px",
      lg: "16px",
      xl: "18px",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  borders: {
    radius: {
      none: "0",
      sm: "2px",
      md: "4px",
      lg: "8px",
      full: "9999px",
    },
    width: {
      thin: "1px",
      base: "1px",
      thick: "2px",
    },
  },
  shadows: {
    none: "none",
    sm: "0 0 5px #00ffcc",
    md: "0 0 10px #00ffcc",
    lg: "0 0 20px #00ffcc",
    xl: "0 0 30px #00ffcc",
  },
};

const secondTheme: ACGridTheme = {
  ...mockTheme,
  name: "synthwave",
  displayName: "Synthwave 80s",
  colors: {
    ...mockTheme.colors,
    primary: "#ff71ce",
    border: "#01cdfe",
  },
};

describe("ThemeManager Advanced (RFC-0011)", () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = new ThemeManager();
    manager.registerTheme(mockTheme);
    manager.registerTheme(secondTheme);
  });

  afterEach(() => {
    // cleanup document styling if any
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.removeAttribute("style");
      document.documentElement.removeAttribute("data-theme-transition");
      document.documentElement.className = "";
    }
  });

  describe("Theme Preview & Cancel", () => {
    it("should preview theme without changing currentTheme permanently", () => {
      manager.applyTheme("cyberpunk");
      expect(manager.getCurrentTheme()).toBe("cyberpunk");
      expect(manager.isPreviewing()).toBe(false);

      const previewListener = vi.fn();
      const unsub = manager.onPreviewChange(previewListener);

      const startTime = performance.now();
      manager.previewTheme("synthwave");
      const duration = performance.now() - startTime;

      // RFC-0011 target: preview < 50ms
      expect(duration).toBeLessThan(50);
      expect(manager.isPreviewing()).toBe(true);
      expect(manager.getPreviewTheme()).toBe("synthwave");
      expect(manager.getCurrentTheme()).toBe("cyberpunk");
      expect(previewListener).toHaveBeenCalledWith("synthwave", "cyberpunk");

      expect(
        document.documentElement.style.getPropertyValue("--ac-grid-primary"),
      ).toBe("#ff71ce");

      unsub();
    });

    it("should cancel preview and restore previous theme", () => {
      manager.applyTheme("cyberpunk");
      manager.previewTheme("synthwave");
      expect(
        document.documentElement.style.getPropertyValue("--ac-grid-primary"),
      ).toBe("#ff71ce");

      const previewListener = vi.fn();
      manager.onPreviewChange(previewListener);

      manager.cancelPreview();
      expect(manager.isPreviewing()).toBe(false);
      expect(manager.getPreviewTheme()).toBe(null);
      expect(manager.getCurrentTheme()).toBe("cyberpunk");
      expect(previewListener).toHaveBeenCalledWith(null, "cyberpunk");

      expect(
        document.documentElement.style.getPropertyValue("--ac-grid-primary"),
      ).toBe("#00ffcc");
    });

    it("should support scoped preview and cancelPreview on target elements", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      manager.applyTheme("cyberpunk", container);
      expect(manager.getCurrentTheme(container)).toBe("cyberpunk");
      expect(container.style.getPropertyValue("--ac-grid-primary")).toBe(
        "#00ffcc",
      );

      manager.previewTheme("synthwave", container);
      expect(manager.isPreviewing(container)).toBe(true);
      expect(manager.getPreviewTheme(container)).toBe("synthwave");
      expect(container.style.getPropertyValue("--ac-grid-primary")).toBe(
        "#ff71ce",
      );

      manager.cancelPreview(container);
      expect(manager.isPreviewing(container)).toBe(false);
      expect(manager.getCurrentTheme(container)).toBe("cyberpunk");
      expect(container.style.getPropertyValue("--ac-grid-primary")).toBe(
        "#00ffcc",
      );

      document.body.removeChild(container);
    });

    it("should throw if previewing non-existent theme", () => {
      expect(() => manager.previewTheme("non-existent")).toThrow(
        'Theme "non-existent" not found',
      );
    });
  });

  describe("Theme Transitions (RFC-0011 Phase 1)", () => {
    it("should enable and configure transition styles on target or root", () => {
      const el = document.createElement("div");
      manager.enableTransition({
        duration: 300,
        timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        target: el,
      });

      expect(manager.isTransitionEnabled(el)).toBe(true);
      expect(manager.getTransitionDuration(el)).toBe(300);
      expect(
        el.style.getPropertyValue("--ac-grid-theme-transition-duration"),
      ).toBe("300ms");
      expect(
        el.style.getPropertyValue("--ac-grid-theme-transition-timing"),
      ).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
      expect(el.getAttribute("data-theme-transition")).toBe("true");
      expect(el.classList.contains("ac-grid-theme-transition")).toBe(true);

      manager.disableTransition(el);
      expect(manager.isTransitionEnabled(el)).toBe(false);
      expect(el.getAttribute("data-theme-transition")).toBeNull();
      expect(el.classList.contains("ac-grid-theme-transition")).toBe(false);
    });

    it("should handle global transition enabling/disabling", () => {
      manager.enableTransition({ duration: 250 });
      expect(manager.isTransitionEnabled()).toBe(true);
      expect(manager.getTransitionDuration()).toBe(250);

      manager.disableTransition();
      expect(manager.isTransitionEnabled()).toBe(false);
    });
  });

  describe("Theme Import / Export (RFC-0011 Phase 3)", () => {
    it("should export theme as JSON string", () => {
      const json = manager.exportTheme("cyberpunk");
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe("cyberpunk");
      expect(parsed.colors.primary).toBe("#00ffcc");

      const minified = manager.exportTheme("cyberpunk", { minify: true });
      expect(minified).not.toContain("\n");
    });

    it("should export theme as CSS stylesheet", () => {
      const css = manager.exportTheme("cyberpunk", {
        format: "css",
        selector: ".my-grid",
      });
      expect(css).toContain(".my-grid {");
      expect(css).toContain("--ac-grid-primary: #00ffcc;");
      expect(css).toContain("--ac-grid-border: #ff007f;");

      const minCss = manager.exportTheme("cyberpunk", {
        format: "css",
        selector: ".my-grid",
        minify: true,
      });
      expect(minCss).toContain(".my-grid{--ac-grid-primary:#00ffcc;");
    });

    it("should import theme from valid JSON string or object", () => {
      const newThemeData = {
        ...mockTheme,
        name: "imported-retro",
        displayName: "Imported Retro",
      };

      const imported = manager.importTheme(JSON.stringify(newThemeData));
      expect(imported.name).toBe("imported-retro");
      expect(manager.hasTheme("imported-retro")).toBe(true);
    });

    it("should throw error when importing invalid theme", () => {
      expect(() => manager.importTheme("{ invalid json }")).toThrow(
        "Failed to parse theme JSON",
      );
      expect(() => manager.importTheme({ name: "incomplete" })).toThrow(
        "Invalid theme",
      );
    });

    it("should respect overwrite option during import", () => {
      const duplicate = { ...mockTheme, displayName: "Updated Cyberpunk" };
      expect(() =>
        manager.importTheme(duplicate, { overwrite: false }),
      ).toThrow("already registered");

      const updated = manager.importTheme(duplicate, { overwrite: true });
      expect(updated.displayName).toBe("Updated Cyberpunk");
      expect(manager.getTheme("cyberpunk")?.displayName).toBe(
        "Updated Cyberpunk",
      );
    });
  });

  describe("Community Theme Package Specification (RFC-0011 Phase 3)", () => {
    it("should register and validate a community theme package", () => {
      const pkg: ThemePackageMetadata = {
        name: "@community/ac-grid-theme-neon",
        version: "1.0.0",
        description: "Neon themes collection for AC Grid",
        author: "NeonDev",
        license: "MIT",
        themes: [
          { ...mockTheme, name: "neon-blue" },
          { ...secondTheme, name: "neon-pink" },
        ],
        defaultTheme: "neon-blue",
      };

      manager.registerThemePackage(pkg);
      expect(
        manager.getThemePackage("@community/ac-grid-theme-neon"),
      ).toBeDefined();
      expect(manager.getThemePackages()).toHaveLength(1);
      expect(manager.hasTheme("neon-blue")).toBe(true);
      expect(manager.hasTheme("neon-pink")).toBe(true);
      expect(manager.getCurrentTheme()).toBe("neon-blue");

      manager.unregisterThemePackage("@community/ac-grid-theme-neon");
      expect(
        manager.getThemePackage("@community/ac-grid-theme-neon"),
      ).toBeUndefined();
      expect(manager.hasTheme("neon-blue")).toBe(false);
      expect(manager.hasTheme("neon-pink")).toBe(false);
    });

    it("should reject invalid community theme package", () => {
      expect(() => manager.registerThemePackage({} as any)).toThrow(
        "Invalid theme package",
      );
      expect(() =>
        manager.registerThemePackage({
          name: "bad-pkg",
          version: "1.0.0",
          themes: [],
        } as any),
      ).toThrow("Package must contain at least one theme");
    });
  });

  describe("ThemeEditor & Clone Utility (RFC-0011 Phase 3)", () => {
    it("should create and customize theme using ThemeEditor fluent API", () => {
      const editor = createThemeEditor("cyberpunk", manager);
      editor
        .setName("custom-cyberpunk")
        .setDisplayName("My Custom Cyberpunk")
        .setColor("primary", "#ffff00")
        .setSpacing({ md: "20px" })
        .setTypography({ fontSize: { base: "15px" } });

      const built = editor.build();
      expect(built.name).toBe("custom-cyberpunk");
      expect(built.displayName).toBe("My Custom Cyberpunk");
      expect(built.colors.primary).toBe("#ffff00");
      expect(built.spacing.md).toBe("20px");
      expect(built.typography.fontSize.base).toBe("15px");
      expect(built.colors.border).toBe("#ff007f"); // preserved from base
    });

    it("should preview and save using ThemeEditor", () => {
      const editor = createThemeEditor("cyberpunk", manager);
      editor.setName("editor-preview-theme").setColor("primary", "#123456");

      editor.preview();
      expect(
        document.documentElement.style.getPropertyValue("--ac-grid-primary"),
      ).toBe("#123456");

      editor.cancelPreview();
      expect(
        document.documentElement.style.getPropertyValue("--ac-grid-primary"),
      ).not.toBe("#123456");

      editor.save();
      expect(manager.hasTheme("editor-preview-theme")).toBe(true);
    });

    it("should clone existing theme via cloneTheme utility", () => {
      const cloned = cloneTheme(
        "cyberpunk",
        "cyberpunk-cloned",
        {
          displayName: "Cloned Cyberpunk",
          colors: { primary: "#abcdef" },
        },
        manager,
      );

      expect(cloned.name).toBe("cyberpunk-cloned");
      expect(cloned.displayName).toBe("Cloned Cyberpunk");
      expect(cloned.colors.primary).toBe("#abcdef");
      expect(cloned.colors.border).toBe("#ff007f");
    });
  });
});
