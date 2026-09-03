/**
 * 黄金案例：invest-rss-worker enrichment 走 chatInvest + caller
 * source: invest-rss-worker LLM enrichment 路径（SVC_LLM_GATEWAY → /v1/chat/invest）
 */
import { chatInvest } from 'framework_sdk_worker/ai/client';
import { describe, expect, it } from 'vitest';

describe('invest-rss.chat-invest-client', () => {
    it('posts to /v1/chat/invest with X-Caller', async () => {
        const calls: Array<{ url: string; init: RequestInit }> = [];
        const fetcher = {
            fetch: async (url: string, init?: RequestInit) => {
                calls.push({ url, init: init ?? {} });
                return new Response(
                    JSON.stringify({
                        choices: [{ message: { role: 'assistant', content: '{"summary":"ok"}' } }],
                    }),
                    { status: 200 },
                );
            },
        } as unknown as Fetcher;

        const result = await chatInvest(
            { SVC_LLM_GATEWAY: fetcher, LLM_GATEWAY_AUTH_TOKEN: 'tok' },
            {
                caller: 'invest-rss-worker:analyze-event',
                model: 'dynamic/invest-fallback',
                messages: [{ role: 'user', content: 'enrich event' }],
                response_format: { type: 'json_object' },
            },
        );

        expect(result.ok).toBe(true);
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe('https://llm/v1/chat/invest');
        const headers = calls[0].init.headers as Record<string, string>;
        expect(headers['X-Caller']).toBe('invest-rss-worker:analyze-event');
        expect(headers.Authorization).toBe('Bearer tok');
    });
});
