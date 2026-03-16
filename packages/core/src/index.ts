import { Grid } from './components/Grid.wsx';
import type { GridOptions, ColumnDef, Row } from './components/Grid.wsx';

// 虚拟滚动导出
export { 
  calculateVisibleRange, 
  scrollToRow, 
  getVisibleRowRange,
  createScrollHandler,
} from './utils/virtual-scroll';

// 类型导出
export type { GridOptions, ColumnDef, Row };

// TODO: 添加更多虚拟滚动相关导出
// export * from './types/virtualization';
