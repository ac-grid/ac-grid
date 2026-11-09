# Framework bindings

AC Grid provides adapters for React, Vue 3, Angular, and Svelte 5. Each adapter renders the `wsx-ac-grid` custom element from `@ac-grid/core` and assigns `data`, `columns`, and `gridProps` as element properties. The adapters keep the custom element mounted when those values change.

Install `@ac-grid/core` and the adapter for your framework. Framework runtimes and the core package are peer dependencies of the adapters.

## React

```tsx
import { AcGrid } from "@ac-grid/react";
import type { ColumnDef } from "@ac-grid/core";

<AcGrid data={rows} columns={columns satisfies ColumnDef<Person>[]} />;
```

## Vue 3

```vue
<script setup lang="ts">
import { AcGrid } from "@ac-grid/vue";
</script>

<template>
  <AcGrid :data="rows" :columns="columns" :grid-props="{ sortingConfig }" />
</template>
```

## Angular

Import the standalone `AcGrid` component and bind its inputs:

```ts
import { AcGrid } from "@ac-grid/angular";

@Component({
  standalone: true,
  imports: [AcGrid],
  template:
    '<ac-grid [data]="rows" [columns]="columns" [gridProps]="gridProps"></ac-grid>',
})
export class ExampleComponent {}
```

## Svelte 5

```svelte
<script lang="ts">
  import AcGrid from "@ac-grid/svelte";
</script>

<AcGrid data={rows} {columns} gridProps={{ sortingConfig }} />
```

## Grid configuration

Pass grid configuration properties through `gridProps`. The adapters type this object from the configuration properties exposed by `Grid` in `@ac-grid/core`.

```tsx
<AcGrid
  data={rows}
  columns={columns}
  gridProps={{
    sortingConfig: { enabled: true, onSortingChange: setSorting },
    paginationConfig: { pageSize: 25 },
  }}
/>
```

The explicit `data` and `columns` inputs take precedence over matching properties in `gridProps`. The adapter does not remount the custom element when inputs change.
