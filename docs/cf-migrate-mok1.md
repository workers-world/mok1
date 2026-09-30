# mok1：Wrangler → cf 迁移备忘（WW-31）

试点步骤，供后续 Worker 照抄。细节见 [官方 Migrate](https://developers.cloudflare.com/cf/wrangler/migrate/)。

## Checklist

1. **前置**：`wrangler` ≥ 4.136.0；`git` 工作区干净（有改动先单独 commit）；本机已有 `cf` CLI
2. **迁移**：`cf migrate --dry-run` → `cf migrate` → 处理 `cloudflare.config.ts`（删 `throw` / TODO，核对 `ctx.isPreview` 与原 `[previews.*]`）
3. **仓库改动**：`package.json` scripts → `cf dev` / `cf deploy` / `preview: cf previews deploy`；新增 `cloudflare.config.ts`、`wrangler.config.ts`、`cf` devDependency；更新 `docs/previews.md`
4. **验证**：`npm run check`、`npm test`、`npx cf deploy --dry-run`
5. **Cloudflare Builds**：非生产 Preview → `npx cf previews deploy`；生产 Deploy → `npx cf deploy`；冒烟 `GET {url}/health`
6. **回滚**：删 `cloudflare.config.ts` / `wrangler.config.ts`，scripts 改回 `wrangler *`，卸 `cf`；保留的 `wrangler.toml` 可继续用
