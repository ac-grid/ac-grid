import { useMemo, useState } from "react";
import "./App.css";

// https://nodejs.org/api/packages.html#packages_self_referencing_a_package_using_its_name
import { Grid, DraggableHandler } from "@ac-grid/core";

import { ColumnDef } from "@tanstack/react-table";

import { Person, makeData } from "./stories/makeData";

function App() {
    const [data] = useState(() => makeData(10000)); // Increase data size for virtualization demo

    // Grid resizing configuration
    const resizingConfig = useMemo(() => ({
        enabled: true,
        defaultColumnWidth: 150,
        minColumnWidth: 50,
        onColumnSizingChange: (sizing: any) => {
            console.log("Column sizing changed:", sizing);
        }
    }), []);

    // Grid virtualization configuration
    const virtualizationConfig = useMemo(() => ({
        enabled: true,
        rowHeight: 35,
        overscan: 5
    }), []);

    // Grid pagination configuration
    const paginationConfig = useMemo(() => ({
        enabled: true,
        pageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        onPaginationChange: (state: any) => {
            console.log("Pagination changed:", state);
        }
    }), []);

    // Grid pinning configuration
    const pinningConfig = useMemo(() => ({
        enabled: true,
        initialState: {
            left: ['selection', 'drag-handle', 'firstName'], // Pin selection, handle and name to left
            right: ['progress'] // Pin progress to right
        }
    }), []);

    // Grid editing configuration
    const editingConfig = useMemo(() => ({
        enabled: true,
        mode: 'doubleClick',
        onEditStart: (rowId: any, columnId: any) => console.log('Edit start:', rowId, columnId),
        onEditSave: (rowId: any, columnId: any, value: any) => console.log('Edit save:', rowId, columnId, value),
        onEditCancel: (rowId: any, columnId: any) => console.log('Edit cancel:', rowId, columnId),
    }), []);

    // Grid grouping configuration
    const groupingConfig = useMemo(() => ({
        enabled: true,
        initialGrouping: ['status'], // Group by status
        initialExpanded: true, // Expand all groups by default
        onGroupingChange: (grouping: any) => console.log('Grouping changed:', grouping),
    }), []);

    // Ref to access grid API
    const gridRef = (el: any) => {
        if (el) {
            (window as any).gridApi = el; // Expose for testing
        }
    };

    const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // In a real app, you might update state that passes down to Grid, 
        // or use the ref method if exposed. 
        // Since Grid.wsx has setGlobalFilter method:
        const el = document.querySelector('wsx-ac-grid') as any;
        if (el && el.setGlobalFilter) {
            el.setGlobalFilter(val);
        }
    };

    const columns = useMemo<ColumnDef<Person>[]>(
        () => [
            // Create a dedicated drag handle column. Alternatively, you could just set up dnd events on the rows themselves.
            {
                id: "drag-handle",
                header: "Move",
                cell: ({ row }) => <DraggableHandler rowId={row.id} />,
                size: 60,
                enableColumnFilter: false,
            },
            {
                accessorKey: "firstName",
                cell: (info) => info.getValue(),
                id: "firstName",
                header: "First Name",
                size: 150,
                filterType: "text",
            },
            {
                accessorFn: (row) => row.lastName,
                cell: (info) => info.getValue(),
                header: "Last Name",
                id: "lastName",
                size: 150,
                filterType: "text",
            },
            {
                accessorKey: "age",
                header: "Age",
                id: "age",
                size: 120,
                filterType: "number",
            },
            {
                accessorKey: "visits",
                header: "Visits",
                id: "visits",
                size: 120,
                filterType: "number",
            },
            {
                accessorKey: "status",
                header: "Status",
                id: "status",
                size: 150,
                filterType: "text",
            },
            {
                accessorKey: "progress",
                header: "Profile Progress",
                id: "progress",
                size: 180,
                filterType: "number",
            },
            {
                id: "createdAt",
                header: "Created At",
                accessorFn: () => new Date().toISOString().split('T')[0], // Mock date
                size: 150,
                filterType: "date",
            }
        ],
        [],
    );

    return (
        <div className="p-4 flex flex-col gap-4 h-screen">
            <h1 className="text-2xl font-bold mb-4">AC Grid Filtering Demo</h1>
            
            <div className="flex gap-4 mb-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex-1">
                    <h3 className="font-bold mb-2">Features:</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        <li><strong>Global Search:</strong> Use the input below.</li>
                        <li><strong>Column Filter:</strong> Click the filter icon (Y-shape) in headers.</li>
                    </ul>
                </div>
            </div>

            {/* External Search Bar */}
            <div className="flex items-center gap-2">
                <label className="font-bold">Search:</label>
                <input 
                    type="text" 
                    className="border p-2 rounded" 
                    placeholder="Search all columns..." 
                    onChange={handleGlobalSearch}
                />
            </div>

            <div className="flex-1 min-h-0 border rounded-lg overflow-hidden shadow-lg">
                <Grid<Person> 
                    ref={gridRef}
                    data={data} 
                    columns={columns} 
                    // filteringConfig={filteringConfig} // Deprecated in demo: using external API
                    resizingConfig={resizingConfig}
                    // virtualizationConfig={virtualizationConfig} // Disable virtual scrolling to show pagination clearly
                    paginationConfig={paginationConfig}
                    selectionConfig={selectionConfig}
                    pinningConfig={pinningConfig}
                    editingConfig={editingConfig}
                    groupingConfig={groupingConfig}
                    className="h-full w-full"
                />
            </div>
        </div>
    );
}

export default App;
