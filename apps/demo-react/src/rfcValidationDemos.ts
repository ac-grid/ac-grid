import type { CreateGridOptions } from "@ac-grid/core";
import type { ColumnDef } from "@tanstack/react-table";

import type { Person } from "./stories/makeData";

/** Multica `done` RFCs — manual validation order on demo-react (5174) */
export const RFC_VALIDATION_ORDER = [
    "0002",
    "0003",
    "0004",
    "0005",
    "0006",
    "0007",
    "0008",
    "0009",
] as const;

export type RfcValidationId = (typeof RFC_VALIDATION_ORDER)[number];

export const DEFAULT_RFC_ID: RfcValidationId = "0003";

export type GridHostElement = HTMLElement & {
    setGlobalFilter?: (value: string) => void;
    clearFilters?: () => void;
    editingConfig?: unknown;
};

export interface RfcValidationSpec {
    id: RfcValidationId;
    title: string;
    multicaIssue: string;
    hint: string;
    rowCount: number;
    showGlobalSearch: boolean;
    columns: ColumnDef<Person>[];
    buildOptions: (
        data: Person[],
        columns: ColumnDef<Person>[],
    ) => CreateGridOptions<Person>;
    afterMount?: (grid: GridHostElement) => void;
}

const PERSON_COLUMNS: ColumnDef<Person>[] = [
    {
        accessorKey: "firstName",
        id: "firstName",
        header: "First Name",
        size: 150,
        filterType: "text",
        enableSorting: true,
    },
    {
        accessorKey: "lastName",
        id: "lastName",
        header: "Last Name",
        size: 150,
        filterType: "text",
        enableSorting: true,
    },
    {
        accessorKey: "age",
        id: "age",
        header: "Age",
        size: 100,
        filterType: "number",
        enableSorting: true,
    },
    {
        accessorKey: "status",
        id: "status",
        header: "Status",
        size: 150,
        filterType: "text",
        enableSorting: true,
    },
    {
        accessorKey: "progress",
        id: "progress",
        header: "Progress",
        size: 120,
        filterType: "number",
    },
];

export const RFC_VALIDATION_SPECS: Record<RfcValidationId, RfcValidationSpec> = {
    "0002": {
        id: "0002",
        title: "Sorting",
        multicaIssue: "ACG-5",
        hint: "点击列头排序。Shift+点击多列排序。",
        rowCount: 50,
        showGlobalSearch: false,
        columns: PERSON_COLUMNS.slice(0, 4),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            sorting: { enabled: true },
        }),
    },
    "0003": {
        id: "0003",
        title: "Filtering",
        multicaIssue: "ACG-6",
        hint: "下方全局搜索，或点表头漏斗图标打开列过滤弹窗。",
        rowCount: 50,
        showGlobalSearch: true,
        columns: PERSON_COLUMNS.slice(0, 4),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            filtering: { enabled: true },
        }),
    },
    "0004": {
        id: "0004",
        title: "Column resizing",
        multicaIssue: "ACG-7",
        hint: "拖动列边框调整宽度；双击边框可自动适应内容。",
        rowCount: 50,
        showGlobalSearch: false,
        columns: PERSON_COLUMNS.slice(0, 4),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            resizing: {
                enabled: true,
                defaultColumnWidth: 150,
                minColumnWidth: 60,
            },
        }),
    },
    "0005": {
        id: "0005",
        title: "Virtual scrolling",
        multicaIssue: "ACG-8",
        hint: "10,000 行虚拟滚动；快速滚动应流畅，DOM 行数保持较少。",
        rowCount: 10_000,
        showGlobalSearch: false,
        columns: PERSON_COLUMNS.slice(0, 3),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            virtualization: {
                enabled: true,
                rowHeight: 35,
                overscan: 5,
            },
        }),
    },
    "0006": {
        id: "0006",
        title: "Pagination",
        multicaIssue: "ACG-9",
        hint: "使用底部分页控件切换页码、修改每页条数。",
        rowCount: 200,
        showGlobalSearch: false,
        columns: PERSON_COLUMNS.slice(0, 4),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            pagination: {
                enabled: true,
                pageSize: 20,
                pageSizeOptions: [10, 20, 50],
            },
        }),
    },
    "0007": {
        id: "0007",
        title: "Row selection",
        multicaIssue: "ACG-10",
        hint: "勾选行复选框；表头复选框全选当前页。",
        rowCount: 50,
        showGlobalSearch: false,
        columns: PERSON_COLUMNS.slice(0, 4),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            selection: {
                enabled: true,
                mode: "multiple",
                enableCheckbox: true,
            },
        }),
    },
    "0008": {
        id: "0008",
        title: "Column pinning",
        multicaIssue: "ACG-11",
        hint: "左右滚动时 First Name 固定左侧，Progress 固定右侧。",
        rowCount: 50,
        showGlobalSearch: false,
        columns: [
            ...PERSON_COLUMNS,
            {
                id: "visits",
                accessorKey: "visits",
                header: "Visits",
                size: 120,
            },
            {
                id: "email",
                accessorFn: (row) => `${row.firstName.toLowerCase()}@example.com`,
                header: "Email",
                size: 220,
            },
        ],
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
            pinning: {
                enabled: true,
                initialState: {
                    left: ["selection", "firstName"],
                    right: ["progress"],
                },
            },
            selection: {
                enabled: true,
                mode: "multiple",
                enableCheckbox: true,
            },
        }),
    },
    "0009": {
        id: "0009",
        title: "Cell editing",
        multicaIssue: "ACG-12",
        hint: "双击单元格进入编辑；Enter 保存，Esc 取消。",
        rowCount: 50,
        showGlobalSearch: false,
        columns: PERSON_COLUMNS.slice(0, 4),
        buildOptions: (data, columns) => ({
            data,
            columns,
            className: "h-full w-full",
        }),
        afterMount: (grid) => {
            grid.editingConfig = {
                enabled: true,
                mode: "doubleClick",
            };
        },
    },
};

export function parseRfcIdFromUrl(search: string): RfcValidationId {
    const raw = new URLSearchParams(search).get("rfc");
    if (raw && RFC_VALIDATION_ORDER.includes(raw as RfcValidationId)) {
        return raw as RfcValidationId;
    }
    return DEFAULT_RFC_ID;
}

export function getAdjacentRfcId(
    current: RfcValidationId,
    direction: "prev" | "next",
): RfcValidationId | null {
    const index = RFC_VALIDATION_ORDER.indexOf(current);
    if (index < 0) {
        return null;
    }
    const nextIndex = direction === "prev" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= RFC_VALIDATION_ORDER.length) {
        return null;
    }
    return RFC_VALIDATION_ORDER[nextIndex];
}
