/// <reference types="vitest" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import type { ExpandedState, Row } from "@tanstack/table-core";
import { createGrid } from "../src/utils/create-grid";
import "../src/components/Grid.wsx";

const GRID_TAG_NAME = "wsx-ac-grid";
const GROUP_ROW_SELECTOR = ".grid-row-grouped";
const DEPARTMENT_COLUMN_ID = "department";
const ROLE_COLUMN_ID = "role";
const PERFORMANCE_ROW_COUNT = 10_000;
const PERFORMANCE_GROUP_COUNT = 100;
const GROUPING_BUDGET_MS = 100;
const EXPANSION_BUDGET_MS = 16;
const IS_COVERAGE_RUN = process.env.npm_lifecycle_event === "test:coverage";

interface Employee {
    department: string;
    role: string;
    salary: number;
    score: number;
}

const EMPLOYEES: Employee[] = [
    { department: "Engineering", role: "Developer", salary: 100, score: 4 },
    { department: "Engineering", role: "Developer", salary: 200, score: 8 },
    { department: "Sales", role: "Manager", salary: 150, score: 6 },
];

const createPerformanceData = (): Employee[] =>
    Array.from({ length: PERFORMANCE_ROW_COUNT }, (_, index) => ({
        department: `Department ${index % PERFORMANCE_GROUP_COUNT}`,
        role: `Role ${index % 10}`,
        salary: index,
        score: index,
    }));

const createGroupingGrid = (
    grouping: string[],
    initialExpanded: ExpandedState = {},
    columns: Array<Record<string, unknown>> = [
        { accessorKey: DEPARTMENT_COLUMN_ID, header: "Department" },
        { accessorKey: ROLE_COLUMN_ID, header: "Role" },
        { accessorKey: "salary", header: "Salary", aggregationFn: "sum" },
    ],
) => {
    const grid = document.createElement(GRID_TAG_NAME) as any;
    grid.data = EMPLOYEES;
    grid.columns = columns;
    grid.groupingConfig = {
        enabled: true,
        initialGrouping: grouping,
        initialExpanded,
    };
    return grid;
};

describe("Grid grouping and aggregation", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it("renders one collapsed group row per value for single-column grouping", async () => {
        const grid = createGroupingGrid([DEPARTMENT_COLUMN_ID]);
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const groupRows = root.querySelectorAll(GROUP_ROW_SELECTOR);
            expect(groupRows).toHaveLength(2);
            expect(root.querySelectorAll(".grid-row")).toHaveLength(2);
            expect(root.textContent).toContain("Engineering");
            expect(root.textContent).toContain("Sales");
        });
    });

    it("configures grouping through createGrid", () => {
        const groupingConfig = {
            enabled: true,
            initialGrouping: [DEPARTMENT_COLUMN_ID],
        };
        const grid = createGrid({
            data: EMPLOYEES,
            columns: [
                { accessorKey: DEPARTMENT_COLUMN_ID, header: "Department" },
            ],
            grouping: groupingConfig,
        }) as any;

        expect(grid.groupingConfig).toBe(groupingConfig);
    });

    it("renders nested groups for multi-column grouping", async () => {
        const grid = createGroupingGrid(
            [DEPARTMENT_COLUMN_ID, ROLE_COLUMN_ID],
            true,
        );
        container.appendChild(grid);

        await waitFor(() => {
            const topLevelGroups = grid.table.getGroupedRowModel().rows;
            const nestedGroups = topLevelGroups.flatMap(
                (row: Row<Employee>) => row.subRows,
            );
            expect(
                topLevelGroups.map((row: Row<Employee>) => row.depth),
            ).toEqual([0, 0]);
            expect(nestedGroups.map((row: Row<Employee>) => row.depth)).toEqual(
                [1, 1],
            );
            expect(grid.table.getExpandedRowModel().rows).toHaveLength(7);
            const root = grid.shadowRoot || grid;
            const groupRows = root.querySelectorAll(GROUP_ROW_SELECTOR);
            expect(groupRows[0].textContent).toContain("(2)");
        });
    });

    it("renders aggregate values in group rows", async () => {
        const grid = createGroupingGrid([DEPARTMENT_COLUMN_ID]);
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const groupRows = Array.from(
                root.querySelectorAll(GROUP_ROW_SELECTOR),
            );
            expect(groupRows[0].textContent).toContain("300");
            expect(groupRows[1].textContent).toContain("150");
        });
    });

    it("supports setGrouping, toggleGroup, expandAll, and collapseAll", async () => {
        const onGroupingChange = vi.fn();
        const onExpandedChange = vi.fn();
        const grid = createGroupingGrid([]);
        grid.groupingConfig = {
            enabled: true,
            onGroupingChange,
            onExpandedChange,
        };
        container.appendChild(grid);

        await waitFor(() => expect(grid.table).toBeTruthy());

        grid.setGrouping([DEPARTMENT_COLUMN_ID]);
        expect(onGroupingChange).toHaveBeenLastCalledWith([
            DEPARTMENT_COLUMN_ID,
        ]);

        grid.expandAll();
        expect(grid.table.getState().expanded).toBe(true);

        const [engineeringGroup, salesGroup] =
            grid.table.getGroupedRowModel().rows;
        grid.toggleGroup(engineeringGroup.id, false);
        expect(grid.table.getRow(engineeringGroup.id).getIsExpanded()).toBe(
            false,
        );
        expect(grid.table.getRow(salesGroup.id).getIsExpanded()).toBe(true);

        grid.toggleGroup(engineeringGroup.id);
        expect(grid.table.getRow(engineeringGroup.id).getIsExpanded()).toBe(
            true,
        );

        grid.collapseAll();
        expect(grid.table.getState().expanded).toEqual({});
        expect(onExpandedChange).toHaveBeenCalled();
    });

    it.each([
        ["sum", 450],
        ["avg", 150],
        ["count", 3],
        ["min", 100],
        ["max", 200],
    ])("calculates the %s aggregation", async (aggregationFn, expected) => {
        const grid = createGroupingGrid([DEPARTMENT_COLUMN_ID], {}, [
            { accessorKey: DEPARTMENT_COLUMN_ID, header: "Department" },
            {
                accessorKey: "salary",
                header: "Salary",
                aggregationFn,
            },
        ]);
        grid.data = EMPLOYEES.map((employee) => ({
            ...employee,
            department: "All",
        }));
        container.appendChild(grid);

        await waitFor(() => {
            const [groupRow] = grid.table.getGroupedRowModel().rows;
            expect(groupRow.getValue("salary")).toBe(expected);
        });
    });

    it("passes leaf values to a custom aggregation function", async () => {
        const customAggregation = vi.fn((values: unknown[]) =>
            values.join(":"),
        );
        const grid = createGroupingGrid([DEPARTMENT_COLUMN_ID], {}, [
            { accessorKey: DEPARTMENT_COLUMN_ID, header: "Department" },
            {
                accessorKey: "score",
                header: "Score",
                aggregationFn: customAggregation,
            },
        ]);
        container.appendChild(grid);

        await waitFor(() => {
            const [engineeringGroup] = grid.table.getGroupedRowModel().rows;
            expect(engineeringGroup.getValue("score")).toBe("4:8");
            expect(customAggregation).toHaveBeenCalledWith([4, 8]);
        });
    });

    it("preserves TanStack aggregation function semantics", async () => {
        let receivedArguments: unknown[] = [];
        const tanStackAggregation = (
            columnId: string,
            leafRows: Row<Employee>[],
            childRows: Row<Employee>[],
        ) => {
            receivedArguments = [columnId, leafRows, childRows];
            return leafRows.reduce(
                (total, row) => total + row.getValue<number>(columnId),
                0,
            );
        };
        const grid = createGroupingGrid([DEPARTMENT_COLUMN_ID], {}, [
            { accessorKey: DEPARTMENT_COLUMN_ID, header: "Department" },
            {
                accessorKey: "salary",
                header: "Salary",
                aggregationFn: tanStackAggregation,
            },
        ]);
        container.appendChild(grid);

        await waitFor(() => {
            const [engineeringGroup] = grid.table.getGroupedRowModel().rows;
            expect(engineeringGroup.getValue("salary")).toBe(300);
            expect(receivedArguments).toEqual([
                "salary",
                expect.any(Array),
                expect.any(Array),
            ]);
        });
    });

    it.skipIf(IS_COVERAGE_RUN)(
        "groups 10K rows within the RFC performance budget",
        () => {
            const grid = createGroupingGrid([]);
            grid.data = createPerformanceData();

            const startedAt = performance.now();
            grid.setGrouping([DEPARTMENT_COLUMN_ID]);
            expect(grid.table.getGroupedRowModel().rows).toHaveLength(
                PERFORMANCE_GROUP_COUNT,
            );
            const duration = performance.now() - startedAt;

            expect(duration).toBeLessThan(GROUPING_BUDGET_MS);
        },
    );

    it("updates expand and collapse state within the RFC performance budget", async () => {
        const grid = createGroupingGrid([DEPARTMENT_COLUMN_ID]);
        grid.data = createPerformanceData();
        container.appendChild(grid);
        await waitFor(() => expect(grid.table).toBeTruthy());
        expect(grid.table.getGroupedRowModel().rows).toHaveLength(
            PERFORMANCE_GROUP_COUNT,
        );

        const expandStartedAt = performance.now();
        grid.expandAll();
        const expandDuration = performance.now() - expandStartedAt;

        const collapseStartedAt = performance.now();
        grid.collapseAll();
        const collapseDuration = performance.now() - collapseStartedAt;

        expect(expandDuration).toBeLessThan(EXPANSION_BUDGET_MS);
        expect(collapseDuration).toBeLessThan(EXPANSION_BUDGET_MS);
    });
});
