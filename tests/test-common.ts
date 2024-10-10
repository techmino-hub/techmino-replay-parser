import { type GameReplayData } from "../src/index.ts";

export type Testcase = {
    replay: string;
    expected: Partial<GameReplayData>;
}