import type { SecretLike } from 'framework_sdk_worker/secrets';

/**
 * Env: smoke worker + BOR1 browser 探针。
 * 不绑 [browser]；经 SVC_BROWSER_RUN 调账号级网关。
 */
export interface Env {
    SVC_BROWSER_RUN?: Fetcher;
    BROWSER_RUN_AUTH_TOKEN?: SecretLike;
    /** 保护探针路由，防空烧 Browser 配额 */
    RULES_ADMIN_TOKEN?: SecretLike;
    ENVIRONMENT?: string;
    MOK1_SKIP_ADMIN_AUTH?: string;
}
