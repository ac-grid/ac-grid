/**
 * createGrid 工具函数 - 用于在纯 HTML/JavaScript 环境中创建和配置 Grid 组件
 *
 * 在非 JSX 环境中，不能直接使用 JSX 语法，需要通过 DOM API 创建元素
 * 并通过 property（而非 attribute）设置复杂数据
 */

import type { ColumnDef } from "@tanstack/table-core";
// @ts-ignore - .wsx 文件在构建时会被处理
import type { GridSortingConfig } from "../components/Grid.wsx";
import type { GridFilteringConfig } from "../types/filtering";
import type { GridResizingConfig } from "../types/resizing";
import type { GridVirtualizationConfig } from "../types/virtualization";
import type { GridSelectionConfig } from "../types/selection";
import type { GridPaginationConfig } from "../types/pagination";

export interface CreateGridOptions<TData extends { userId?: string }> {
    /**
     * 数据源
     */
    data: TData[];
    /**
     * 列定义
     */
    columns: ColumnDef<TData, any>[];
    /**
     * 自定义类名
     */
    className?: string;
    /**
     * 排序配置
     */
    sorting?: GridSortingConfig;
    /**
     * 过滤配置
     */
    filtering?: GridFilteringConfig;
    /**
     * 列宽调整配置（RFC-0004）
     */
    resizing?: GridResizingConfig;
    /**
     * 虚拟滚动配置（RFC-0005）
     */
    virtualization?: GridVirtualizationConfig;
    /**
     * 行选择配置（RFC-0007）
     */
    selection?: GridSelectionConfig;
    /**
     * 分页配置（RFC-0006）
     */
    pagination?: GridPaginationConfig;
    /**
     * 容器元素（可选，如果不提供则返回元素本身）
     */
    container?: HTMLElement;
}

/**
 * 创建并配置 Grid 组件
 *
 * @example
 * ```typescript
 * import { createGrid } from '@ac-grid/core';
 *
 * const gridElement = createGrid({
 *   data: myData,
 *   columns: myColumns,
 *   className: 'my-grid'
 * });
 *
 * document.body.appendChild(gridElement);
 * ```
 *
 * @example
 * ```typescript
 * // 直接挂载到容器
 * createGrid({
 *   data: myData,
 *   columns: myColumns,
 *   container: document.getElementById('app')
 * });
 * ```
 */
export function createGrid<TData extends { userId?: string }>(
    options: CreateGridOptions<TData>,
): HTMLElement {
    const {
        data,
        columns,
        className,
        sorting,
        filtering,
        resizing,
        virtualization,
        selection,
        pagination,
        container,
    } = options;

    // 确保组件已注册（导入时会自动注册）
    // 创建自定义元素
    const gridElement = document.createElement("wsx-ac-grid") as any;

    // Apply virtualization before data so the first render never mounts the full dataset
    if (virtualization) {
        gridElement.virtualizationConfig = virtualization;
    }

    if (className) {
        gridElement.className = className;
    }

    if (sorting) {
        gridElement.sortingConfig = sorting;
    }

    if (filtering) {
        gridElement.filteringConfig = filtering;
    }

    if (resizing) {
        gridElement.resizingConfig = resizing;
    }

    if (selection) {
        gridElement.selectionConfig = selection;
    }

    if (pagination) {
        gridElement.paginationConfig = pagination;
    }

    gridElement.columns = columns;
    gridElement.data = data;

    // 如果提供了容器，直接挂载
    if (container) {
        container.appendChild(gridElement);
    }

    return gridElement;
}
