# SDK 黄金案例（mok1）

从外围业务 Worker 提炼的 **SDK 消费契约** 测试，按 Worker 分目录存放。每次 `framework_sdk_worker` publish 后由 CI 自动执行 `npm run test:golden`。

## 目录

| 目录 | 来源 Worker | SDK 模块 |
|------|-------------|----------|
| `llm-gateway/` | llm-gateway-worker | `ai/gateway` |
| `email-rule/` | email-rule-worker | `circuit-breaker`, `ai/client` |
| `invest-rss/` | invest-rss-worker | `ai/client` |
| `advisor-worker/` | （二期扩展占位） | `ai/client` |
| `decision-desk/` | （二期扩展占位） | `desk/reject-reason` |

## 贡献新案例

1. 在对应 Worker 子目录新增 `*.test.ts`
2. 在 `manifest.yaml` 登记 `id` / `source` / `sdk_modules`
3. 共享 mock 放 `_harness/`，勿复制
4. 只测 SDK API 面，领域 golden 仍留在各业务仓 `test/evaluation/`

## 本地

```bash
npm ci
npm run test:golden   # 仅黄金案例
npm test              # health + golden 全量
```
