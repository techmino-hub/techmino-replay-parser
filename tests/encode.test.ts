import { parseReplayFromRepString, createReplayString } from '../src/index.ts';
import { readFileSync, readdirSync } from 'node:fs';
import { requestPerms } from './test-common.ts';

requestPerms(true);

const replayFiles = readdirSync('./tests/testcases', {
    withFileTypes: false
}) as string[];

console.log(`Running ${replayFiles.length} tests...`);

// Test if parseReplayFromRepString and createReplayStringSync is a NOP
const results: string[] = replayFiles.map((filename) => {
    const test = JSON.parse(readFileSync(`./tests/testcases/${filename}`).toString()) as Record<string, string>;

    const replayStr = test.replay;
    const parsed = parseReplayFromRepString(replayStr);

    const stringified = createReplayString(parsed);

    const reparsed = parseReplayFromRepString(stringified);

    if (JSON.stringify(parsed) !== JSON.stringify(reparsed)) {
        return `FAIL: ${filename}\n` +
        `====================\n` +
        `Original:\n${JSON.stringify(parsed)}\n` +
        `------\n` +
        `Reparsed:\n${JSON.stringify(reparsed)}\n` +
        `====================`;
    } else {
        return `PASS: ${filename}`;
    }
});

const fails = results.filter((r) => r.startsWith('FAIL'));

if (fails.length > 0) {
    console.error(fails.join('\n'));
    console.error('\n\n\n');
    throw new Error(`${fails.length} tests failed\n${results.length - fails.length} tests passed`);
}

console.log('All tests passed!');