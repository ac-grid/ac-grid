import { useMemo } from "react";
import "./App.css";

// https://nodejs.org/api/packages.html#packages_self_referencing_a_package_using_its_name
import { Grid, DraggableHandler } from "@systembug/ac-grid";

import { ColumnDef } from "@tanstack/react-table";

import { Person, makeData } from "./stories/makeData";

function App() {
    const columns = useMemo<ColumnDef<Person>[]>(
        () => [
            // Create a dedicated drag handle column. Alternatively, you could just set up dnd events on the rows themselves.
            {
                id: "drag-handle",
                header: "Move",
                cell: ({ row }) => <DraggableHandler rowId={row.id} />,
                size: 60,
            },
            {
                accessorKey: "firstName",
                cell: (info) => info.getValue(),
                id: "firstName",
                size: 150,
            },
            {
                accessorFn: (row) => row.lastName,
                cell: (info) => info.getValue(),
                header: () => <span>Last Name</span>,
                id: "lastName",
                size: 150,
            },
            {
                accessorKey: "age",
                header: () => "Age",
                id: "age",
                size: 120,
            },
            {
                accessorKey: "visits",
                header: () => <span>Visits</span>,
                id: "visits",
                size: 120,
            },
            {
                accessorKey: "status",
                header: "Status",
                id: "status",
                size: 150,
            },
            {
                accessorKey: "progress",
                header: "Profile Progress",
                id: "progress",
                size: 180,
            },
        ],
        []
    );

    return (
        <div className="p-2">
            <Grid<Person> data={makeData(20)} columns={columns} />
        </div>
    );
}

export default App;
