---
name: ac-grid
description: Build, configure and verify AC Grid (@ac-grid/core), a Web Component data grid on @tanstack/table-core. Use when a task adds or changes an ac-grid table, mounts createGrid, enables sorting, filtering, pagination, selection, pinning, editing, grouping, clipboard, themes or i18n, or adds a demo or Playwright test for an ac-grid RFC.
---

# AC Grid

`@ac-grid/core` ships `<wsx-ac-grid>`, a framework-agnostic custom element. `createGrid(options)` returns that element; append it to the DOM.

## When to use

- Mounting or configuring an ac-grid in an app.
- Turning on a feature that has an RFC (see [features](references/features.md)).
- Adding a demo page or E2E test for an RFC in the ac-grid repo.

Do not use for other grid libraries, or for RFCs still marked draft in [features](references/features.md): they have no implementation.

## Mount a grid

1. Install the packages: `pnpm add @ac-grid/core @ac-grid/theme-base @ac-grid/theme-default`.
2. Import the theme package once, before creating a grid: `import "@ac-grid/theme-default";`. It registers the built-in themes.
3. Create and mount:

```ts
import { createGrid } from "@ac-grid/core";

const grid = createGrid({
  data,
  columns, // TanStack column defs; add id, header, size, filterType, enableSorting as needed
  className: "h-full w-full",
});
grid.style.display = "block";
grid.style.height = "100%"; // the grid fills its host; give the host a height
host.appendChild(grid);
```

4. Enable one feature per option key. Each option object takes `enabled: true`. Exact shapes are in [features](references/features.md).

## Rules

- Give the host element a height; the grid is `height: 100%` of it.
- Set editing through the element, not `createGrid`: `grid.editingConfig = { enabled: true, mode: "doubleClick" }`.
- Keep `@ac-grid/theme-base` as a single shared copy. `grid.applyTheme(name)` throws `Theme "<name>" not found` when core and the theme package hold different `ThemeManager` instances.
- Wait for the grid to settle before scripted input. Rows paint before init finishes, and a click in that window can be lost.

## Verify a feature

1. Run the demo bench: `pnpm --filter @ac-grid/demo-react dev:e2e`, then open `/?rfc=<id>`.
2. Build workspace packages first: `pnpm turbo run build --filter='./packages/*'`. Without `dist/` the demo fails to resolve `@ac-grid/core`.
3. Run `pnpm --filter @ac-grid/demo-react test:e2e`. Test titles must contain `RFC-<id>`; the coverage guard fails for any completed RFC without a demo or a titled test.
4. Assert observable behavior with real mouse and keyboard input: DOM order, selected rows, computed styles, copied text. Do not assert only that an element exists.

## Adding a demo for an RFC

1. Add the id to `RFC_VALIDATION_ORDER` and a spec to `RFC_VALIDATION_SPECS` in `demos/react/src/rfcValidationDemos.ts`.
2. Add any toolbar controls to `demos/react/src/App.tsx`.
3. Add `RFC-<id>` titled tests to `demos/react/e2e/rfc-validation.spec.ts`.
4. Update the matrix in `.spec/rfc/0034-rfc-demo-acceptance-matrix.md`.
