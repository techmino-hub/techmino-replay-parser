# Techmino Replay Parser

A TypeScript parser for Techmino base64-encoded replays.  
This parser is based on Techmino's algorithm used to parse the replays, available [here](https://github.com/26F-Studio/Techmino/blob/v0.17.17/parts/data.lua).

Credits to [SweetSea](https://github.com/SweetSea-ButImNotSweet) for helping me verify the results using [their own parser written in Python](https://github.com/26F-Studio/Techmino/discussions/1071)!  
They also helped as a reference for the very early versions before the parser was completely remade, with Techmino's code as a reference.

## Building

You'll need [Node.js](https://nodejs.org/) (or any Node alternatives) to build this project. (I personally use Bun for its unmatched speed.)  

```bash
npm install
npm run build
```

## Usage

You can grab the TypeScript version in `/src/`, or the JavaScript version in `/dist/`.  

If in a browser context, it automatically injects its exports into `window.TechminoReplayParser`. (Not sure why, but ESBuild doesn't really like to export.)  

Sample code is available in the `demo-file.html` and `demo-b64.html` files.

```ts
// Getting replay data from `.rep` file
import { parseReplayFromBuffer, type GameReplayData } from 'techmino-replay-parser';

// Binary encoded replay file.
// It's the one in `(Techmino save dir)/replay/`.
const compressedRepFile: File = '...';

// We first convert it to an array buffer.
const arrayBuffer: ArrayBuffer = compressedRepFile.arrayBuffer();

// Then we convert it to a Uint8Array.
const buffer = new Uint8Array(arrayBuffer);

// Then we get the replay data.
const replayData: GameReplayData = await parseReplayFromBuffer(buffer);

console.log(replayData);
```

```ts
// Getting replay data from pasted base64 string
// (You can get this by pressing te export button in Techmino's replay list)
import { parseReplayFromRepString, type GameReplayData } from 'techmino-replay-parser';

// Base64 encoded replay data.
const base64Replay: string = '...';

const replayData: GameReplayData = await parseReplayFromRepString(base64);

console.log(replayData);
```