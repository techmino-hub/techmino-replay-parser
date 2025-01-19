import { GameReplayMetadata, parseReplayFromRepString } from '../src/index.ts';
import { type Testcase, requestPerms } from './test-common.ts';
import { readFileSync, readdirSync } from 'node:fs';

requestPerms(true);

const replayFiles = (readdirSync('./tests/testcases', {
    withFileTypes: false
}) as string[]);

console.log(`Running ${replayFiles.length} tests...`);

const results: string[] = replayFiles.map((filename) => {
    const test = JSON.parse(readFileSync(`./tests/testcases/${filename}`).toString()) as Testcase;

    const replayStr = test.replay;
    const expected = test.expected;

    const result = parseReplayFromRepString(replayStr);

    if (expected.inputs) {
        if (typeof result.inputs !== typeof expected.inputs) {
            return `FAIL: ${filename} - inputs is of type ${typeof result.inputs}, expected ${typeof expected.inputs}`;
        }

        if (JSON.stringify(expected.inputs) !== JSON.stringify(result.inputs)) {
            return `FAIL: ${filename} - inputs is ${JSON.stringify(result.inputs)} but expected ${JSON.stringify(expected.inputs)}`;
        }
    }

    if (expected.metadata) {
        for (const key of Object.keys(expected.metadata) as (keyof GameReplayMetadata)[]) {
            if (!(key in result.metadata)) {
                return `FAIL: ${filename} - metadata.${key} is missing`;
            }

            if (typeof result.metadata[key] !== typeof expected.metadata[key]) {
                return `FAIL: ${filename} - metadata.${key} is of type ${typeof result.metadata[key]}, expected type ${typeof expected.metadata[key]}`;
            }

            if (typeof result.metadata[key] === 'object') {
                if (JSON.stringify(expected.metadata[key]) !== JSON.stringify(result.metadata[key])) {
                    return `FAIL: ${filename} - metadata.${key} is ${JSON.stringify(result.metadata[key])}, expected ${JSON.stringify(expected.metadata[key])}`;
                }
            } else {
                if (expected.metadata[key] !== result.metadata[key]) {
                    return `FAIL: ${filename} - metadata.${key} is ${result.metadata[key]}, expected ${expected.metadata[key]}`;
                }
            }
        }
    }

    return `PASS: ${filename}`;
});

const fails = results.filter((r) => r.startsWith('FAIL'));

if (fails.length > 0) {
    console.error(fails.join('\n'));
    console.error('\n\n\n');
    throw new Error(`${fails.length} tests failed\n${results.length - fails.length} tests passed`);
}

console.log('All tests passed!');