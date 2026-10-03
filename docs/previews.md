# mok1 — Worker Previews 试点

单 Worker 冒烟靶 + SDK 黄金案例宿主。现经 `SVC_BROWSER_RUN` 调生产 BOR1（Browser 有配额）：探针 `POST /internal/v1/browser-cases/:id` 须 `RULES_ADMIN_TOKEN`，固定案例白名单，勿开放任意 URL。用于 Agent ADLC 的 **Preview outcome**（见根 [docs/eval-regression-suites.md](../../docs/eval-regression-suites.md)）。

## 要求

- Wrangler **≥ 4.136.0** + `cf` devDependency；`framework_sdk_worker` **≥ 0.4.30**（门户 bin）
- Preview 配置以 **`cloudflare.config.ts` 的 `ctx.isPreview`** 为准
- **生产 deploy 仍人闸**；非生产由云端 Preview

## Cloudflare Builds（推荐）

Build command：默认 **`npm ci`**（本仓无单独 build 步）。

| 轨 | Deploy command |
|----|----------------|
| 生产 `master` | **`npm run deploy:remote`** 或 **`npm run deploy:cf`**（alias，含义见 [cf-migrate-mok1.md](cf-migrate-mok1.md)） |
| 非生产 `dev_*` Preview | **`npm run preview:remote`** |

勿在 Dashboard 写裸 `npx wrangler deploy` / `npx cf deploy`（换 CLI 时只改仓内 `deploy:upload`）。

成功后对 `GET {preview}/health` 冒烟（`{ "ok": true, "worker": "mok1" }`）。


本地：`.dev.vars`（gitignore）同名键。缺 token 时探针返回 401 / SDK `failReason=config`，不会静默打 BOR1。

## 自定义域 + Access

Preview 走 `*.previews.mailworld.uk`（或团队约定域）+ Zero Trust Access；**不要**为 Agent 打开裸 `workers_dev` 绕过 WAF。

## 本地（可选）

```bash
npm ci
npm run preview:remote
# 或 npm run deploy:upload -- --dry-run
```

ADLC 主路径仍是 **Workers Builds 云端**。
