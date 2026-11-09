import type { PaginationState, SortingState } from "@tanstack/table-core";
import type { FilterCondition } from "./filtering";

export interface GridState {
  stateVersion: 1;
  columnSizing: Record<string, number>;
  columnOrder: string[];
  sorting: SortingState;
  columnFilters: Record<string, FilterCondition | string>;
  globalFilter: string;
  pagination: PaginationState;
  scrollTop: number;
}

export type GridStatePatch = Partial<Omit<GridState, "stateVersion">> &
  Pick<Partial<GridState>, "stateVersion">;

export type GridStateKey = keyof GridState;

export interface GridStateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface GridStatePersistence {
  key: string;
  storage?: GridStateStorage;
}
