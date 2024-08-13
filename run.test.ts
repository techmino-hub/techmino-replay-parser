import { parseReplayFromRepString } from './src/techmino-replay-parser';
import { type GameReplayData } from './src/types';
import { readFileSync, readdirSync } from 'fs';

const replayFiles = readdirSync('./tests', {
    withFileTypes: false
}) as string[];

console.log(`Running ${replayFiles.length} tests...`);

const promises: Promise<string>[] = replayFiles.map(async (filename) => {
    const test = JSON.parse(readFileSync(`./tests/${filename}`).toString()) as Record<string, any>;

    const replayStr = test.replay;
    const expected = test.expected as GameReplayData;

    const replay = await parseReplayFromRepString(replayStr);

    for(const key in expected) {
        switch(typeof expected[key]) {
            case 'number':
            case 'string':
            case 'boolean':
                if (expected[key] !== replay[key]) {
                    return `FAIL: ${filename} - ${key} is ${replay[key]} but expected ${expected[key]}`;
                }
                break;
            case 'object':
                if (JSON.stringify(expected[key]) !== JSON.stringify(replay[key])) {
                    return `FAIL: ${filename} - ${key} is ${JSON.stringify(replay[key])} but expected ${JSON.stringify(expected[key])}`;
                }
                break;
        }
    }

    return `PASS: ${filename}`;
})

const results: string[] = await Promise.all(promises);

const fails = results.filter((r) => r.startsWith('FAIL'));

if (fails.length > 0) {
    console.error(fails.join('\n'));
    console.error('\n\n\n');
    throw new Error(`${fails.length} tests failed\n${results.length - fails.length} tests passed`);
}

console.log('All tests passed!');