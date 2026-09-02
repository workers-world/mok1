import { expect } from 'vitest';

/**
 * 模拟 Cloudflare Ai binding：run() 为 class method，detached 调用会丢失 this。
 * 来源：cloudflare/workspace#e6fcbc9；llm-gateway 2026-09-02 #options 事故。
 */
export class AiBindingMock {
    #options: unknown;

    async run(
        _model: string,
        _inputs: Record<string, unknown>,
        options?: unknown,
    ): Promise<{ response: string }> {
        this.#options = options;
        return { response: 'ok' };
    }

    capturedOptions(): unknown {
        return this.#options;
    }
}

/** detached class method 调用应抛错（与生产 binding 行为一致） */
export async function expectDetachedRunThrows(
    run: (
        model: string,
        inputs: Record<string, unknown>,
        options?: unknown,
    ) => Promise<unknown>,
): Promise<void> {
    await expect(
        run('dynamic/invest-fallback', { messages: [{ role: 'user', content: 'hi' }] }, {}),
    ).rejects.toThrow();
}
