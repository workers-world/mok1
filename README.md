# mok1

**worker-actions 冒烟靶 + SDK 黄金案例宿主**

最小 hello-world Worker：`GET /health` → `{ "ok": true, "worker": "mok1" }`。

- **冒烟**：验证 [worker-actions](https://github.com/workers-world/worker-actions) Release PR 全链路
- **黄金案例**：[`test/golden/`](test/golden/) 按业务 Worker 存放 SDK 消费契约测试；`framework_sdk_worker` publish 后自动触发 [`golden-verify`](.github/workflows/golden-verify.yml)

## 本地

```bash
npm ci
npm run check
npm test              # health + golden
npm run test:golden   # 仅黄金案例
```

## 黄金案例

见 [`test/golden/README.md`](test/golden/README.md)。新增案例：在对应 Worker 子目录加 `*.test.ts` 并登记 `manifest.yaml`。

## CI 前置（Org）

- Secret `GHA_TOKEN`（PAT，`repo` + `read:packages`）
- Variable `GHA_RUNNER`（自托管 runner 标签，可选）
- Variable `QODANA_ENABLED=true`（启用 Qodana job）

## 分支

开发轨：`dev_00_01_00` → Release PR → `master`。
