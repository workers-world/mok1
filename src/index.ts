import { Hono } from 'hono';
import type { Env } from './env.js';

export type { Env };

/** 与 package.json version 对齐，供冒烟 /health 诊断 */
export const WORKER_VERSION = '0.0.1';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true, worker: 'mok1', version: WORKER_VERSION }));

export default app;
