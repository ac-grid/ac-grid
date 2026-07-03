# RFC-0030: 单元格公式 (Formulas)

**状态**: 🔮 Stretch  
**版本**: 2.0.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0009](./0009-cell-editing.md), [0022](./0022-range-selection.md)

## 概述

支持类 Excel 公式（`SUM`, `AVG`, 单元格引用），对标 AG Grid Enterprise Formulas。

## 设计目标

- [ ] 公式解析器（`=` 前缀）
- [ ] 依赖图与增量重算
- [ ] 与 0022 选区引用 `A1` 记法

### 非目标

- ❌ 完整 Excel 函数库（分阶段）

## 技术方案

评估 `hyperformula` 或轻量自研 parser；公式引擎独立于渲染循环。

## 参考资料

- [AG Grid Formulas](https://www.ag-grid.com/javascript-data-grid/formulas/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)
