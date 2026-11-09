import type { GridState, GridStatePatch } from "../types/grid-state";

export const DEFAULT_GRID_STATE: GridState = {
  stateVersion: 1,
  columnSizing: {},
  columnOrder: [],
  sorting: [],
  columnFilters: {},
  globalFilter: "",
  pagination: { pageIndex: 0, pageSize: 10 },
  scrollTop: 0,
};

export function normalizeGridState(value: unknown): GridState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Record<string, unknown>;
  if (state.stateVersion !== 1) return null;
  return buildGridState(state);
}

function buildGridState(state: Record<string, unknown>): GridState {
  return {
    ...DEFAULT_GRID_STATE,
    columnSizing: isNumberRecord(state.columnSizing) ? state.columnSizing : {},
    columnOrder: Array.isArray(state.columnOrder)
      ? state.columnOrder.filter((id): id is string => typeof id === "string")
      : [],
    sorting: Array.isArray(state.sorting) ? state.sorting as GridState["sorting"] : [],
    columnFilters: isRecord(state.columnFilters) ? state.columnFilters as GridState["columnFilters"] : {},
    globalFilter: typeof state.globalFilter === "string" ? state.globalFilter : "",
    pagination: isRecord(state.pagination)
      && Number.isInteger(state.pagination.pageIndex)
      && Number.isInteger(state.pagination.pageSize)
      && (state.pagination.pageIndex as number) >= 0
      && (state.pagination.pageSize as number) > 0
      ? {
          pageIndex: state.pagination.pageIndex as number,
          pageSize: state.pagination.pageSize as number,
        }
      : DEFAULT_GRID_STATE.pagination,
    scrollTop: typeof state.scrollTop === "number" && Number.isFinite(state.scrollTop)
      ? Math.max(0, state.scrollTop)
      : 0,
  };
}

export function mergeGridState(current: GridState, patch: GridStatePatch): GridState {
  const { stateVersion: _version, ...updates } = patch;
  return buildGridState({ ...current, ...updates });
}

export function deserializeGridState(serialized: string | null): GridState | null {
  if (serialized === null) return null;
  try {
    return normalizeGridState(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export function serializeGridState(state: GridState): string {
  return JSON.stringify(state);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every(
    (item) => typeof item === "number" && Number.isFinite(item) && item > 0,
  );
}
