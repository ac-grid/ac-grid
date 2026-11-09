import { describe, expect, it } from "vitest";
import { syncGridProperties } from "../src/utils/framework-bindings";

describe("syncGridProperties", () => {
  it("assigns object properties without replacing the element", () => {
    const element = {
      data: [],
      columns: [],
      sortingConfig: undefined,
    } as unknown as HTMLElement & {
      data: unknown;
      columns: unknown;
      sortingConfig: unknown;
    };
    const data = [{ userId: "row-1", name: "Ada" }];
    const columns = [{ accessorKey: "name" }];
    const sortingConfig = { enabled: true };

    syncGridProperties(element, {
      data,
      columns,
      gridProps: { sortingConfig },
    });

    expect(element.data).toBe(data);
    expect(element.columns).toBe(columns);
    expect(element.sortingConfig).toBe(sortingConfig);
  });

  it("gives data and columns precedence over conflicting gridProps", () => {
    const element = {} as HTMLElement & { data?: unknown; columns?: unknown };
    const data = [{ userId: "row-1" }];
    const columns = [{ accessorKey: "userId" }];

    syncGridProperties(element, {
      data,
      columns,
      gridProps: { data: [], columns: [] },
    });

    expect(element.data).toBe(data);
    expect(element.columns).toBe(columns);
  });
});
