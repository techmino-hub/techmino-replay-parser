import { createReplayString, parseReplayFromRepString } from '../src/index.ts';
import { readdirSync, readFileSync } from "node:fs";
import { displayTime, nanoseconds, requestPerms, type Testcase } from "./test-common.ts";
import process from "node:process";

requestPerms(true);

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

const results = [] as BenchResult[];

for(const filename of replayFiles) {
    const testcase = JSON.parse(readFileSync(`./tests/testcases/${filename}`).toString()) as Testcase;

    process.stdout.write(`Processing: '${filename}'...`);

    const replay = testcase.replay;
    const replayData = parseReplayFromRepString(replay);

    for(const iters of itersPerTest) {
        const startTime = nanoseconds();
        for(let i = 0; i < iters; i++) {
            createReplayString(replayData);
        }
        const endTime = nanoseconds();

        results.push({
            name: filename,
            gameVer: replayData.metadata.version,
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