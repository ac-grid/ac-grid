# RFC-0017: Framework bindings

**Status:** Implemented
**Version:** 0.5.0
**Author:** AC Grid Team
**Date:** 2026-11-09
**Related RFCs:** [0001](0001-ac-grid-architecture.md)

## Summary

Provide typed React, Vue 3, Angular, and Svelte 5 adapters for the existing `wsx-ac-grid` custom element. Each adapter assigns object-valued properties to the element, forwards grid configuration callbacks, and keeps the grid mounted when input properties change. Frameworks and `@ac-grid/core` remain peer dependencies.

## Problem

AC Grid exposes a framework-neutral Web Component, but consumers must currently handle element registration, property assignment, and lifecycle cleanup themselves. Framework templates do not consistently assign arrays and configuration objects as DOM properties, so passing `data` and `columns` as attributes does not provide a usable grid instance.

## Goals

- Provide typed `AcGrid` bindings for React, Vue 3, Angular, and Svelte 5.
- Map the existing `data`, `columns`, and grid configuration properties to `wsx-ac-grid` properties.
- Preserve the custom element instance when input values change.
- Declare framework runtimes and `@ac-grid/core` as peer dependencies.
- Keep framework adapters free of grid rendering, state, and data-model logic.

## Non-goals

- Replacing the Web Component or rewriting grid behavior in a framework.
- Server-side rendering or framework-specific hydration guarantees.
- Mapping every grid callback to a framework event. Callbacks remain part of the typed grid configuration properties.

## Design

Each adapter renders one `wsx-ac-grid` element and assigns its typed inputs as DOM properties after the element is available. Adapters update those properties when inputs change and remove any listeners or effects when their host component unmounts. Importing an adapter registers the custom element through `@ac-grid/core`.

The public inputs are `data`, `columns`, and `gridProps`. `gridProps` contains additional properties supported by `Grid`, such as sorting, filtering, pagination, selection, and state persistence configuration. `data` and `columns` take precedence over matching keys in `gridProps`.

```tsx
<AcGrid data={rows} columns={columns} gridProps={{ sorting: sortingConfig }} />
```

The React, Vue, Angular, and Svelte packages depend on `@ac-grid/core` through peer dependencies. Each package declares its corresponding framework as a peer dependency.

## Acceptance

- Each supported framework can render the grid with array-valued `data` and `columns` properties.
- Changing `data`, `columns`, or `gridProps` updates properties on the same custom element instance.
- Unmounting a framework component removes adapter-owned effects and listeners.
- Each adapter package builds without bundling its framework runtime or `@ac-grid/core`.
- Property synchronization tests cover assignment and precedence. Each adapter package builds with its framework runtime externalized.

## References

- [AG Grid framework documentation](https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/)
- [Parity matrix](../../PARITY_MATRIX.md)
