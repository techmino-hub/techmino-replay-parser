import { parseReplayFromRepString } from './src/techmino-replay-parser';
import { type GameReplayData } from './src/types';
import { readFileSync, readdirSync } from 'fs';

const replayFiles = readdirSync('./tests/replays', {
    withFileTypes: false
}) as string[];

console.log(`Running ${replayFiles.length} tests...`);

const promises: Promise<string>[] = replayFiles.map(async (filename) => {
    const buf = readFileSync(`./tests/replays/${filename}`).toString('base64');

    try {
        const replayObj = await parseReplayFromRepString(buf);
        
        const expectedJson = readFileSync(`./tests/expected/${filename}.json`, 'utf8');
        const expected = JSON.parse(expectedJson) as GameReplayData;

        // check if replayobj contains all the keys and values in expected
        Object.keys(expected).forEach((key) => {
            if (expected[key] !== replayObj[key]) {
                return `FAIL: ${filename} - '${key}' of '${replayObj[key]}' does not match expected '${expected[key]}'`;
            }
        });
    } catch (e) {
        return `FAIL: ${filename} - ${e}`;
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