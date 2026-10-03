import { createBearerAuthMiddleware } from 'framework_sdk_worker/auth';
import { registerNotFoundRoute } from 'framework_sdk_worker/hono';
import { Hono } from 'hono';
import type { Env } from './env.js';
import { BROWSER_CASE_IDS, isBrowserCaseId, runBrowserCase } from './services/browser-cases.js';

export type { Env };

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true, worker: 'mok1' }));

app.get('/internal/v1/browser-cases', (c) => c.json({ cases: BROWSER_CASE_IDS }));

app.use(
    '/internal/v1/browser-cases/*',
    createBearerAuthMiddleware('RULES_ADMIN_TOKEN', {
        requireConfigured: true,
        skipFlagEnvKey: 'MOK1_SKIP_ADMIN_AUTH',
        missingConfigMessage: 'RULES_ADMIN_TOKEN not configured',
    }) as never,
);

app.post('/internal/v1/browser-cases/:id', async (c) => {
    const id = c.req.param('id');
    if (!isBrowserCaseId(id)) {
        return c.json(
            {
                ok: false,
                error: `unknown case id; allowed=${BROWSER_CASE_IDS.join(',')}`,
                code: 'unknown_case',
            },
            400,
        );
    }
    const outcome = await runBrowserCase(c.env, id);
    return c.json(outcome, outcome.ok ? 200 : 502);
});

registerNotFoundRoute(app);

export default app;
