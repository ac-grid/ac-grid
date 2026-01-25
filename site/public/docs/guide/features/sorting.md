---
title: Sorting
order: 1
category: guide/features
description: "Learn how to use sorting functionality in AC Grid, including single-column sorting, multi-column sorting, and custom comparators"
---

# Sorting

AC Grid provides powerful sorting capabilities that allow users to organize data by clicking column headers.

## Quick Start

Sorting is enabled by default in AC Grid. Users can simply click column headers to sort data.

```typescript
import '@ac-grid/core';

const columns = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'age', accessorKey: 'age', header: 'Age' },
  { id: 'email', accessorKey: 'email', header: 'Email' }
];

// Sorting is enabled by default
<wsx-ac-grid data={data} columns={columns} />
```

## Basic Usage

### Enabling Sorting

Sorting is enabled by default. To disable sorting on specific columns, set `enableSorting: false`.

```typescript
const columns = [
  { 
    id: 'name', 
    accessorKey: 'name', 
    header: 'Name',
    // enableSorting: true  // Default value, can be omitted
  },
  { 
    id: 'actions', 
    header: 'Actions',
    enableSorting: false  // Disable sorting for this column
  }
];
```

## Single Column Sorting

### User Interaction

When users click a column header, the sort state cycles through:
1. **Unsorted** → Click → **Ascending** (↑)
2. **Ascending** → Click → **Descending** (↓)
3. **Descending** → Click → **Unsorted**

### Sort Indicator

Sort indicators automatically appear in sortable column headers:
- **↑** indicates ascending sort
- **↓** indicates descending sort
- **No icon** indicates unsorted

## Multi-Column Sorting

### How to Use

Hold **Shift** and click multiple column headers to sort by multiple columns. Sort priority follows the click order.

### Sort Indicator

In multi-column sort mode, sort indicators display sort indices (1, 2, 3...), indicating sort priority.

## Custom Sorting Functions

AC Grid supports custom comparators via the `sortingFn` property.

### Comparator Function Signature

```typescript
type SortingFn<TData> = (
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string
) => number;
```

**Return Value**:
- **Negative**: `rowA` should come before `rowB`
- **Positive**: `rowA` should come after `rowB`
- **Zero**: Equal, maintain original order

### Basic Example

```typescript
const columns = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    sortingFn: (rowA, rowB, columnId) => {
      // Case-insensitive string sorting
      const a = String(rowA.getValue(columnId)).toLowerCase();
      const b = String(rowB.getValue(columnId)).toLowerCase();
      return a.localeCompare(b);
    }
  }
];
```

### Chinese Pinyin Sorting

```typescript
const columns = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    sortingFn: (rowA, rowB, columnId) => {
      // Chinese pinyin sorting
      return rowA.getValue(columnId).localeCompare(
        rowB.getValue(columnId), 
        'zh-CN'
      );
    }
  }
];
```

### Number Sorting (Handling null/undefined)

```typescript
const columns = [
  {
    id: 'age',
    accessorKey: 'age',
    header: 'Age',
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number | null | undefined;
      const b = rowB.getValue(columnId) as number | null | undefined;
      // null/undefined sorted last
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      return a - b;
    }
  }
];
```

### Date Sorting

```typescript
const columns = [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created At',
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId) as string);
      const dateB = new Date(rowB.getValue(columnId) as string);
      return dateA.getTime() - dateB.getTime();
    }
  }
];
```

### Custom Priority Sorting

```typescript
const columns = [
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortingFn: (rowA, rowB, columnId) => {
      const statusOrder = { 
        'active': 1, 
        'pending': 2, 
        'inactive': 3 
      };
      const a = rowA.getValue(columnId) as keyof typeof statusOrder;
      const b = rowB.getValue(columnId) as keyof typeof statusOrder;
      return (statusOrder[a] || 999) - (statusOrder[b] || 999);
    }
  }
];
```

### Multi-Field Combined Sorting

```typescript
const columns = [
  {
    id: 'fullName',
    accessorKey: 'fullName',
    header: 'Full Name',
    sortingFn: (rowA, rowB, columnId) => {
      // Sort by last name first, then first name
      const a = rowA.original as Person;
      const b = rowB.original as Person;
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    }
  }
];
```

### Using Built-in Sorting Functions

```typescript
import { sortingFns } from '@tanstack/table-core';

const columns = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    sortingFn: sortingFns.alphanumeric,  // Alphanumeric sorting
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: 'Date',
    sortingFn: sortingFns.datetime,     // DateTime sorting
  },
  {
    id: 'number',
    accessorKey: 'number',
    header: 'Number',
    sortingFn: sortingFns.basic,        // Basic sorting
  }
];
```

## Programmatic Sorting

### Setting Sort State

```typescript
import { createGrid } from '@ac-grid/core';
import type { SortingState } from '@ac-grid/core';

const gridElement = createGrid({
  data,
  columns,
  sorting: {
    initialState: [
      { id: 'name', desc: false },  // Sort by name ascending first
      { id: 'age', desc: true }     // Then by age descending
    ],
    onSortingChange: (sorting: SortingState) => {
      console.log('Sorting changed:', sorting);
    }
  }
});

// Programmatically set sorting
(gridElement as any).setSorting([{ id: 'age', desc: false }]);
```

### Getting Current Sort State

```typescript
const currentSorting = (gridElement as any).getSorting();
console.log(currentSorting);
// [{ id: 'age', desc: false }]
```

### Resetting Sorting

```typescript
(gridElement as any).resetSorting();
```

### Using in wsxjs Components

```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, state, autoRegister } from '@wsxjs/wsx-core';
import type { SortingState } from '@ac-grid/core';

@autoRegister({ tagName: 'my-app' })
export class App extends LightComponent {
  @state private sorting: SortingState = [
    { id: 'name', desc: false }
  ];

  private handleSortingChange = (newSorting: SortingState) => {
    this.sorting = newSorting;
    console.log('Sorting updated:', newSorting);
  };

  render() {
    return (
      <wsx-ac-grid 
        data={this.data} 
        columns={this.columns}
        sorting={{
          initialState: this.sorting,
          onSortingChange: this.handleSortingChange
        }}
      />
    );
  }
}
```

## Sort State Persistence

### Saving to localStorage

```typescript
import { createGrid } from '@ac-grid/core';

const gridElement = createGrid({
  data,
  columns,
  sorting: {
    onSortingChange: (sorting) => {
      // Save to localStorage
      localStorage.setItem('gridSorting', JSON.stringify(sorting));
    }
  }
});

// Restore sort state on page load
const savedSorting = localStorage.getItem('gridSorting');
if (savedSorting) {
  const sorting = JSON.parse(savedSorting);
  (gridElement as any).setSorting(sorting);
}
```

## Advanced Usage

### Sorting Configuration Options

```typescript
interface GridSortingConfig {
  /** Enable sorting (default: true) */
  enabled?: boolean;
  /** Allow multi-column sorting (default: true) */
  multiColumn?: boolean;
  /** Initial sort state */
  initialState?: SortingState;
  /** Sort state change callback */
  onSortingChange?: (sorting: SortingState) => void;
}
```

### Column Definition Sorting Options

```typescript
interface ColumnDef<TData> {
  /** Enable sorting (default: true) */
  enableSorting?: boolean;
  /** Custom sorting function */
  sortingFn?: SortingFn<TData>;
  /** Descending first when sorting (default: false, ascending first) */
  sortDescFirst?: boolean;
  /** Invert sort order (default: false) */
  invertSorting?: boolean;
}
```

## FAQ

### Q: How to disable global sorting?

A: Currently, you need to set `enableSorting: false` in each column definition. Future versions may add a global configuration option.

### Q: Does sorting affect original data?

A: No. Sorting only affects display order and does not modify the original data array.

### Q: How to implement server-side sorting?

A: The current version only supports client-side sorting. Server-side sorting will be considered in future versions. You can get the sort state via the `onSortingChange` callback and send it to the server.

### Q: What is the sorting performance?

A: AC Grid uses `@tanstack/table-core`'s optimized sorting algorithm. For 10K rows, sorting time is typically < 50ms.

### Q: How to customize sort indicator styles?

A: Sort indicators use the CSS class `.sort-indicator`. You can customize the appearance by overriding styles.

## Related Resources

- [RFC-0002: Sorting Feature](../../../../docs/rfc/completed/0002-sorting-feature.md)
- [@tanstack/table-core Sorting Docs](https://tanstack.com/table/latest/docs/guide/sorting)
- [ag-Grid Sorting Docs](https://www.ag-grid.com/javascript-data-grid/row-sorting/)
