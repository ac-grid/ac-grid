export const defaultTextFilter = (row: any, columnId: string, filterValue: unknown) => {
    const value = row.getValue(columnId);
    return String(value ?? "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
};

export const numberFilter = (row: any, columnId: string, filterValue: unknown) => {
    const value = Number(row.getValue(columnId));
    const filter = String(filterValue);
    if (filter.startsWith(">")) return value > Number(filter.slice(1));
    if (filter.startsWith("<")) return value < Number(filter.slice(1));
    return value === Number(filter);
};

export const dateFilter = (row: any, columnId: string, filterValue: unknown) => {
    const value = new Date(row.getValue(columnId) as string);
    const filter = new Date(String(filterValue));
    return value.toDateString() === filter.toDateString();
};
