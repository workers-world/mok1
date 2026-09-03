/**
 * 黄金案例：llm-gateway-worker 经 SDK callAiModel 调 env.AI
 * source: llm-gateway-worker/src/services/ai.ts → runChatCompletion → callAiModel
 * incident: 2026-09-02 Cannot set properties of undefined (setting '#options')
 */
import { callAiModel } from 'framework_sdk_worker/ai';
import { describe, expect, it } from 'vitest';
import { AiBindingMock, expectDetachedRunThrows } from '../_harness/ai-binding-mock.js';

describe('llm-gateway.callAiModel-binding', () => {
    it('detached ai.run loses this (regression guard)', async () => {
        const binding = new AiBindingMock();
        await expectDetachedRunThrows(binding.run);
    });

    it('callAiModel preserves binding this through gateway options', async () => {
        const binding = new AiBindingMock();
        const inputs = { messages: [{ role: 'user', content: 'hi' }] };
        const result = await callAiModel(
            binding as unknown as Ai,
            'dynamic/invest-fallback',
            inputs,
            { gatewayId: 'gtw_invest' },
        );
        expect(result).toEqual({ response: 'ok' });
        expect(binding.capturedOptions()).toEqual(
            expect.objectContaining({ gateway: { id: 'gtw_invest' } }),
        );
    });
});
