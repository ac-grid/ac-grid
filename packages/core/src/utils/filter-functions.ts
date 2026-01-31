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

/**
 * 数字列过滤：支持纯字符串 "30"、">30"、"<30" 或 FilterInput 发出的 JSON { value, operator }
 */
export const numberFilter = (row: any, columnId: string, filterValue: unknown) => {
    const cellValue = Number(row.getValue(columnId));
    const filter = String(filterValue ?? "").trim();
    if (!filter) return true;

    let num: number;
    let operator = "equals";

    try {
        if (filter.startsWith("{")) {
            const parsed = JSON.parse(filter) as { value?: string; operator?: string };
            operator = (parsed.operator ?? "equals").toLowerCase();
            const v = parsed.value;
            if (v === "" || v == null) return true;
            num = Number(v);
        } else {
            if (filter.startsWith(">")) {
                num = Number(filter.slice(1).trim());
                operator = "greaterThan";
            } else if (filter.startsWith("<")) {
                num = Number(filter.slice(1).trim());
                operator = "lessThan";
            } else {
                num = Number(filter);
            }
        }
    } catch {
        num = Number(filter);
    }

    if (Number.isNaN(num)) return true;

    switch (operator) {
        case "greaterThan":
        case ">":
            return cellValue > num;
        case "lessThan":
        case "<":
            return cellValue < num;
        case "equals":
        case "=":
        case "contains":
        default:
            return cellValue === num;
    }
};

export const dateFilter = (row: any, columnId: string, filterValue: unknown) => {
    const value = new Date(row.getValue(columnId) as string);
    const filter = new Date(String(filterValue));
    return value.toDateString() === filter.toDateString();
};
