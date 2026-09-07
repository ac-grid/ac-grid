import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
    AGGREGATION_FN_AVG,
    AGGREGATION_FN_COUNT,
    AGGREGATION_FN_SUM,
    createGrid,
    type ColumnDef,
} from "@ac-grid/core";

const DEPARTMENT_COLUMN_ID = "department";
const ROLE_COLUMN_ID = "role";
const EMPLOYEE_COLUMN_ID = "employee";
const SALARY_COLUMN_ID = "salary";
const GROUPING_STORY_HEIGHT = 420;

interface Employee {
    userId: string;
    department: string;
    role: string;
    employee: string;
    salary: number;
}

interface GroupingGridElement extends HTMLElement {
    collapseAll(): void;
    expandAll(): void;
}

interface GroupingAggregationDemoProps {
    grouping: string[];
}

const EMPLOYEES: Employee[] = [
    {
        userId: "ada",
        department: "Engineering",
        role: "Developer",
        employee: "Ada",
        salary: 148000,
    },
    {
        userId: "linus",
        department: "Engineering",
        role: "Developer",
        employee: "Linus",
        salary: 152000,
    },
    {
        userId: "margaret",
        department: "Engineering",
        role: "Manager",
        employee: "Margaret",
        salary: 172000,
    },
    {
        userId: "grace",
        department: "Sales",
        role: "Representative",
        employee: "Grace",
        salary: 98000,
    },
    {
        userId: "ken",
        department: "Sales",
        role: "Manager",
        employee: "Ken",
        salary: 126000,
    },
];

const COLUMNS: ColumnDef<Employee>[] = [
    {
        accessorKey: DEPARTMENT_COLUMN_ID,
        header: "Department",
        enableGrouping: true,
    },
    {
        accessorKey: ROLE_COLUMN_ID,
        header: "Role",
        enableGrouping: true,
    },
    {
        accessorKey: EMPLOYEE_COLUMN_ID,
        header: "Employee",
        aggregationFn: AGGREGATION_FN_COUNT,
        aggregatedCell: ({ getValue }) => `${getValue<number>()} employees`,
    },
    {
        accessorKey: SALARY_COLUMN_ID,
        header: "Salary total",
        aggregationFn: AGGREGATION_FN_SUM,
        aggregatedCell: ({ getValue }) =>
            `$${getValue<number>().toLocaleString()}`,
    },
    {
        id: "averageSalary",
        accessorFn: (employee) => employee.salary,
        header: "Salary average",
        aggregationFn: AGGREGATION_FN_AVG,
        aggregatedCell: ({ getValue }) =>
            `$${Math.round(getValue<number>()).toLocaleString()}`,
    },
];

const GroupingAggregationDemo = ({
    grouping,
}: GroupingAggregationDemoProps) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<GroupingGridElement | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }

        const grid = createGrid({
            data: EMPLOYEES,
            columns: COLUMNS,
            grouping: {
                enabled: true,
                initialGrouping: grouping,
                initialExpanded: true,
            },
        }) as GroupingGridElement;
        grid.style.height = `${GROUPING_STORY_HEIGHT}px`;
        gridRef.current = grid;
        host.replaceChildren(grid);

        return () => {
            host.replaceChildren();
            gridRef.current = null;
        };
    }, [grouping]);

    return (
        <section style={{ width: "min(1100px, 95vw)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                    type="button"
                    onClick={() => gridRef.current?.expandAll()}
                >
                    Expand all
                </button>
                <button
                    type="button"
                    onClick={() => gridRef.current?.collapseAll()}
                >
                    Collapse all
                </button>
            </div>
            <div ref={hostRef} />
        </section>
    );
};

const meta = {
    title: "AC Grid/Grouping and aggregation",
    component: GroupingAggregationDemo,
    parameters: {
        layout: "centered",
    },
} satisfies Meta<typeof GroupingAggregationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleColumn: Story = {
    args: {
        grouping: [DEPARTMENT_COLUMN_ID],
    },
};

export const MultiColumn: Story = {
    args: {
        grouping: [DEPARTMENT_COLUMN_ID, ROLE_COLUMN_ID],
    },
};
