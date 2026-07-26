# RFC-0030: 单元格公式 (Formulas)

**状态**: ✔️ 已完成  
**版本**: 2.0.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**最后更新**: 2026-07-18  
**相关 RFC**: [0009](./0009-cell-editing.md), [0022](../0022-range-selection.md)

## 概述

支持类 Excel 公式（`SUM`, `AVG`, 单元格引用），对标 AG Grid Enterprise Formulas。  
首期落地为**独立于渲染循环的轻量公式引擎**（自研 parser，未引入 `hyperformula`），可供 Grid / 选区 / 编辑层后续接入。

## 设计目标

- [x] 公式解析器（`=` 前缀）
- [x] 依赖图与增量重算
- [x] 与 0022 选区引用 `A1` 记法（`parseA1Range` / `rangeToA1` / `expandRange`）

### 非目标

- ❌ 完整 Excel 函数库（分阶段；本期仅 SUM / AVG|AVERAGE / MIN / MAX / COUNT）
- ❌ Formula Editor UI / autocomplete（后续）
- ❌ Grid.wsx 内嵌渲染集成（引擎先行，渲染订阅 `onValuesChanged`）

## 技术方案

选用**轻量自研 parser**，避免为企业级函数库引入 `hyperformula` 体积。引擎与 DOM / WSX 渲染解耦：变更种子 → 依赖图收集受影响格子 → Kahn 拓扑序重算 → 可选回调通知 UI。

### 模块与文件

| 路径 | 职责 |
|------|------|
| `packages/core/src/types/formulas.ts` | `GridFormulasConfig`、`CellAddress`、`FormulaValue` 等 |
| `packages/core/src/utils/a1-notation.ts` | A1 编解码、range 展开（0022 选区引用） |
| `packages/core/src/utils/formula-parser.ts` | tokenize / AST / `SUM`/`AVG`/算术求值 |
| `packages/core/src/utils/formula-graph.ts` | 依赖图、增量受影响集、拓扑排序 / 环检测 |
| `packages/core/src/utils/formula-engine.ts` | `FormulaEngine`、`InMemoryFormulaStore` |
| `packages/core/test/*formula*` / `a1-notation.test.ts` | 单元测试 |

### 公开 API（摘录）

```typescript
import {
  FormulaEngine,
  createFormulaEngineFromMatrix,
  parseA1Range,
  rangeToA1,
} from "@ac-grid/core";

const engine = createFormulaEngineFromMatrix([
  [1, 2, 3],
  ["=SUM(A1:C1)", "=AVG(A1:B1)"],
]);
engine.getValue(1, 0); // 6
engine.setCell(0, 0, 10); // 增量重算依赖格子
```

列定义扩展：`ColumnDef.allowFormula?: boolean`（与 AG Grid `allowFormula` 对齐，供后续编辑层使用）。

### 错误码

`#CYCLE!` / `#REF!` / `#VALUE!` / `#DIV/0!` / `#NAME?` / `#ERROR!`

## 测试策略

- A1 编解码与 range 展开
- 解析器：算术、SUM/AVG、错误码
- 依赖图：传递依赖、拓扑序、环
- 引擎：矩阵求值、增量重算、环检测、缓存

## 参考资料

- [AG Grid Formulas](https://www.ag-grid.com/javascript-data-grid/formulas/)
- [PARITY_MATRIX](../PARITY_MATRIX.md)
