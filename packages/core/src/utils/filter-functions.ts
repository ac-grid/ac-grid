export const defaultTextFilter = (row: any, columnId: string, filterValue: unknown) => {
    const rowValue = String(row.getValue(columnId) ?? "").toLowerCase();
    
    let filterStr = String(filterValue);
    let operator = "contains";
    let searchTerm = filterStr.toLowerCase();

    // Try to parse complex filter object
    try {
        if (filterStr.startsWith("{")) {
            const parsed = JSON.parse(filterStr);
            if (parsed.operator) {
                operator = parsed.operator;
                searchTerm = (parsed.value ?? "").toLowerCase();
            }
        }
    } catch (e) {
        // Not a JSON object, use default simple filter
    }

    switch (operator) {
        case "equals":
            return rowValue === searchTerm;
        case "startsWith":
            return rowValue.startsWith(searchTerm);
        case "endsWith":
            return rowValue.endsWith(searchTerm);
        case "contains":
            return rowValue.includes(searchTerm);
        case "notContains":
            return !rowValue.includes(searchTerm);
        case "notEqual":
            return rowValue !== searchTerm;
        case "blank":
            return rowValue === "";
        case "notBlank":
            return rowValue !== "";
        default:
            return rowValue.includes(searchTerm);
    }
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
