/** Parse tab/newline separated clipboard data, including quoted fields. */
export function parseTsv(input: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = "";
    let quoted = false;

    for (let index = 0; index < input.length; index++) {
        const char = input[index];
        if (char === '"') {
            if (quoted && input[index + 1] === '"') {
                value += '"';
                index++;
            } else {
                quoted = !quoted;
            }
        } else if (char === "\t" && !quoted) {
            row.push(value);
            value = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            row.push(value);
            rows.push(row);
            row = [];
            value = "";
            if (char === "\r" && input[index + 1] === "\n") index++;
        } else {
            value += char;
        }
    }

    if (value !== "" || row.length > 0 || rows.length === 0) {
        row.push(value);
        rows.push(row);
    }
    const lastRow = rows[rows.length - 1];
    if (rows.length > 1 && lastRow.length === 1 && lastRow[0] === "") {
        rows.pop();
    }
    return rows;
}

export function serializeTsv(rows: unknown[][]): string {
    return rows
        .map((row) => row.map((value) => {
            const text = String(value ?? "");
            return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        }).join("\t"))
        .join("\r\n");
}
