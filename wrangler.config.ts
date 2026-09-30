import { defineWranglerConfig } from "wrangler/experimental-config";

/** Wrangler bundler 侧配置（从 wrangler.toml 迁出的 upload_source_maps 等）。 */
export default defineWranglerConfig({
	uploadSourceMaps: true,
	types: {
		generate: false,
	},
});
