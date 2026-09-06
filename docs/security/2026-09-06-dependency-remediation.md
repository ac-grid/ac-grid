# 严重与高危依赖漏洞修复

## 范围

修复 Dependabot 报告的严重、高危依赖漏洞。升级直接依赖并刷新 pnpm 锁文件；仍被上游锁定的传递依赖使用限定受影响版本范围的 `pnpm.overrides`，保留原主版本。

主要升级：Vite 5 → 6.4.3，站点 Vite → 7.3.6，主题 Vitest 1 → 3.2.7，核心 Vitest 与覆盖插件 → 4.1.11，站点 Vitest 与 UI → 3.2.7，Happy DOM → 20，Faker → 10，Storybook → 8.6.18。

Faker 10 要求更新的 Node 运行时，项目 Volta 固定版本从 22.12.0 升至 22.23.2。WSX 演示显式保留 `development|production` 解析条件，适配 Vite 6 的条件导出行为。

版本与漏洞依据：[Vitest 官方安全公告](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp)、[Faker 升级指南](https://fakerjs.dev/guide/upgrading)、[Vite 6 迁移指南](https://v6.vite.dev/guide/migration.html)、GitHub Dependabot API 和 npm 审计接口。未忽略或手动关闭告警。

## 验证记录

| 检查                                                       | 结果                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm audit --json`，升级前                                | 严重 4、高危 46、中危 23、低危 4；与 GitHub 按清单重复计数的告警数不同          |
| `pnpm audit --audit-level high`，升级后                    | 退出码 0；严重 0、高危 0、中危 5、低危 3                                        |
| `pnpm install --frozen-lockfile`                           | 通过                                                                            |
| `pnpm --filter @ac-grid/core test run --maxWorkers=1`      | 26 个测试文件、185 个测试全部通过                                               |
| `pnpm --filter @ac-grid/core test:coverage --maxWorkers=1` | 通过；184 通过、1 跳过；原有配置限定的五个工具文件覆盖率 100%，不代表全仓覆盖率 |
| `pnpm build`                                               | 核心和两个主题包通过；React 演示失败，详见下文                                  |
| `pnpm --filter @ac-grid/demo-wsx build`                    | 通过                                                                            |
| `pnpm --filter @ac-grid/site build`                        | 通过，包括 404 与文档资源复制                                                   |
| `pnpm --filter @ac-grid/demo-react build-storybook`        | 失败：原有组件引用缺失，详见下文                                                |

## 既存问题与边界

升级前核心测试默认并发运行时 183/185 通过：分组性能预算超过 100ms、虚拟滚动行断言失败。升级后默认并发运行时 184/185 通过，剩余性能计时失败；降低并发后 185/185 通过。没有修改测试断言、超时或覆盖范围。

升级前、后的全仓构建都被 React 演示阻塞：`rfcValidationDemos.ts` 中 `filterType` 不属于 `ColumnDef<Person>`，旧 stories 引用不存在的 `../../lib/components/*` 和 `../../lib/main`。Storybook 也因 `Could not resolve "../../lib/components/Label/index"` 失败。本次未修改这些业务或示例代码。

主题包和站点没有现存测试文件，未以空测试运行宣称覆盖验证。站点已有 TypeDoc peer 版本警告仍存在。中危、低危告警留待后续处理；GitHub 告警关闭情况需以推送后重新扫描结果为准。
