import type { LanguagePack } from "../types/i18n";

export const enUS: LanguagePack = {
    locale: "en-US",
    messages: {
        "grid.loading": "Loading...",
        "grid.noData": "No data available",

        "grid.sort.asc": "ascending",
        "grid.sort.desc": "descending",
        "grid.sort.none": "none",
        "grid.sort.clickToSort": "Click to sort",
        "grid.sort.clickToSortDesc": "Click to sort descending",
        "grid.sort.clickToClear": "Click to clear sort",

        "grid.pagination.showing": "Showing",
        "grid.pagination.to": "to",
        "grid.pagination.of": "of",
        "grid.pagination.results": "results",
        "grid.pagination.page": "Page",
        "grid.pagination.first": "First Page",
        "grid.pagination.previous": "Previous Page",
        "grid.pagination.next": "Next Page",
        "grid.pagination.last": "Last Page",
        "grid.pagination.show": "Show",
        "grid.pagination.loading": "Loading…",

        "grid.filter.searchPlaceholder": "Search all columns...",
        "grid.filter.filterPlaceholder": "Filter...",
        "grid.filter.filterNumberPlaceholder": "Filter number...",
        "grid.filter.selectOperator": "Select operator",
        "grid.filter.equals": "Equals",
        "grid.filter.greaterThan": "Greater than",
        "grid.filter.lessThan": "Less than",
        "grid.filter.contains": "Contains",
        "grid.filter.notContains": "Not contains",
        "grid.filter.notEqual": "Not equal",
        "grid.filter.startsWith": "Starts with",
        "grid.filter.endsWith": "Ends with",
        "grid.filter.blank": "Blank",
        "grid.filter.notBlank": "Not blank",

        "grid.column.dragToReorder": "Drag to reorder column",
    },
    dateFormat: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    },
    numberFormat: {
        useGrouping: true,
    },
    dir: "ltr",
};

export const zhCN: LanguagePack = {
    locale: "zh-CN",
    messages: {
        "grid.loading": "加载中...",
        "grid.noData": "暂无数据",

        "grid.sort.asc": "升序",
        "grid.sort.desc": "降序",
        "grid.sort.none": "无排序",
        "grid.sort.clickToSort": "点击排序",
        "grid.sort.clickToSortDesc": "点击降序排序",
        "grid.sort.clickToClear": "点击清除排序",

        "grid.pagination.showing": "显示第",
        "grid.pagination.to": "至",
        "grid.pagination.of": "条，共",
        "grid.pagination.results": "条结果",
        "grid.pagination.page": "页",
        "grid.pagination.first": "首页",
        "grid.pagination.previous": "上一页",
        "grid.pagination.next": "下一页",
        "grid.pagination.last": "尾页",
        "grid.pagination.show": "显示",
        "grid.pagination.loading": "加载中…",

        "grid.filter.searchPlaceholder": "搜索所有列...",
        "grid.filter.filterPlaceholder": "过滤...",
        "grid.filter.filterNumberPlaceholder": "过滤数字...",
        "grid.filter.selectOperator": "选择操作符",
        "grid.filter.equals": "等于",
        "grid.filter.greaterThan": "大于",
        "grid.filter.lessThan": "小于",
        "grid.filter.contains": "包含",
        "grid.filter.notContains": "不包含",
        "grid.filter.notEqual": "不等于",
        "grid.filter.startsWith": "开头是",
        "grid.filter.endsWith": "结尾是",
        "grid.filter.blank": "为空",
        "grid.filter.notBlank": "不为空",

        "grid.column.dragToReorder": "拖拽排序列",
    },
    dateFormat: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    },
    numberFormat: {
        useGrouping: true,
    },
    dir: "ltr",
};
