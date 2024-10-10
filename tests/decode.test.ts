import { parseReplayFromRepString, type GameReplayData } from '../src/index.ts';
import { type Testcase } from './test-common.ts';
import { readFileSync, readdirSync } from 'node:fs';

const replayFiles = readdirSync('./tests/testcases', {
    withFileTypes: false
}) as string[];

console.log(`Running ${replayFiles.length} tests...`);

const results: string[] = replayFiles.map((filename) => {
    const test = JSON.parse(readFileSync(`./tests/testcases/${filename}`).toString()) as Testcase;

    const replayStr = test.replay;
    const expected = test.expected as GameReplayData;

    const result = parseReplayFromRepString(replayStr);

    for(const key of Object.keys(expected)) {
        if(typeof result[key] !== typeof expected[key]) {
            return `FAIL: ${filename} - ${key} is of type ${typeof result[key]}, expected ${typeof expected[key]}`;
        }

        if(typeof result[key] === 'object' && result[key] !== null) {
            if(JSON.stringify(expected[key]) !== JSON.stringify(result[key])) {
                return `FAIL: ${filename} - ${key} is ${JSON.stringify(result[key])} but expected ${JSON.stringify(expected[key])}`;
            }
        } else {
            if (expected[key] !== result[key]) {
                return `FAIL: ${filename} - ${key} is ${result[key]} but expected ${expected[key]}`;
            }
        }
    }

    return `PASS: ${filename}`;
})

const fails = results.filter((r) => r.startsWith('FAIL'));

if (fails.length > 0) {
    console.error(fails.join('\n'));
    console.error('\n\n\n');
    throw new Error(`${fails.length} tests failed\n${results.length - fails.length} tests passed`);
}

console.log('All tests passed!');