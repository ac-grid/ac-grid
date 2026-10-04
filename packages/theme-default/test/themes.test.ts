import { describe, it, expect } from "vitest";
import { themeManager } from "@ac-grid/theme-base";
import "../src"; // registers all default presets

describe("@ac-grid/theme-default", () => {
  const expectedThemes = [
    "light",
    "dark",
    "ocean",
    "forest",
    "sunset",
    "bamboo",
    "violet",
  ];

  it("should register all 7 default preset themes", () => {
    const registered = themeManager.getThemes();
    for (const name of expectedThemes) {
      expect(registered).toContain(name);
      const theme = themeManager.getTheme(name);
      expect(theme).toBeDefined();
      const validation = themeManager.validateTheme(theme!);
      expect(validation.valid).toBe(true);
    }
  });

  it("should be able to apply and preview each preset theme", () => {
    for (const name of expectedThemes) {
      themeManager.previewTheme(name);
      expect(themeManager.getPreviewTheme()).toBe(name);
      themeManager.cancelPreview();
      expect(themeManager.getPreviewTheme()).toBeNull();
    }
  });
});
