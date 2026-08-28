# MOK1

**worker-actions 冒烟靶** — 公开仓，非业务产品。

最小 hello-world Worker：`GET /health` → `{ "ok": true, "worker": "MOK1" }`。用于验证 [worker-actions](https://github.com/workers-world/worker-actions) Release PR 全链路：

- workflow-lint / verify（lint + tsc + test）
- sync-packages-lock
- ensure-release-pr（push `dev_*`）
- qodana（Release PR）
- ocr（skip，不调 LLM）
- release-auto-merge
- sync-default-branch

## 本地

```bash
npm ci
npm run check
npm test
```

## CI 前置（Org）

- Secret `GHA_TOKEN`（PAT，`repo`）
- Variable `GHA_RUNNER`（自托管 runner 标签，可选）
- Variable `QODANA_ENABLED=true`（启用 Qodana job）

`worker-actions` 须已打 tag `actions/v0.1.0`。

## 分支

开发轨：`dev_00_01_00` → Release PR → `master`。

## 注意

- 勿在此仓写生产域名、密钥或 Org 内部手册
- Agent / CI 不自动 `wrangler deploy`；可选接 CF Builds 连 `master`
