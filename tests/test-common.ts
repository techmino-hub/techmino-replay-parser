import { type GameReplayData } from "../src/index.ts";

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