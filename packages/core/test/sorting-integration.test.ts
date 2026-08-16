import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/dom";

import "../src/components/Grid.wsx";

describe("Grid sorting integration", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("re-renders body rows in sorted DOM order when a header is clicked", async () => {
        const grid = document.createElement("wsx-ac-grid") as HTMLElement & {
            data: Array<{ userId: string; firstName: string; lastName: string }>;
            columns: Array<{ id: string; accessorKey: string; header: string }>;
            sortingConfig: { enabled: boolean };
            table?: { getRowModel: () => { rows: Array<{ getValue: (id: string) => string }> } };
        };

        grid.data = [
            { userId: "2", firstName: "Zoe", lastName: "Z" },
            { userId: "1", firstName: "Amy", lastName: "A" },
            { userId: "3", firstName: "Mike", lastName: "M" },
        ];
        grid.columns = [
            { id: "firstName", accessorKey: "firstName", header: "First Name" },
            { id: "lastName", accessorKey: "lastName", header: "Last Name" },
        ];
        grid.sortingConfig = { enabled: true };

        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelectorAll(".grid-row").length).toBe(3);
        });

        const header = (grid.shadowRoot || grid).querySelector(
            '.grid-header-cell[data-column-id="firstName"]',
        ) as HTMLElement | null;
        expect(header).toBeTruthy();
        header?.click();

        await waitFor(() => {
            const modelNames = grid
                .table!.getRowModel()
                .rows.map((row) => row.getValue("firstName"));
            const root = grid.shadowRoot || grid;
            const domNames = Array.from(root.querySelectorAll(".grid-row")).map(
                (row) => row.querySelector(".grid-cell")?.textContent?.trim(),
            );

            expect(modelNames).toEqual(["Amy", "Mike", "Zoe"]);
            expect(domNames).toEqual(["Amy", "Mike", "Zoe"]);
        });
    });
});
