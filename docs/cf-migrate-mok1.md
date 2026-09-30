# Wrangler → cf 迁移（mok1 试点 / WW-31）

通用步骤供后续 Worker 照抄。API 细节见 [官方 Migrate](https://developers.cloudflare.com/cf/wrangler/migrate/)。

## 涉及文件与作用

| 文件 | 迁移后角色 | 谁读 |
|------|------------|------|
| **`cloudflare.config.ts`** | **主配置**：Worker 名、入口、`compatibilityDate`、bindings、observability、`workersDev` 等。用 `defineConfig((ctx) => …)`；有 Preview 覆盖时写 `if (ctx.isPreview)` 分支 | `cf dev` / `cf build` / `cf deploy` / `cf previews deploy` |
| **`wrangler.config.ts`** | **Bundler 侧**：从 toml 迁出的 `uploadSourceMaps`、`minify` 等（mok1 无 Vite 时仍委托 Wrangler esbuild） | `cf` 经 Wrangler bundler 调用时 |
| **`wrangler.toml`** | **保留不动**：对照 + 回滚；纯 Wrangler 命令（如 `wrangler tail`）仍可能读它。**不是** `cf *` 的权威源 | Wrangler 旧命令；人眼对照 |
| **`package.json`** | 增加 `cf` devDependency；scripts：`dev`→`cf dev`，`deploy`→`cf deploy`，可选 `preview`→`cf previews deploy` | npm / CI |
| **`package-lock.json`** | 锁定 `cf` 及传递依赖 | `npm ci` |
| **`docs/previews.md`**（若有） | Builds / 本地 Preview 命令改为 `cf previews deploy`；说明权威在 `cloudflare.config.ts` 的 `isPreview` | 人 / Agent |
| **`.cloudflare/`** | `cf` 构建输出（bundle 等）；应 **gitignore**，勿提交 | 本地 / Builds 产物 |

### `ctx.isPreview` 是什么

`cf` 加载配置时传入的上下文：`true` = 本次是 **Worker Preview**（非生产隔离环境），`false` = 普通 / 生产部署。

原先 toml 里的 `[previews.observability.*]` 等，迁后写进：

```ts
export default defineConfig((ctx) => {
  if (ctx.isPreview) {
    return { worker: { /* Preview 覆盖 */ } };
  }
  return { worker: { /* 生产默认 */ } };
});
```

## 通用步骤

1. **前置**
   - 本机已有 `cf` CLI（migrate 仍会在仓内加 `cf` devDependency）
   - 仓内 `wrangler` ≥ **4.136.0**（不足则先 bump 并**单独 commit**）
   - `git status` **干净**（有改动先 commit；`cf migrate` 遇脏树会拒绝写文件）
   - `npm ci`（或等价）装好依赖

2. **预览与执行**
   ```bash
   cf migrate --dry-run   # 看将改哪些文件 + follow-up
   cf migrate
   ```
   预期新增/改：`cloudflare.config.ts`、`wrangler.config.ts`、`package.json`、`package-lock.json`；**不改** `wrangler.toml`。

3. **处理 follow-up**
   - 删掉生成文件顶部的 `throw new Error("Migration incomplete…")` 与已解决的 `TODO(@cloudflare)`
   - 有 `[previews.*]`：核对 `ctx.isPreview` 分支是否等价
   - 有 D1/DO/Queue 等：按 dry-run 的 `[required]` 人工核对（mok1 无绑定）
   - `.gitignore` 加上 `.cloudflare/`（若尚未忽略）

4. **改 scripts 与文档**（migrate **默认不改** scripts）
   | 脚本 | 建议 |
   |------|------|
   | `dev` | `cf dev` |
   | `deploy` | `cf deploy`（生产仍人闸） |
   | `preview`（可选） | `cf previews deploy` |
   - 更新 Preview / README 中的 `wrangler preview` → `cf previews deploy`

5. **本地验证**
   ```bash
   npm run check
   npm test
   npx cf deploy --dry-run   # 无需凭证，验构建与配置
   ```

6. **Cloudflare Builds（人操作）**
   - 非生产分支 Preview：`npx cf previews deploy`
   - 生产 Deploy（若原为 wrangler）：`npx cf deploy`
   - 冒烟：`GET {url}/health`

7. **回滚**
   - 删 `cloudflare.config.ts`、`wrangler.config.ts`；scripts 改回 `wrangler *`；卸 `cf` 依赖
   - 保留的 `wrangler.toml` 可直接继续用 Wrangler

## mok1 本轮结果

- 分支：`dev_00_02_00`；Issue：`#31` / Linear `WW-31`
- 已迁：无 D1/KV/DO；`[previews.observability.*]` → `ctx.isPreview`；`upload_source_maps` → `wrangler.config.ts`
- 本地已过：`check` / `test` / `cf deploy --dry-run`
