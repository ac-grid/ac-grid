# RFC-0035: RFC-0010 分组与聚合 E2E 验证覆盖 (Close RFC-0010 E2E Gap)

**状态**: ✔️ 已完成  
**版本**: 0.3.0  
**作者**: Albert Li  
**日期**: 2026-10-08  
**完成日期**: 2026-10-08  
**关联 Issue**: [ACG-121](mention://issue/01a1040d-83d9-7d30-98fd-bcd4ff2375ab)  
**相关 RFC**: [0010-grouping-aggregation](./completed/0010-grouping-aggregation.md)

## 概述

RFC-0010 已经在 `@ac-grid/core` 中完整实现了行分组与聚合引擎（集成 TanStack `getGroupedRowModel` 与 `getExpandedRowModel`、内置 `sum`/`avg`/`count`/`min`/`max` 聚合以及公共 `expandAll`/`collapseAll`/`toggleGroup`/`setGrouping` 方法），并通过了单元测试。  
本 RFC 旨在闭环 doc–code–test 交付缺口：
1. 在 `demos/react` 手动验收台新增 `?rfc=0010` 场景演示；
2. 编写配套的 Playwright 端到端（E2E）自动化测试；
3. 将 RFC-0010 状态推进至已完成，并同步 ROADMAP、TASK_TRACKING 和 ISSUE_REGISTRY。

## 设计目标

- [x] **目标 1**: 在 `demos/react/src/rfcValidationDemos.ts` 注册 `0010` 演示用例与选项配置。
- [x] **目标 2**: 在 demo 工具栏增加分组折叠与展开交互按钮控制。
- [x] **目标 3**: 在 `demos/react/e2e/rfc-validation.spec.ts` 中实现端到端自动化测试，验证分组行渲染、聚合值计算、全部折叠、单行展开与全部展开流程。
- [x] **目标 4**: 将 `.spec/rfc/0010-grouping-aggregation.md` 归档至 `completed/` 目录并更新路线图状态。

## 验收结果

1. **E2E 测试验证通过**:
   `pnpm --filter demo-react test:e2e -g RFC-0010` 通过：
   - 验证 3 个状态分组行成功生成。
   - 验证 count/avg/sum 单元格聚合值格式化渲染。
   - 验证 `collapseAll()` 折叠所有子行，仅保留 3 个分组头。
   - 验证分组行点击触发单行展开与反折叠。
   - 验证 `expandAll()` 恢复所有叶子数据行。
2. **单元测试保持 100% 通过**:
   `pnpm test` 全套 27 个测试文件、189 个测试均通过。
