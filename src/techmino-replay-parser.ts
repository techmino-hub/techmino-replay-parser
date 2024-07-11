import pako from 'pako';
import { Buffer } from 'buffer';
import { GameReplayData } from './types';

export async function decompressReplay(compressed: Buffer): Promise<[Buffer, Buffer]> {
    try {
        const str = pako.inflate(compressed).toString();

        const splitIdx = str.indexOf(",10,");

        const sliced = [
            str.slice(0, splitIdx),
            str.slice(splitIdx + 4)
        ];

        const result =
            sliced.map((line: string) =>
                line.split(",").map(Number)
            )
            .map((arr: number[]) => Buffer.from(arr));

        return [result[0], result[1] ?? Buffer.alloc(0)];
    } catch (err) {
        return Promise.reject(err);
    }
}

async function getRawInputs(rep: Buffer): Promise<number[]> {
    const decodeVLQ = (buffer: Buffer, startPos: number): [number, number] => {
        let value = 0;
        let position = startPos;
        let byteValue;

        do {
            byteValue = buffer[position];
            value = value * 128 + (byteValue & 0x7F); // Mask the MSB
            position += 1;
        } while (byteValue >= 128 && position < buffer.length);

        return [value, position];
    };

    let result: number[] = [];
    let currentFrame = 0;
    let position = 0;

    while (position < rep.length) {
        let [frameCode, newPosition] = decodeVLQ(rep, position);
        currentFrame += frameCode + 1;
        result.push(currentFrame);
        position = newPosition;

        if (position < rep.length) {
            let [eventCode, newPosition] = decodeVLQ(rep, position);
            result.push(eventCode);
            position = newPosition;
        }
    }

    return result;
}

function isKeyValid(key: number): boolean {
    const smallestFiveBits = key & 0b11111;
    return smallestFiveBits >= 1 && smallestFiveBits <= 20;
}

export async function parseReplay(replayBuf: [Buffer, Buffer]): Promise<GameReplayData> {
    const replayData: Partial<GameReplayData> = {inputs: []};

    const rawInputPromise = getRawInputs(replayBuf[1]);

    try {
        const jsonObj = JSON.parse(replayBuf[0].toString());
        Object.assign(replayData, jsonObj);
    } catch (exception) {
        console.warn("Failed to parse replay metadata", exception);
    }

    const rawInputs = await rawInputPromise;
    
    if (rawInputs.length % 2 !== 0) rawInputs.pop();

    for (let i = 0; i < rawInputs.length; i += 2) {
        const frame = rawInputs[i];
        const eventKey = rawInputs[i + 1];
        
        if(eventKey >= frame || !isKeyValid(eventKey)) {
            console.log("Invalid key", eventKey, "at frame", frame);
            continue;
        }

        (replayData as GameReplayData).inputs.push({
            frame: frame,
            type: eventKey > 32 ? "Release" : "Press",
            key: eventKey % 32
        });
    }

    return replayData as GameReplayData;
}

if(window) {
    (window as any).TechminoReplayParser = {
        decompressReplay,
        parseReplay
    };
}