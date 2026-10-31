// Export types for AC Grid (RFC-0014)

export type ExportMode = 'all' | 'selected' | 'visible';

export interface ExportOptions {
  // 文件名
  fileName?: string;
  // 导出范围
  exportMode?: ExportMode;
  // 包含表头
  includeHeaders?: boolean;
  // 列过滤
  columns?: string[];
  // 自定义格式化
  formatter?: (value: any, columnId: string) => string;
}

export interface ExportColumn {
  id: string;
  header: string;
}
