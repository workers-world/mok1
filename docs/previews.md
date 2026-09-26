# mok1 — Worker Previews 试点

单 Worker、无危险 Service Binding 热路径，用于 Agent ADLC 的 **Preview outcome**（见根 [docs/eval-regression-suites.md](../../docs/eval-regression-suites.md)）。

## 要求

- Wrangler **≥ 4.135.0**（仓内 `package.json` devDependency）
- `wrangler.toml` 含 `[previews]`（绑定预发资源；mok1 无 D1/KV 时块可为空占位）
- **生产 deploy 仍人闸**；非生产由云端出 Preview

## Cloudflare Builds（推荐）

对 **非生产分支**（如 `dev_*`）将 Deploy 命令改为：

```bash
npx wrangler preview
```

勿对 Preview 试点继续使用仅 `wrangler versions upload` 的旧 Version URL（会打生产资源）。

成功后 Builds 会把 Preview URL 附到 PR；Agent 只需 push，再对 `GET {preview}/health` 冒烟（`{ "ok": true, "worker": "mok1" }`）。

## 自定义域 + Access

Preview 走 `*.previews.mailworld.uk`（或团队约定域）+ Zero Trust Access；**不要**为 Agent 打开裸 `workers_dev` 绕过 WAF。

## 本地（可选）

```bash
npm ci
npx wrangler preview
```

仅用于调试 `previews` 配置；ADLC 主路径是 **Workers Builds / GHA 云端**。
