/**
 * 黄金案例：email-rule-worker 摘要前检查熔断 + chatGeneral 契约
 * source: email-rule-worker/src/services/summarize.ts callLlmOnce
 */
import { chatGeneral } from 'framework_sdk_worker/ai/client';
import {
    isCircuitOpen,
    recordCircuitFailure,
    recordCircuitSuccess,
} from 'framework_sdk_worker/resilience/circuit-breaker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CIRCUIT = 'golden-email-rule-llm';

describe('email-rule.llm-circuit-skip', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        recordCircuitSuccess(CIRCUIT);
    });

    afterEach(() => {
        vi.useRealTimers();
        recordCircuitSuccess(CIRCUIT);
    });

    it('opens in-memory circuit after three failures (summarize 跳过模式)', () => {
        recordCircuitFailure(CIRCUIT);
        recordCircuitFailure(CIRCUIT);
        expect(isCircuitOpen(CIRCUIT)).toBe(false);
        recordCircuitFailure(CIRCUIT);
        expect(isCircuitOpen(CIRCUIT)).toBe(true);
    });

    it('chatGeneral returns ok:false without binding instead of throwing', async () => {
        const resp = await chatGeneral(
            {},
            {
                model: '@cf/zai-org/glm-4.7-flash',
                messages: [{ role: 'user', content: 'summarize' }],
                caller: 'email-rule-worker:summarize',
            },
        );
        expect(resp.ok).toBe(false);
        expect(resp.error).toContain('SVC_LLM_GATEWAY');
    });
});
