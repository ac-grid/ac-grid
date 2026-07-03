# RFC-0032: AI Toolkit（Stretch Goal）

**状态**: 🔮 Stretch  
**版本**: TBD  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0028](./0028-advanced-filtering.md), [0031](./0031-server-side-row-model.md)

## 概述

自然语言查询、智能过滤建议、数据洞察摘要，对标 AG Grid Enterprise AI Toolkit。

## 设计目标

- [ ] 可插拔 LLM provider（OpenAI / 本地模型）
- [ ] `gridApi.ask(question)` → 过滤/排序/高亮建议
- [ ] 不将用户数据默认发送到第三方（显式 opt-in）

### 非目标

- ❌ v1/v2 核心发布阻塞项
- ❌ 替代业务 BI 产品

## 开放问题

- [ ] 隐私与合规策略
- [ ] 是否独立 `@ac-grid/ai` 包

## 参考资料

- [AG Grid AI Toolkit](https://www.ag-grid.com/javascript-data-grid/ai-toolkit/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)
