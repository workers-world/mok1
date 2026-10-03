/**
 * mok1 固定 Browser 案例（白名单 id，禁止任意 URL 代理）。
 */
import { type BrowserActionResult, runBrowserAction } from 'framework_sdk_worker/browser';
import type { Env } from '../env.js';

export type BrowserCaseId = 'markdown-example' | 'markdown-hn' | 'pdf-html' | 'screenshot-example';

export const BROWSER_CASE_IDS: BrowserCaseId[] = [
    'markdown-example',
    'markdown-hn',
    'pdf-html',
    'screenshot-example',
];

export function isBrowserCaseId(raw: string): raw is BrowserCaseId {
    return (BROWSER_CASE_IDS as string[]).includes(raw);
}

export interface BrowserCaseOutcome {
    id: BrowserCaseId;
    ok: boolean;
    failReason?: string;
    error?: string;
    engine?: string;
    browserMsUsed?: number;
    /** 摘要：正文长度或字节数，勿回传全文 */
    summary?: string;
}

function summarize(result: BrowserActionResult): BrowserCaseOutcome['summary'] {
    if (!result.ok) {
        return undefined;
    }
    if (result.action === 'markdown') {
        return `textLen=${result.text.length}`;
    }
    return `bytes=${result.bytes.byteLength};ct=${result.contentType}`;
}

function passCheck(result: BrowserActionResult): boolean {
    if (!result.ok) {
        return false;
    }
    if (result.action === 'markdown') {
        return result.text.length > 0;
    }
    if (result.action === 'pdf') {
        const head = new Uint8Array(result.bytes.slice(0, 4));
        return (
            result.bytes.byteLength > 0 &&
            head[0] === 0x25 &&
            head[1] === 0x50 &&
            head[2] === 0x44 &&
            head[3] === 0x46
        );
    }
    // png
    const head = new Uint8Array(result.bytes.slice(0, 4));
    return (
        result.bytes.byteLength > 0 &&
        head[0] === 0x89 &&
        head[1] === 0x50 &&
        head[2] === 0x4e &&
        head[3] === 0x47
    );
}

export async function runBrowserCase(env: Env, id: BrowserCaseId): Promise<BrowserCaseOutcome> {
    let result: BrowserActionResult;
    switch (id) {
        case 'markdown-example':
            result = await runBrowserAction(env, 'markdown', {
                url: 'https://example.com',
                caller: 'mok1:browser-case',
            });
            break;
        case 'markdown-hn':
            result = await runBrowserAction(env, 'markdown', {
                url: 'https://news.ycombinator.com',
                caller: 'mok1:browser-case',
            });
            break;
        case 'pdf-html':
            result = await runBrowserAction(env, 'pdf', {
                html: '<html><body><h1>mok1 pdf probe</h1><p>hello</p></body></html>',
                caller: 'mok1:browser-case',
            });
            break;
        case 'screenshot-example':
            result = await runBrowserAction(env, 'screenshot', {
                url: 'https://example.com',
                caller: 'mok1:browser-case',
            });
            break;
        default: {
            const _exhaustive: never = id;
            throw new Error(`unknown case ${_exhaustive}`);
        }
    }

    if (!result.ok) {
        return {
            id,
            ok: false,
            failReason: result.failReason,
            error: result.error,
            engine: result.engine,
        };
    }

    const ok = passCheck(result);
    return {
        id,
        ok,
        failReason: ok ? undefined : 'quality_rejected',
        error: ok ? undefined : 'case content failed magic/length check',
        engine: result.engine,
        browserMsUsed: result.browserMsUsed,
        summary: summarize(result),
    };
}
