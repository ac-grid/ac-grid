import { Grid } from '../components/Grid.wsx';
import type { GridOptions, FullGridOptions } from '../components/Grid.wsx';

/**
 * 创建网格实例（支持虚拟滚动）
 */
export function createGrid(options: FullGridOptions): Grid {
  // TODO: 初始化网格配置和虚拟滚动逻辑
  return new Grid();
}

/**
 * 创建虚拟滚动网格实例
 */
export function createVirtualizedGrid<T extends Record<string, any>>(
  options: Omit<FullGridOptions, 'enableVirtualScrolling'> & { enableVirtualScrolling: true }
): Grid {
  const virtualScrollConfig = options;

  // TODO: 配置虚拟滚动参数
  return new Grid({ ...options, enableVirtualScrolling: true });
}
