// Export utilities for AC Grid (RFC-0014)

export type ExportMode = 'all' | 'selected' | 'visible';

export interface ExportOptions {
  fileName?: string;
  exportMode?: ExportMode;
  includeHeaders?: boolean;
  columns?: string[];
  formatter?: (value: any, columnId: string) => string;
}

/**
 * Escape a value for CSV according to RFC 4180
 */
export function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert an array of rows to CSV string
 */
export function rowsToCsv(
  rows: any[],
  columns: { id: string; header: string }[],
  options: ExportOptions = {}
): string {
  const { includeHeaders = true, formatter } = options;

  const lines: string[] = [];

  // Header row
  if (includeHeaders) {
    lines.push(columns.map(col => escapeCsvValue(col.header)).join(','));
  }

  // Data rows
  for (const row of rows) {
    const values = columns.map(col => {
      const rawValue = row[col.id];
      const formattedValue = formatter ? formatter(rawValue, col.id) : rawValue;
      return escapeCsvValue(formattedValue);
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV
 */
export function exportToCsv(
  data: any[],
  columns: { id: string; header: string }[],
  options: ExportOptions = {}
): void {
  const {
    fileName = 'export.csv',
    includeHeaders = true,
    formatter,
  } = options;

  const csv = rowsToCsv(data, columns, { includeHeaders, formatter });
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
}
