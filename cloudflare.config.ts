import { defineConfig } from "cf/config";

/**
 * mok1 Worker 配置（cf）。
 * Preview：`ctx.isPreview` 分支保留 observability；Service Binding 仍可能打生产 BOR1。
 * @see docs/previews.md
 * @see docs/cf-migrate-mok1.md
 */
export default defineConfig((ctx) => {
	const shared = {
		name: "mok1",
		compatibilityDate: "2026-08-04" as const,
		entrypoint: "src/index.ts",
		workersDev: false,
		services: [
			{
				binding: "SVC_BROWSER_RUN",
				service: "browser-run",
			},
		],
		// 公开仓不绑 Secrets Store；BROWSER_RUN_AUTH_TOKEN / RULES_ADMIN_TOKEN
		// 用 Dashboard 或 `wrangler secret put`（见 docs/previews.md）
	};

	if (ctx.isPreview) {
		return {
			worker: {
				...shared,
				observability: {
					logs: {
						enabled: true,
						headSamplingRate: 1,
						invocationLogs: true,
						persist: true,
					},
					traces: {
						enabled: true,
						headSamplingRate: 1,
						persist: true,
					},
				},
			},
		};
	}
	return {
		worker: {
			...shared,
			observability: {
				enabled: true,
				traces: {
					enabled: true,
				},
			},
		},
	};
});
