import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WORKFLOWS_DIR = '.github/workflows';

/** Outer reusable-workflow pins: workers-world/worker-actions/...@actions/v* */
const PIN_RE =
    /uses:\s*workers-world\/worker-actions\/\.github\/workflows\/[\w.-]+\.yml@(actions\/v[\w.+-]+)/g;

/**
 * Tags that were bumped into callers but never published (or were deleted).
 * #181: actions/v0.2.60 404; gap after v0.2.59 until v0.2.65. v0.2.66 was deleted.
 */
const UNPUBLISHED_OR_DELETED_PINS = new Set([
    'actions/v0.2.60',
    'actions/v0.2.61',
    'actions/v0.2.62',
    'actions/v0.2.63',
    'actions/v0.2.64',
    'actions/v0.2.66',
]);

type PinHit = { file: string; pin: string };

function collectPins(): PinHit[] {
    const hits: PinHit[] = [];
    for (const name of readdirSync(WORKFLOWS_DIR)) {
        if (!name.endsWith('.yml') && !name.endsWith('.yaml')) continue;
        const file = join(WORKFLOWS_DIR, name);
        const text = readFileSync(file, 'utf8');
        for (const match of text.matchAll(PIN_RE)) {
            hits.push({ file, pin: match[1]! });
        }
    }
    return hits;
}

describe('worker-actions reusable workflow pins', () => {
    it('ci / planning-release / sync-default-branch share one published-style pin', () => {
        const pins = collectPins();
        expect(pins.map((p) => p.file).sort()).toEqual([
            '.github/workflows/ci.yml',
            '.github/workflows/planning-release.yml',
            '.github/workflows/sync-default-branch.yml',
        ]);

        const unique = [...new Set(pins.map((p) => p.pin))];
        expect(unique, JSON.stringify(pins)).toHaveLength(1);
        expect(unique[0]).toMatch(/^actions\/v\d+\.\d+\.\d+$/);
    });

    it('does not pin known-unpublished or deleted actions/v* tags (#181)', () => {
        for (const { file, pin } of collectPins()) {
            expect(UNPUBLISHED_OR_DELETED_PINS.has(pin), `${file} → ${pin}`).toBe(false);
        }
    });

    it('pin tag resolves on workers-world/worker-actions', () => {
        const pin = collectPins()[0]?.pin;
        expect(pin).toBeTruthy();

        const stdout = execFileSync(
            'git',
            [
                'ls-remote',
                '--tags',
                'https://github.com/workers-world/worker-actions.git',
                `refs/tags/${pin}`,
            ],
            { encoding: 'utf8', timeout: 60_000 },
        );
        expect(stdout.trim().length, `git ls-remote found no refs/tags/${pin}`).toBeGreaterThan(0);
    });
});
