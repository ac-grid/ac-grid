import type { Row } from "@tanstack/table-core";
import type { FilterFn } from "../types/filtering";

/**
 * 默认文本过滤函数
 * 不区分大小写的包含匹配
 */
export const defaultTextFilter: FilterFn<any> = (
    row: Row<any>,
    columnId: string,
    filterValue: unknown
): boolean => {
    if (!filterValue || filterValue === "") {
        return true;
    }

    const value = row.getValue(columnId);
    if (value == null) {
        return false;
    }

    const stringValue = String(value).toLowerCase();
    const stringFilter = String(filterValue).toLowerCase();

    return stringValue.includes(stringFilter);
};

/**
 * 数字过滤函数
 * 支持精确匹配和范围匹配（如 ">10", "<20", "10-20"）
 */
export const numberFilter: FilterFn<any> = (
    row: Row<any>,
    columnId: string,
    filterValue: unknown
): boolean => {
    if (!filterValue || filterValue === "") {
        return true;
    }

    const value = row.getValue(columnId);
    if (value == null) {
        return false;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
        return false;
    }

    const filterStr = String(filterValue).trim();

    // 范围匹配: "10-20"
    if (filterStr.includes("-")) {
        const [min, max] = filterStr.split("-").map(Number);
        if (!isNaN(min) && !isNaN(max)) {
            return numValue >= min && numValue <= max;
        }
    }

    // 大于: ">10"
    if (filterStr.startsWith(">")) {
        const threshold = Number(filterStr.slice(1));
        if (!isNaN(threshold)) {
            return numValue > threshold;
        }
    }

    // 小于: "<20"
    if (filterStr.startsWith("<")) {
        const threshold = Number(filterStr.slice(1));
        if (!isNaN(threshold)) {
            return numValue < threshold;
        }
    }

    // 精确匹配
    const filterNum = Number(filterStr);
    if (!isNaN(filterNum)) {
        return numValue === filterNum;
    }

    return false;
};

/**
 * 日期过滤函数
 * 支持日期范围（如 "2024-01-01,2024-12-31"）
 */
export const dateFilter: FilterFn<any> = (
    row: Row<any>,
    columnId: string,
    filterValue: unknown
): boolean => {
    if (!filterValue || filterValue === "") {
        return true;
    }

    const value = row.getValue(columnId);
    if (value == null) {
        return false;
    }

    // 确保值是有效的日期类型
    const dateValue = value instanceof Date 
        ? value 
        : new Date(String(value));
    if (isNaN(dateValue.getTime())) {
        return false;
    }

    const filterStr = String(filterValue).trim();

    // 范围匹配: "2024-01-01,2024-12-31"
    if (filterStr.includes(",")) {
        const [startStr, endStr] = filterStr.split(",");
        const startDate = new Date(startStr.trim());
        const endDate = new Date(endStr.trim());

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            return dateValue >= startDate && dateValue <= endDate;
        }
    }

    // 精确匹配（同一天）
    const filterDate = new Date(filterStr);
    if (!isNaN(filterDate.getTime())) {
        return (
            dateValue.getFullYear() === filterDate.getFullYear() &&
            dateValue.getMonth() === filterDate.getMonth() &&
            dateValue.getDate() === filterDate.getDate()
        );
    }

    return false;
};
