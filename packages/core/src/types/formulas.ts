/**
 * RFC-0030: 单元格公式类型定义。
 * 公式引擎独立于渲染循环；Grid 通过配置与 allowFormula 列接入。
 */

/** A1 单元格地址（行列均为 0-based 内部索引） */
export interface CellAddress {
    row: number;
    col: number;
}

/** 带绝对引用标记的地址（用于解析 / 填充句柄偏移） */
export interface CellRefToken {
    row: number;
    col: number;
    absCol: boolean;
    absRow: boolean;
}

/** 矩形选区（与 RFC-0022 CellRange 对齐的 A1 视图） */
export interface A1Range {
    start: CellAddress;
    end: CellAddress;
}

export type FormulaErrorCode =
    | "#CYCLE!"
    | "#REF!"
    | "#VALUE!"
    | "#DIV/0!"
    | "#NAME?"
    | "#ERROR!";

export interface FormulaError {
    type: "error";
    code: FormulaErrorCode;
    message?: string;
}

export type FormulaValue = number | string | boolean | null | FormulaError;

/** 格子原始内容：字面量或 `=` 公式字符串 */
export type CellRawValue = FormulaValue | string;

export interface FormulaDataSource {
    /** 行数（0-based 最大行 = rowCount - 1） */
    getRowCount: () => number;
    /** 列数 */
    getColumnCount: () => number;
    /**
     * 返回单元格原始值。
     * 以 `=` 开头的字符串视为公式；其余为字面量。
     */
    getRawValue: (row: number, col: number) => CellRawValue | undefined;
}

export interface GridFormulasConfig {
    /** 是否启用公式引擎（默认 false） */
    enabled?: boolean;
    /**
     * 可选外部数据源；未提供时引擎使用内部 store。
     */
    dataSource?: FormulaDataSource;
    /**
     * 某单元格计算结果变更时回调（供渲染层订阅，不阻塞引擎）。
     */
    onValuesChanged?: (cells: CellAddress[]) => void;
}

export interface FormulaParseResult {
    /** 规范化后的公式文本（去掉前导空白，保留 `=`） */
    formula: string;
    /** 直接依赖的单元格（展开 range 后的去重列表） */
    dependencies: CellAddress[];
}
