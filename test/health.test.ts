import { describe, expect, it } from 'vitest';
import app, { WORKER_VERSION } from '../src/index.js';

describe('mok1 health', () => {
    it('GET /health returns json with version', async () => {
        const res = await app.fetch(new Request('http://localhost/health'));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
            ok: true,
            worker: 'mok1',
            version: WORKER_VERSION,
        });
    });
});
