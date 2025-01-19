import {
    createReplayString,
    GameReplayMetadata,
    InputKey,
    type GameInputEvent
} from '../src/index.ts';
import { displayTime, nanoseconds, randMaker, requestPerms } from "./test-common.ts";

requestPerms(false);

const lengths = [
    0,
    100,
    1000,
    5000,
    25000,
    100000,
    1e6,
    2.3e6
];

const versions = [
    "v0.17.22",
    "v0.17.21",
];

function generateRandomKey(rnd: () => number): InputKey {
    const index = Math.floor(rnd()*(Object.keys(InputKey).length-1)+1);
    const key = Object.keys(InputKey)[index] as keyof typeof InputKey;

    return InputKey[key];
}

function generateInputs(length: number, seed?: number): GameInputEvent[] {
    const rnd = randMaker(seed);

    const list = [] as GameInputEvent[];
    let prevFrame = 150;

    for(let i = 0; i < length; i++) {
        const frame = Math.floor(30 * rnd() + prevFrame)
        prevFrame = frame;
        list.push({
            frame,
            type: rnd() >= 0.5 ? 1 : 0,
            key: generateRandomKey(rnd),
        });Math.floor(30 * rnd() + prevFrame)
    }

    return list;
}

console.log("Benchmarking replay encoding...");

type BenchResult = {
    inputs: number;
    strlen: number;
    gameVer: string;
    duration: string;
    microsPerInput: string;
}

const results = [] as BenchResult[];

for(const length of lengths) {
    const inputs = generateInputs(length);

    for(const version of versions) {
        const startTime = nanoseconds();
        const str = createReplayString({
            metadata: {
                version
            } as GameReplayMetadata,
            inputs
        });
        const endTime = nanoseconds();

        const duration = endTime - startTime;
        
        results.push({
            inputs: inputs.length,
            strlen: str.length,
            gameVer: version,
            duration: displayTime(duration),
            microsPerInput:
                inputs.length === 0 ?
                    "---" :
                    (duration / inputs.length / 1000).toFixed(3)
        });
    }
}

console.table(results);