import type { ColumnDef } from "@ac-grid/core";
import type { AcGridProps } from "./index";

interface Person {
  name: string;
}

declare const rows: Person[];
declare const columns: ColumnDef<Person>[];

export const props: AcGridProps<Person> = { data: rows, columns };
