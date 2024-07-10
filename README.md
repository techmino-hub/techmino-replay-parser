# Techmino Replay Parser

A TypeScript parser for Techmino base64-encoded replays.  
This parser is based on [SweetSea-ButImNotSweet](https://github.com/SweetSea-ButImNotSweet)'s [replay extractor](https://github.com/26F-Studio/Techmino/discussions/1071).

## Building

You'll need [Node.js](https://nodejs.org/) (or any Node alternatives) to build this project. (I personally use Bun for its unmatched speed.)  

```bash
npm install
npm run build
```

## Usage

You can grab the TypeScript version in `/src/`, or the JavaScript version in `/dist/`.  

If in a browser context, it automatically injects its exports into `window.TechminoReplayParser`. (Not sure why, but ESBuild doesn't really like to export.)  

Sample code is available in `demo.html`.  

Basically, there are two functions: one for decompressing compressed replay data, and one for parsing the decompressed replay data.  

```ts
import { decompressReplay, parseReplay, type ReplayData } from 'techmino-replay-parser';

// Binary encoded replay file.
// It's the one in `(Techmino save dir)/replay/`.
const compressedRepFile: File = '...';

// We first convert it to an array buffer.
const arrayBuffer: ArrayBuffer = compressedRepFile.arrayBuffer();

// Then we convert it to a Uint8Array.
const buffer = new Uint8Array(arrayBuffer);

// Then we get the decompressed replay data.
const decompressed = decompressReplay(buffer);

// At this point, `decompressed` is a Buffer array
// containing a mix of JSON and binary data.
// We then parse it to get the processed replay data.
const replayData: ReplayData = parseReplay(decompressed);
```