---
title: Getting Started
order: 1
category: guide/essentials
description: "Install and use AC Grid in your project in minutes. Framework-agnostic, Web Components + TypeScript."
---

# Getting Started with AC Grid

AC Grid is a **fully open source data grid** to replace AG Grid. It's framework-agnostic, built with Web Components and [@tanstack/table-core](https://tanstack.com/table/latest).

## Installation

```bash
npm install @ac-grid/core
# or
pnpm add @ac-grid/core
# or
yarn add @ac-grid/core
```

## Quick Start

### With a bundler (Vite, Webpack, etc.)

```ts
import '@ac-grid/core';
import { createGrid } from '@ac-grid/core';

const gridEl = createGrid({
  data: [
    { id: '1', name: 'Alice', age: 28 },
    { id: '2', name: 'Bob', age: 32 },
  ],
  columns: [
    { id: 'name', accessorKey: 'name', header: 'Name' },
    { id: 'age', accessorKey: 'age', header: 'Age' },
  ],
});

document.getElementById('app')!.appendChild(gridEl);
```

### With a framework (React, Vue, etc.)

Use the custom element `<wsx-ac-grid>` (or the tag your wrapper exposes). Pass `data` and `columns` as properties. See [Samples](/examples) for examples.

## Next steps

- [Sorting](/docs/guide/features/sorting) – Enable and customize column sorting
- [Filtering](/docs/guide/features/filtering) – Column filters and global search
- [Theming](/docs/guide/features/theming) – Light/dark and custom themes
- [API Reference](https://github.com/systembugtj/ac-grid) – Types and exports from `@ac-grid/core`
- [RFCs](https://github.com/systembugtj/ac-grid/tree/main/docs/rfc) – Design docs and roadmap
