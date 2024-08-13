import pako from 'pako';
import { Buffer } from 'buffer';
import { GameInputEvent, InputEventType, type GameReplayData } from './types';

function decodeVLQ(data: Uint8Array, position: number): [number, number] {
    let ret = 0;
    let byte = 0;
    do {
        byte = data[position];
        position++;
        ret = ret * 128 + (byte & 127);
    } while(byte >= 128);
    return [ret, position];
}

function pumpRecording(data: Uint8Array): GameInputEvent[] {
    let position = 1;
    const events = [] as GameInputEvent[];

    let curFrame = 0;
    while (position <= data.length) {
        let dt: number, eventKey: number;
        
        [dt, position] = decodeVLQ(data, position);
        curFrame += dt;

        [eventKey, position] = decodeVLQ(data, position);

        events.push({
            frame: curFrame,
            type: eventKey > 32 ? InputEventType.Release : InputEventType.Press,
            key: eventKey % 32
        });
    }
    return events;
}

export async function parseReplayFromBuffer(replayBuf: Buffer): Promise<GameReplayData> {
    const arr = pako.inflate(replayBuf);

    const firstNewline = arr.indexOf(10);

    const metadata = arr.slice(0, firstNewline);
    const data = arr.slice(firstNewline + 1);

    const metadataStr = Buffer.from(metadata).toString();
    const replayData = JSON.parse(metadataStr) as Partial<GameReplayData>;
    
    replayData.inputs = pumpRecording(Buffer.from(data));

    return replayData as GameReplayData;
}

export async function parseReplayFromRepString(replayStr: string): Promise<GameReplayData> {
    const repBuf = Buffer.from(replayStr, "base64");
    return await parseReplayFromBuffer(repBuf);
}

if(typeof window !== 'undefined') {
    (window as Record<string, any>).TechminoReplayParser = {
        parseReplayFromBuffer,
        parseReplayFromRepString
    }
}