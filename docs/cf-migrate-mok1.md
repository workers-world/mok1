# Wrangler → cf 迁移（mok1 试点 / WW-31）

通用步骤供后续 Worker 照抄。API 细节见 [官方 Migrate](https://developers.cloudflare.com/cf/wrangler/migrate/)。

## 涉及文件与作用

| 文件 | 迁移后角色 | 谁读 |
|------|------------|------|
| **`cloudflare.config.ts`** | **主配置**：Worker 名、入口、`compatibilityDate`、bindings、observability 等；Preview 用 `ctx.isPreview` 分支 | `cf dev` / `cf deploy` / `cf previews deploy` |
| **`wrangler.config.ts`** | **Bundler 侧**：`uploadSourceMaps` 等 | `cf` 委托 Wrangler bundler 时 |
| **`wrangler.toml`** | **保留不动**：对照 + 回滚；`wrangler tail` 等仍可能读它 | 非 `cf *` 主路径 |
| **`package.json` scripts** | 门户见下表；实现 wrangler↔cf 在 `deploy:upload`（SDK bin） | npm / Builds |
| **`.cloudflare/`** | 构建产物；**gitignore** | 本地 / Builds |

### npm 门户脚本（Builds 接口尽量不变）

| 脚本 | Builds 是否调用 | 作用 |
|------|-----------------|------|
| **`deploy:remote`** | **推荐**（生产 Deploy command） | 仓钩子（D1 migrate 等）+ `deploy:upload`；mok1 无钩子时等同 upload |
| **`preview:remote`** | **推荐**（非生产 Preview） | → `preview:upload` |
| **`deploy:upload`** | 否 | `workers-deploy-worker`：有 `cloudflare.config.ts` → `cf deploy`，否则 `wrangler deploy` |
| **`preview:upload`** | 否 | `workers-preview-worker`：→ `cf previews deploy` / `wrangler preview` |
| **`deploy:cf`** | 可继续用（**alias**） | `npm run deploy:remote`；`:cf` = Cloudflare **部署阶段**，不是 `cf` CLI 名 |
| **`deploy`** | 否（本地） | mok1：`npm run deploy:remote`；有前端仓：`build && deploy:remote` |

依赖 `framework_sdk_worker` ≥ **0.4.30**（提供 `workers-deploy-worker` / `workers-preview-worker` bin）。

### `ctx.isPreview` 是什么

`cf` 加载配置时的上下文：`true` = Worker Preview 环境，`false` = 生产。原 `wrangler.toml` 的 `[previews.*]` 迁到 `cloudflare.config.ts` 的 `if (ctx.isPreview)` 分支。

## 通用步骤

1. **前置**：`wrangler` ≥ 4.136.0；git 干净；`npm ci`；本机可选 `cf` CLI
2. **迁移**：`cf migrate --dry-run` → `cf migrate` → 删 `throw`/TODO，核对 `isPreview`
3. **门户 scripts**：按上表接 SDK bin；`deploy:cf` 保留为 alias 即可
4. **验证**：`npm run check`、`npm test`、`npm run deploy:upload -- --dry-run`
5. **Cloudflare Builds（人操作，一次性）**
   - Build：不变（mok1 空 / `npm ci`）
   - Deploy：**`npm run deploy:remote`** 或 **`npm run deploy:cf`**
   - Preview：**`npm run preview:remote`**
   - 之后 wrangler→cf **只改仓内实现**，勿再改 Dashboard 裸 `npx wrangler deploy` / `npx cf deploy`
6. **回滚**：删 `cloudflare.config.ts` / `wrangler.config.ts`；upload 层自动回到 wrangler

## mok1 本轮结果

- 分支：`dev_00_02_00`；`#31` / `WW-31`
- 门户 + SDK 0.4.30；本地：`check` / `test` / `deploy:upload --dry-run`
