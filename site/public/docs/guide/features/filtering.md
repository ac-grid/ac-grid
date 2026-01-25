---
title: Filtering
order: 2
category: guide/features
description: "Learn how to use filtering functionality in AC Grid, including column filtering, global search, and custom filter functions"
---

# Filtering

AC Grid provides powerful filtering capabilities that allow users to quickly find and filter table data.

## Quick Start

Filtering allows users to quickly find and filter table data.

```typescript
import '@ac-grid/core';

const columns = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'age', accessorKey: 'age', header: 'Age' },
  { id: 'email', accessorKey: 'email', header: 'Email' }
];

// Enable filtering
<wsx-ac-grid 
  data={data} 
  columns={columns}
  enableFiltering={true}
/>
```

## Basic Usage

### Enabling Filtering

```typescript
const gridElement = createGrid({
  data,
  columns,
  enableFiltering: true,  // Enable filtering
});
```

### Disabling Column Filtering

```typescript
const columns = [
  { 
    id: 'actions', 
    header: 'Actions',
    enableColumnFilter: false  // Disable filtering for this column
  }
];
```

## Column Filtering

### User Interaction

Users can click the filter icon in column headers to input filter conditions. The table automatically filters to show matching rows.

### Filter Types

AC Grid supports multiple filter types:

- **text**: Text filtering (default)
- **number**: Number filtering
- **date**: Date filtering
- **custom**: Custom filter function

### Code Example

```typescript
const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterType: 'text',  // Use built-in text filtering
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    filterType: 'number',  // Use built-in number filtering
  },
  {
    id: 'createdAt',
    header: 'Created At',
    accessorKey: 'createdAt',
    filterType: 'date',  // Use built-in date filtering
  }
];
```

## Global Search

### How to Use

Global search searches across all columns for matching data.

```typescript
import { createGrid } from '@ac-grid/core';

const gridElement = createGrid({
  data,
  columns,
  enableFiltering: true,
});

// Set global search
(gridElement as any).setGlobalFilter('search term');
```

### Code Example

```typescript
// Using in wsxjs components
@autoRegister({ tagName: 'my-app' })
export class App extends LightComponent {
  @state private globalFilter: string = '';

  private handleSearch = (value: string) => {
    this.globalFilter = value;
    const grid = this.querySelector('wsx-ac-grid') as any;
    grid?.setGlobalFilter(value);
  };

  render() {
    return (
      <div>
        <input 
          type="text" 
          placeholder="Global search..."
          onInput={(e) => this.handleSearch((e.target as HTMLInputElement).value)}
        />
        <wsx-ac-grid data={this.data} columns={this.columns} />
      </div>
    );
  }
}
```

## Custom Filter Functions

Developers can customize filtering in multiple ways to meet different business requirements.

### 1. Custom Filter Function (filterFn)

The most flexible approach is to provide a custom filter function with complete control over filter logic.

#### Basic Custom Filtering

```typescript
import type { ColumnDef, Row } from '@ac-grid/core';

interface Person {
  id: string;
  name: string;
  email: string;
  age: number;
  department: string;
}

const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    // Custom filter function: case-insensitive contains match
    filterFn: (row: Row<Person>, columnId: string, filterValue: string) => {
      const value = row.getValue(columnId) as string;
      return value.toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

#### Advanced Custom Filtering Examples

**Example 1: Chinese Pinyin Search**
```typescript
// Requires pinyin library: npm install pinyin
import pinyin from 'pinyin';

const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterFn: (row, columnId, filterValue) => {
      const name = row.getValue(columnId) as string;
      // Convert to pinyin for search
      const namePinyin = pinyin(name, { style: pinyin.STYLE_NORMAL }).join('');
      const filterPinyin = pinyin(filterValue, { style: pinyin.STYLE_NORMAL }).join('');
      return namePinyin.includes(filterPinyin) || name.includes(filterValue);
    }
  }
];
```

**Example 2: Number Range Filtering**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    filterType: 'number',
    filterFn: (row, columnId, filterValue) => {
      const age = row.getValue(columnId) as number;
      // Support range filtering, e.g., "18-30" or ">50" or "<25"
      if (filterValue.includes('-')) {
        const [min, max] = filterValue.split('-').map(Number);
        return age >= min && age <= max;
      } else if (filterValue.startsWith('>')) {
        return age > Number(filterValue.slice(1));
      } else if (filterValue.startsWith('<')) {
        return age < Number(filterValue.slice(1));
      } else {
        return age === Number(filterValue);
      }
    }
  }
];
```

**Example 3: Date Range Filtering**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'createdAt',
    header: 'Created At',
    accessorKey: 'createdAt',
    filterType: 'date',
    filterFn: (row, columnId, filterValue) => {
      const date = new Date(row.getValue(columnId) as string);
      // Support date range, e.g., "2024-01-01,2024-12-31"
      if (filterValue.includes(',')) {
        const [start, end] = filterValue.split(',').map(d => new Date(d));
        return date >= start && date <= end;
      } else {
        const filterDate = new Date(filterValue);
        return date.toDateString() === filterDate.toDateString();
      }
    }
  }
];
```

**Example 4: Multi-Value Filtering (Comma-Separated)**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    filterFn: (row, columnId, filterValue) => {
      const dept = row.getValue(columnId) as string;
      // Support multiple values, comma-separated, e.g., "Engineering,Marketing"
      const filterValues = filterValue.split(',').map(v => v.trim());
      return filterValues.some(value => dept.toLowerCase().includes(value.toLowerCase()));
    }
  }
];
```

**Example 5: Regular Expression Filtering**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    filterFn: (row, columnId, filterValue) => {
      const email = row.getValue(columnId) as string;
      try {
        // If input is a regex, use regex matching
        const regex = new RegExp(filterValue, 'i');
        return regex.test(email);
      } catch {
        // If not a valid regex, use normal string matching
        return email.toLowerCase().includes(filterValue.toLowerCase());
      }
    }
  }
];
```

**Example 6: Fuzzy Matching (Levenshtein Distance)**
```typescript
// Requires fast-levenshtein: npm install fast-levenshtein
import levenshtein from 'fast-levenshtein';

const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterFn: (row, columnId, filterValue) => {
      const name = row.getValue(columnId) as string;
      // Allow up to 2 character differences (typo tolerance)
      const distance = levenshtein.get(name.toLowerCase(), filterValue.toLowerCase());
      return distance <= 2 || name.toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

### 2. Using Built-in Filter Types

AC Grid provides built-in filter types to simplify common scenarios.

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterType: 'text',  // Use built-in text filtering
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    filterType: 'number',  // Use built-in number filtering
  },
  {
    id: 'createdAt',
    header: 'Created At',
    accessorKey: 'createdAt',
    filterType: 'date',  // Use built-in date filtering
  }
];
```

### 3. Combining Custom and Built-in Filters

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterType: 'text',  // Specify type, but can override default behavior
    filterFn: (row, columnId, filterValue) => {
      // Custom logic: support initial letter search
      const name = row.getValue(columnId) as string;
      const initials = name.split(' ').map(n => n[0]).join('');
      return name.toLowerCase().includes(filterValue.toLowerCase()) ||
             initials.toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

## Programmatic Filtering

### Setting Column Filters

```typescript
import { createGrid } from '@ac-grid/core';

const gridElement = createGrid({
  data,
  columns,
  enableFiltering: true,
});

// Set column filters
(gridElement as any).setColumnFilter('name', 'John');
(gridElement as any).setColumnFilter('age', '>25');
```

### Setting Global Filter

```typescript
(gridElement as any).setGlobalFilter('search term');
```

### Getting Current Filter State

```typescript
const filterState = (gridElement as any).getFilterState();
console.log(filterState);
// {
//   globalFilter: 'search term',
//   columnFilters: { name: 'John', age: '>25' }
// }
```

### Clearing All Filters

```typescript
(gridElement as any).clearFilters();
```

### Using in wsxjs Components

```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, state, autoRegister } from '@wsxjs/wsx-core';
import type { FilterState } from '@ac-grid/core';

@autoRegister({ tagName: 'my-app' })
export class App extends LightComponent {
  @state private filterState: FilterState = {
    columnFilters: {}
  };

  private handleFilterChange = (newFilterState: FilterState) => {
    this.filterState = newFilterState;
    console.log('Filter updated:', newFilterState);
  };

  render() {
    return (
      <wsx-ac-grid 
        data={this.data} 
        columns={this.columns}
        enableFiltering={true}
        filtering={{
          onFilterChange: this.handleFilterChange
        }}
      />
    );
  }
}
```

## Filter State Persistence

### Saving to localStorage

```typescript
import { createGrid } from '@ac-grid/core';

const gridElement = createGrid({
  data,
  columns,
  enableFiltering: true,
  filtering: {
    onFilterChange: (filterState) => {
      // Save to localStorage
      localStorage.setItem('gridFilters', JSON.stringify(filterState));
    }
  }
});

// Restore filter state on page load
const savedFilters = localStorage.getItem('gridFilters');
if (savedFilters) {
  const filterState = JSON.parse(savedFilters);
  if (filterState.globalFilter) {
    (gridElement as any).setGlobalFilter(filterState.globalFilter);
  }
  Object.entries(filterState.columnFilters).forEach(([columnId, value]) => {
    (gridElement as any).setColumnFilter(columnId, value as string);
  });
}
```

## Advanced Usage

### Filter Configuration Options

```typescript
interface GridOptions {
  // Enable filtering
  enableFiltering?: boolean;
  // Global search
  globalFilter?: string;
  // Column filter configuration
  columnFilters?: Record<string, string>;
}
```

### Column Definition Filter Options

```typescript
interface ColumnDef<TData> {
  // Enable filtering
  enableColumnFilter?: boolean;
  // Custom filter function
  filterFn?: (row: Row<TData>, columnId: string, filterValue: any) => boolean;
  // Filter type
  filterType?: 'text' | 'number' | 'date' | 'custom';
}
```

### Performance Optimization

For large datasets, use early returns in custom filter functions:

```typescript
filterFn: (row, columnId, filterValue) => {
  if (!filterValue) return true;  // No filter value, show all
  const value = row.getValue(columnId);
  // ... filter logic
}
```

### Reusable Filter Functions

```typescript
// utils/filters.ts
export const caseInsensitiveFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string
): boolean => {
  const value = String(row.getValue(columnId)).toLowerCase();
  return value.includes(filterValue.toLowerCase());
};

// Usage
const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    filterFn: caseInsensitiveFilter
  }
];
```

## FAQ

### Q: Does filtering affect original data?

A: No. Filtering only affects displayed data and does not modify the original data array.

### Q: How to implement server-side filtering?

A: The current version only supports client-side filtering. Server-side filtering will be considered in future versions. You can get the filter state via the `onFilterChange` callback and send it to the server.

### Q: What is the filtering performance?

A: AC Grid uses `@tanstack/table-core`'s optimized filtering algorithm. For 10K rows, filtering time is typically < 50ms.

### Q: How to customize filter UI?

A: Filter UI can be customized via CSS. Future versions may provide more flexible UI customization options.

### Q: Can filtering and sorting be used together?

A: Yes. Filtering and sorting are independent and can be used together. Filter first, then sort.

## Related Resources

- [RFC-0003: Filtering Feature](../../../../docs/rfc/0003-filtering-feature.md)
- [@tanstack/table-core Filtering Docs](https://tanstack.com/table/latest/docs/guide/filters)
- [ag-Grid Filtering Docs](https://www.ag-grid.com/javascript-data-grid/filtering/)
