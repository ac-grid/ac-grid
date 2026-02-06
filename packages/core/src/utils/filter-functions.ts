import type { FilterCondition } from "../types/filtering";

/**
 * 尝试从字符串解析 FilterCondition（如 JSON）
 * 用于兼容跨自定义元素时被序列化的情况
 */
const parseFilterConditionFromString = (
  s: string,
  defaultOperator: FilterCondition["operator"],
): FilterCondition | null => {
  const trimmed = s.trim();
  if (trimmed.startsWith("{") && trimmed.includes("value") && trimmed.includes("operator")) {
    try {
      const parsed = JSON.parse(s) as { value?: unknown; operator?: FilterCondition["operator"] };
      if (parsed && typeof parsed.value !== "undefined") {
        return {
          value: String(parsed.value ?? ""),
          operator: parsed.operator ?? defaultOperator,
        };
      }
    } catch {
      // 非合法 JSON，当作普通字符串
    }
  }
  return null;
};

/**
 * 将过滤值统一转换为 FilterCondition 对象
 * 向后兼容：简单字符串、JSON 字符串、对象均支持
 */
export const toFilterCondition = (
  filterValue: FilterCondition | string | unknown,
  defaultOperator: FilterCondition["operator"],
): FilterCondition => {
  if (typeof filterValue === "string") {
    const parsed = parseFilterConditionFromString(filterValue, defaultOperator);
    if (parsed) return parsed;
    return { value: filterValue, operator: defaultOperator };
  }
  if (
    filterValue &&
    typeof filterValue === "object" &&
    "operator" in filterValue &&
    "value" in filterValue
  ) {
    return filterValue as FilterCondition;
  }
  // 处理 null/undefined
  if (filterValue == null || filterValue === "") {
    return { value: "", operator: defaultOperator };
  }
  return { value: String(filterValue), operator: defaultOperator };
};

/**
 * 文本列过滤函数
 * 支持所有文本操作符：contains, notContains, equals, notEqual, startsWith, endsWith, blank, notBlank
 */
export const defaultTextFilter = (
  row: any,
  columnId: string,
  filterValue: FilterCondition | string | unknown,
) => {
  const condition = toFilterCondition(filterValue, "contains");
  const rawValue = row.getValue(columnId);
  const rowValue = String(rawValue ?? "").toLowerCase();
  const searchTerm = (condition.value ?? "").toLowerCase();

  // 如果搜索词为空且操作符不是 blank/notBlank，不过滤（显示所有行）
  if (
    searchTerm === "" &&
    condition.operator !== "blank" &&
    condition.operator !== "notBlank"
  ) {
    return true;
  }

  switch (condition.operator) {
    case "equals":
      return rowValue === searchTerm;
    case "startsWith":
      return rowValue.startsWith(searchTerm);
    case "endsWith":
      return rowValue.endsWith(searchTerm);
    case "contains":
      return rowValue.includes(searchTerm);
    case "notContains":
      return !rowValue.includes(searchTerm);
    case "notEqual":
      return rowValue !== searchTerm;
    case "blank":
      // 空值：null, undefined, 空字符串
      return rawValue == null || rawValue === "";
    case "notBlank":
      // 非空值
      return rawValue != null && rawValue !== "";
    default:
      return rowValue.includes(searchTerm);
  }
};

/**
 * 数字列过滤函数
 * 支持操作符：equals, greaterThan, lessThan
 * 向后兼容：简单数字字符串使用 "equals" 操作符
 */
export const numberFilter = (
  row: any,
  columnId: string,
  filterValue: FilterCondition | string | unknown,
) => {
  const condition = toFilterCondition(filterValue, "equals");
  const cellValue = Number(row.getValue(columnId));
  const filterStr = String(condition.value ?? "").trim();

  if (!filterStr) return true;

  const num = Number(filterStr);
  if (Number.isNaN(num)) return true;

  switch (condition.operator) {
    case "greaterThan":
      return cellValue > num;
    case "lessThan":
      return cellValue < num;
    case "equals":
    default:
      return cellValue === num;
  }
};

/**
 * 日期列过滤函数
 * 精确匹配日期（不考虑时间部分）
 */
export const dateFilter = (
  row: any,
  columnId: string,
  filterValue: FilterCondition | string | unknown,
) => {
  const condition = toFilterCondition(filterValue, "equals");
  const cellValue = row.getValue(columnId);
  const filterStr = String(condition.value ?? "").trim();

  if (!filterStr) return true;

  const cellDate = new Date(cellValue as string);
  const filterDate = new Date(filterStr);

  if (isNaN(cellDate.getTime()) || isNaN(filterDate.getTime())) {
    return true;
  }

  return cellDate.toDateString() === filterDate.toDateString();
};
