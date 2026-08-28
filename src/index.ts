import { Hono } from 'hono';
import type { Env } from './env.js';

export type { Env };

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true, worker: 'MOK1' }));

export default app;
