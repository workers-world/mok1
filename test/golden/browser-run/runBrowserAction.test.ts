/**
 * 黄金案例：browser-run（BOR1）SDK 契约（mock Fetcher，不烧真实 Browser）
 * source: framework_sdk_worker/browser → browser-run /internal/v1/*
 */
import { runBrowserAction } from 'framework_sdk_worker/browser';
import { describe, expect, it } from 'vitest';

describe('browser-run.runBrowserAction', () => {
    it('returns config error without SVC_BROWSER_RUN', async () => {
        const result = await runBrowserAction({}, 'markdown', { url: 'https://example.com' });
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.failReason).toBe('config');
            expect(result.error).toContain('SVC_BROWSER_RUN');
        }
    });

    it('posts Bearer to /internal/v1/markdown', async () => {
        const calls: Array<{ url: string; init: RequestInit }> = [];
        const fetcher = {
            fetch: async (url: string, init?: RequestInit) => {
                calls.push({ url, init: init ?? {} });
                return new Response(JSON.stringify({ ok: true, result: '# Example' }), {
                    status: 200,
                    headers: { 'X-Browser-Engine': 'chromium' },
                });
            },
        } as unknown as Fetcher;

        const result = await runBrowserAction(
            { SVC_BROWSER_RUN: fetcher, BROWSER_RUN_AUTH_TOKEN: 'tok' },
            'markdown',
            { url: 'https://example.com', caller: 'mok1:golden' },
        );

        expect(result.ok).toBe(true);
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe('https://browser-run/internal/v1/markdown');
        const headers = calls[0].init.headers as Record<string, string>;
        expect(headers.Authorization).toBe('Bearer tok');
        expect(headers['X-Caller']).toBe('mok1:golden');
    });

    it('maps 429 to rate_limit', async () => {
        const fetcher = {
            fetch: async () =>
                new Response(JSON.stringify({ ok: false, code: 'rate_limit', error: 'busy' }), {
                    status: 429,
                    headers: { 'Retry-After': '15' },
                }),
        } as unknown as Fetcher;

        const result = await runBrowserAction(
            { SVC_BROWSER_RUN: fetcher, BROWSER_RUN_AUTH_TOKEN: 'tok' },
            'pdf',
            { html: '<p>x</p>' },
        );
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.failReason).toBe('rate_limit');
            expect(result.retryAfterSec).toBe(15);
        }
    });

    it('maps 422 to render_error', async () => {
        const fetcher = {
            fetch: async () =>
                new Response(JSON.stringify({ ok: false, code: 'render_error', error: 'bad' }), {
                    status: 422,
                }),
        } as unknown as Fetcher;

        const result = await runBrowserAction(
            { SVC_BROWSER_RUN: fetcher, BROWSER_RUN_AUTH_TOKEN: 'tok' },
            'screenshot',
            { url: 'https://example.com' },
        );
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.failReason).toBe('render_error');
        }
    });
});
