---
title: Accessibility
order: 4
category: guide/features
description: "Accessible names, screen-reader semantics, and focus visibility in AC Grid"
---

# Accessibility

AC Grid exposes its table as an ARIA grid with row, column-header, and cell semantics. Give each grid a useful name so screen-reader users can identify it.

```typescript
const grid = createGrid({
  data,
  columns: [
    {
      accessorKey: "name",
      header: "Name",
      ariaLabel: "Employee name",
      ariaDescription: "The employee's preferred name",
    },
  ],
  ariaLabel: "Employee directory",
  ariaDescription: "Current employees and their contact details",
});
```

`ariaLabel` and `ariaDescription` can also be assigned as properties on `<wsx-ac-grid>`. Column accessible names default to the text header (or the column ID when the header is not plain text); `ariaLabel` and `ariaDescription` on a column override that fallback. Row and cell indexes, sort direction, grouping expansion, and row selection are reflected in ARIA attributes.

Keyboard movement is documented with the keyboard navigation feature. AC Grid keeps focus indicators visible and uses the system highlight color in forced-colors mode. These semantics and styles support accessible use, but do not by themselves establish WCAG 2.1 AA conformance; validate the complete application with keyboard and assistive technology.
