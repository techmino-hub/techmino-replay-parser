import {
    createReplayString,
    InputKey,
    type GameInputEvent,
    type GameReplayData
} from '../src/index.ts';
import { displayTime, randMaker } from "./test-common.ts";

if(typeof globalThis.Bun === "undefined") {
    throw "This benchmark needs to be run in Bun: https://bun.sh";
}

const Bun = globalThis.Bun as {
    nanoseconds: () => number
};

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
            key: InputKey[Object.keys(InputKey)[Math.floor(rnd()*(Object.keys(InputKey).length-1)+1)]]
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

let results = [] as BenchResult[];

for(const length of lengths) {
    const inputs = generateInputs(length);

    for(const version of versions) {
        const startTime = Bun.nanoseconds();
        const str = createReplayString({version} as GameReplayData, inputs);
        const endTime = Bun.nanoseconds();

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