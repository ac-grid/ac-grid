/**
 * 国际化 (i18n) 类型定义 (RFC-0015)
 */

export type SupportedLocale = "en-US" | "zh-CN" | string;

export interface I18nMessages {
    // 通用与遮罩
    "grid.loading": string;
    "grid.noData": string;

    // 排序
    "grid.sort.asc": string;
    "grid.sort.desc": string;
    "grid.sort.none": string;
    "grid.sort.clickToSort": string;
    "grid.sort.clickToSortDesc": string;
    "grid.sort.clickToClear": string;

    // 分页
    "grid.pagination.showing": string;
    "grid.pagination.to": string;
    "grid.pagination.of": string;
    "grid.pagination.results": string;
    "grid.pagination.page": string;
    "grid.pagination.first": string;
    "grid.pagination.previous": string;
    "grid.pagination.next": string;
    "grid.pagination.last": string;
    "grid.pagination.show": string;
    "grid.pagination.loading": string;

    // 过滤
    "grid.filter.searchPlaceholder": string;
    "grid.filter.filterPlaceholder": string;
    "grid.filter.filterNumberPlaceholder": string;
    "grid.filter.selectOperator": string;
    "grid.filter.equals": string;
    "grid.filter.greaterThan": string;
    "grid.filter.lessThan": string;
    "grid.filter.contains": string;
    "grid.filter.notContains": string;
    "grid.filter.notEqual": string;
    "grid.filter.startsWith": string;
    "grid.filter.endsWith": string;
    "grid.filter.blank": string;
    "grid.filter.notBlank": string;

    // 列操作
    "grid.column.dragToReorder": string;

    // 允许自定义扩展其他 key
    [key: string]: string;
}

export interface LanguagePack {
    locale: string;
    messages: Partial<I18nMessages> & Record<string, string>;
    dateFormat?: string | Intl.DateTimeFormatOptions;
    numberFormat?: Intl.NumberFormatOptions;
    dir?: "ltr" | "rtl";
}

export interface I18nManagerOptions {
    locale?: string;
    messages?: Record<string, string>;
    dir?: "ltr" | "rtl";
    dateFormat?: string | Intl.DateTimeFormatOptions;
    numberFormat?: Intl.NumberFormatOptions;
}

export interface GridI18nConfig {
    locale?: string;
    messages?: Record<string, string>;
    dir?: "ltr" | "rtl";
    dateFormat?: string | Intl.DateTimeFormatOptions;
    numberFormat?: Intl.NumberFormatOptions;
    onLocaleChange?: (locale: string) => void;
}
