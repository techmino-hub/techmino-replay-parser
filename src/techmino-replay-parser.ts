import pako from 'pako';
import { Buffer } from 'buffer';

export async function decompressReplay(compressed: Buffer): Promise<[Buffer, Buffer]> {
    try {
        const result = pako.inflate(compressed)
            .toString()
            .split(",10,", 2)
            .map((line: string) =>
                line.split(",")
                    .map(Number)
            )
            .map((arr: number[]) => Buffer.from(arr))

        for (let i = 0; i < result.length; i++) {
            console.debug(i, result[i]);
        }

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

export type ReplayData = {
    inputs: InputData[];
    [key: string]: any;
}

export type InputData = {
    frame: number;
    type: "Press" | "Release";
    key: InputKey;
}

export enum InputKey {
    Invalid = 0,

    MoveLeft = 1, MoveRight = 2,
    RotateRight = 3, RotateLeft = 4, Rotate180 = 5,
    HardDrop = 6, SoftDrop = 7,
    Hold = 8,

    Function1 = 9, Function2 = 10,
    
    InstantLeft = 11, InstantRight = 12,
    SonicDrop = 13,
    Down1 = 14, Down4 = 15, Down10 = 16,
    LeftDrop = 17, RightDrop = 18,
    LeftZangi = 19, RightZangi = 20
}

function isKeyValid(key: number): boolean {
    const smallestFiveBits = key & 0b11111;
    return smallestFiveBits >= 1 && smallestFiveBits <= 20;
}

export async function parseReplay(replayBuf: Buffer[]): Promise<ReplayData> {
    const replayData: ReplayData = {inputs: []};

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
            continue;
        }

        replayData.inputs.push({
            frame: frame,
            type: eventKey > 32 ? "Release" : "Press",
            key: eventKey % 32
        });
    }

    return replayData;
}

if(window) {
    (window as any).TechminoReplayParser = {
        decompressReplay,
        parseReplay
    };
}