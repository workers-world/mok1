import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Manifest = {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

type Lockfile = {
    packages?: {
        ''?: {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };
        [key: string]:
            | {
                  version?: string;
                  dependencies?: Record<string, string>;
                  devDependencies?: Record<string, string>;
              }
            | undefined;
    };
};

function loadJson<T>(path: string): T {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** Extract trailing version from npm alias specs like `npm:@scope/pkg@1.2.3`. */
function trailingVersion(spec: string): string | undefined {
    const at = spec.lastIndexOf('@');
    if (at <= 0) return undefined;
    return spec.slice(at + 1);
}

describe('package-lock sync', () => {
    it('packages[""] mirrors package.json dependency declarations', () => {
        const pkg = loadJson<Manifest>('package.json');
        const lock = loadJson<Lockfile>('package-lock.json');
        const root = lock.packages?.[''];
        expect(root).toBeTruthy();

        for (const section of ['dependencies', 'devDependencies'] as const) {
            for (const [name, declared] of Object.entries(pkg[section] ?? {})) {
                expect(root?.[section]?.[name], `${section}.${name}`).toBe(declared);
            }
        }
    });

    it('framework_sdk_worker resolved version matches package.json pin', () => {
        const pkg = loadJson<Manifest>('package.json');
        const lock = loadJson<Lockfile>('package-lock.json');
        const declared = pkg.dependencies?.framework_sdk_worker;
        expect(declared).toBeTruthy();

        const version = trailingVersion(declared!);
        expect(version, `unparseable spec: ${declared}`).toBeTruthy();

        const entry = lock.packages?.['node_modules/framework_sdk_worker'];
        expect(entry?.version).toBe(version);
    });
});
