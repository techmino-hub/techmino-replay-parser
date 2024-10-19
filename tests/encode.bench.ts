import { createReplayString, GameReplayData, parseReplayFromRepString } from '../src/index.ts';
import { readdirSync, readFileSync } from "node:fs";
import { displayTime, type Testcase } from "./test-common.ts";

if(typeof globalThis.Bun === "undefined") {
    throw "This benchmark needs to be run in Bun: https://bun.sh";
}

const Bun = globalThis.Bun as {
    nanoseconds: () => number
};

const replayFiles = readdirSync('./tests/testcases', {
    withFileTypes: false
}) as string[];

console.log(`Benchmarking replay encoding with ${replayFiles.length} replays...`);

const itersPerTest = [
    1,
    10,
    100,
    1000
];

type BenchResult = {
    name: string;
    gameVer: string;
    strlen: number;
    length: number;
    iters: number;
    duration: string;
    durationPerIter: string;
}

let results = [] as BenchResult[];

for(const filename of replayFiles) {
    const testcase = JSON.parse(readFileSync(`./tests/testcases/${filename}`).toString()) as Testcase;

    process.stdout.write(`Processing: '${filename}'...`);

    const replay = testcase.replay;
    const replayData = parseReplayFromRepString(replay);
    const metadata =
        Object.fromEntries(
            Object.entries(replayData).filter(([key]) => key !== 'inputs')
        ) as GameReplayData;
    const inputs = replayData.inputs;

    for(const iters of itersPerTest) {
        const startTime = Bun.nanoseconds();
        for(let i = 0; i < iters; i++) {
            createReplayString(metadata, inputs);
        }
        const endTime = Bun.nanoseconds();

        results.push({
            name: filename,
            gameVer: metadata.version,
            strlen: replay.length,
            length: replayData.inputs.length,
            iters,
            duration: displayTime(endTime - startTime),
            durationPerIter: displayTime((endTime - startTime) / iters)
        });
    }

    console.log("done.");
}

console.table(results);