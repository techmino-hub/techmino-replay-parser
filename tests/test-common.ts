import { type GameReplayData } from "../src/index.ts";
import process from "node:process";

export type Testcase = {
    replay: string;
    expected: Partial<GameReplayData>;
}

export function randMaker(seed = 626) {
    let state = seed;
    return function() {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;

        return (state >>> 0) / 2 ** 32;
    }
}

export function displayTime(ns: number): string {
    return `${(ns / 1e6).toFixed(3)} ms`;
}

export const nanoseconds = (() => {
    if(typeof process.versions.bun !== 'undefined') {
        const _globalThis = globalThis as unknown as {
            Bun: {
                nanoseconds: () => number
            }
        };
        return _globalThis.Bun.nanoseconds;
    } else if ('hrtime' in process) {
        return function() {
            const [seconds, nanoseconds] = process.hrtime();
            return seconds * 1e9 + nanoseconds;
        }
    } else {
        return function() {
            return performance.now() * 1e6;
        }
    }
})();

export function requestPerms(withRead: boolean) {
    if ('Deno' in globalThis) {
        const _globalThis = globalThis as unknown as {
            Deno: {
                permissions: {
                    requestSync: (desc: { name: string, [key: string]: unknown }) => { state: "granted" | "denied" }
                }
            }
        };

        if (withRead) {
            const response = _globalThis.Deno.permissions.requestSync({name: "read", path: "./tests/testcases"});

            if (response.state == "denied") {
                throw new Error("Read permission is required to run tests. Rerun the test with '--allow-read' or the '-R' flag.");
            }
        }
    }
}