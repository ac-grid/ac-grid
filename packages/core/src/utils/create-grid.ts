/**
 * createGrid 工具函数 - 用于在纯 HTML/JavaScript 环境中创建和配置 Grid 组件
 *
 * 在非 JSX 环境中，不能直接使用 JSX 语法，需要通过 DOM API 创建元素
 * 并通过 property（而非 attribute）设置复杂数据
 */

import type { ColumnDef } from "@tanstack/table-core";
import type { GridSortingConfig } from "../components/Grid.wsx";

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
    const { data, columns, className, sorting, container } = options;

    // 确保组件已注册（导入时会自动注册）
    // 创建自定义元素
    const gridElement = document.createElement("wsx-ac-grid") as any;

    // 通过 property 设置数据（不是 attribute）
    // 这是关键：复杂对象必须通过 property 传递
    gridElement.data = data;
    gridElement.columns = columns;

    // 简单的字符串属性可以通过 attribute 或 property 设置
    if (className) {
        gridElement.className = className;
    }

    // 排序配置
    if (sorting) {
        gridElement.sortingConfig = sorting;
    }

    // 如果提供了容器，直接挂载
    if (container) {
        container.appendChild(gridElement);
    }

    return gridElement;
}
