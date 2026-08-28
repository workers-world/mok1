import { describe, expect, it } from 'vitest';
import app from '../src/index.js';

describe('MOK1 health', () => {
    it('GET /health returns json', async () => {
        const res = await app.fetch(new Request('http://localhost/health'));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, worker: 'MOK1' });
    });
});
