import { defineConfig } from "cf/config";

/**
 * mok1 Worker 配置（cf）。
 * Preview：`ctx.isPreview` 分支保留原 wrangler.toml `[previews.observability.*]`。
 * 生产：顶层 `[observability]` + traces。
 * @see docs/previews.md
 * @see docs/cf-migrate-mok1.md
 */
export default defineConfig((ctx) => {
	if (ctx.isPreview) {
		return {
			worker: {
				name: "mok1",
				compatibilityDate: "2026-08-04",
				entrypoint: "src/index.ts",
				workersDev: false,
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
			name: "mok1",
			compatibilityDate: "2026-08-04",
			entrypoint: "src/index.ts",
			workersDev: false,
			observability: {
				enabled: true,
				traces: {
					enabled: true,
				},
			},
		},
	};
});
