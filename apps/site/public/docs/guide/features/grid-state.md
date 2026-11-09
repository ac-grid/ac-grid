# Grid state

Grid exposes `getState`, `setState`, and `resetState` on the element returned by `createGrid`. The versioned state includes column widths and order, sorting, filters, pagination, and vertical scroll position.

```ts
const grid = createGrid({ data, columns });

const saved = grid.getState();
grid.setState({ sorting: [{ id: "name", desc: false }] });
grid.resetState(["sorting"]);
```

Pass partial state to `setState`; omitted fields keep their current values. `getState()` returns a snapshot with `stateVersion: 1` suitable for JSON serialization.

## Persistence

Provide a storage implementation and key to restore state when the grid connects and save state as it changes:

```ts
const grid = createGrid({
  data,
  columns,
  persistState: { key: "people-grid", storage: window.localStorage },
});
```

The storage object implements `getItem`, `setItem`, and `removeItem`. If omitted, the grid uses browser `localStorage` when available. Invalid JSON and unsupported state versions are ignored. Storage errors do not prevent the grid from working in memory.
