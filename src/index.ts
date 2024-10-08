import pako from 'pako';
import { Buffer } from 'buffer';


// #region Types
/** Represents the decompressed replay data as stored in-game. */
export type GameReplayData = {
    /**
     * A list of input events that occurred during the replay.  
     * Note: does not exist in the raw game metadata.
     */
    inputs: GameInputEvent[];
    
    /** Whether or not the replay is marked as a TAS. */
    tasUsed?: boolean;

    /**
     * The 'private' field of the replay, used to store mode-specific data.  
     * Its contents differ based on the mode played.  
     * Currently, only the `custom_clear` and `custom_puzzle` modes store any data here.
     */
    private?: unknown;

    /** The username of the player. */
    player: string;

    /** The seed for the random number generator. */
    seed: number;

    /** The version of the game the replay was made in. */
    version: string;

    /** The time the replay was initially created. */
    date: string;

    /**
     * A list of mods applied to the run.  
     * It's in the format of [mod, value], where mod is the mod ID and value is the value of the mod.  
     */
    mod: [number, number][];

    /** The name of the mode that was played. */
    mode: string;

    /** The settings of the game when the run was played. */
    setting: {
        shakeFX?: number;
        splashFX?: number;
        das?: number;
        highCam?: boolean;
        smooth?: boolean;
        warn?: boolean;
        dropcut?: number;
        ghost?: number;
        atkFX?: number;
        nextPos?: boolean;
        block?: boolean;
        text?: boolean;
        ihs?: boolean;
        face?: number[];
        score?: boolean;
        irs?: boolean;
        center?: number;
        sdarr?: number;
        moveFX?: number;
        dropFX?: number;
        ims?: boolean;
        lockFX?: number;
        arr?: number;
        swap?: boolean;
        bagLine?: boolean;
        skin?: number[];
        grid?: number;
        dascut?: number;
        sddas?: number;
        RS?: string;
        clearFX?: number;
        [key: string]: unknown;
    };

    /** Additional replay metadata that may not be standard. */
    [key: string]: unknown;
}

/** Represents a single input event in a replay. */
export type GameInputEvent = {
    /** The frame the input event occured. */
    frame: number;
    /** The kind of input event (press or release). */
    type: InputEventType;
    /** The key that was pressed or released. */
    key: InputKey;
}

/** Represents the kind of input event. */
export const InputEventType = {
    Press: 0, Release: 1
} as const;

export type InputEventType = typeof InputEventType[keyof typeof InputEventType];

/** Represents the input button of an input event. */
export const InputKey = {
    Invalid: 0,

    MoveLeft: 1, MoveRight: 2,
    RotateRight: 3, RotateLeft: 4, Rotate180: 5,
    HardDrop: 6, SoftDrop: 7,
    Hold: 8,

    Function1: 9, Function2: 10,
    
    InstantLeft: 11, InstantRight: 12,
    SonicDrop: 13,
    Down1: 14, Down4: 15, Down10: 16,
    LeftDrop: 17, RightDrop: 18,
    LeftZangi: 19, RightZangi: 20
} as const;

export type InputKey = typeof InputKey[keyof typeof InputKey];
// #endregion

function encodeVLQ(t: number): number[] {
    if(t < 128) return [t];

    const arr = [t % 128];
    t = Math.floor(t / 128);

    while (t >= 128) {
        arr.unshift(128 + t % 128);
        t = Math.floor(t / 128);
    }

    arr.unshift(t + 128);
    return arr;
}

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

function dumpRecording(list: number[], ptr = 0): Uint8Array {
    const buffer = [] as number[];

    let prevFrm = list[ptr - 2] ?? 0;

    while(list[ptr]) {
        const t = list[ptr] - prevFrm;
        prevFrm = list[ptr];
        buffer.push(...encodeVLQ(t));
        buffer.push(...encodeVLQ(list[ptr + 1]));
        ptr += 2;
    }

    return new Uint8Array(buffer);
}

function dumpRecording_0_17_22(list: number[], ptr = 0): Uint8Array {
    const buffer = [] as number[];

    while(list[ptr]) {
        buffer.push(...encodeVLQ(list[ptr]));
        ptr++;
    }

    return new Uint8Array(buffer);
}

function pumpRecording(data: Uint8Array, absoluteTiming = false): GameInputEvent[] {
    let position = 0;
    const events = [] as GameInputEvent[];

    let curFrame = 0;
    while (position < data.length) {
        let time: number, eventKey: number;
        
        [time, position] = decodeVLQ(data, position);
        if(absoluteTiming) {
            curFrame = time;
        } else {
            curFrame += time;
        }

        [eventKey, position] = decodeVLQ(data, position);

        events.push({
            frame: curFrame,
            type: eventKey > 32 ? InputEventType.Release : InputEventType.Press,
            key: eventKey % 32 as InputKey
        });
    }
    return events;
}

function getVersion(versionStr: string): [number, number, number] {
    const versionMatch = versionStr.match(/\d*\.\d*\.\d*/);
    if (!versionMatch) {
        return [0, 0, 0];
    }

    const versionSplit = versionMatch[0].split(".");
    return [
        parseInt(versionSplit[0] ?? "0"),
        parseInt(versionSplit[1] ?? "0"),
        parseInt(versionSplit[2] ?? "0")
    ];
}

function checkMinVersion(min: [number, number, number], version: [number, number, number]): boolean {
    if (min[0] > version[0]) {
        return false;
    } else if (min[0] < version[0]) {
        return true;
    }

    if (min[1] > version[1]) {
        return false;
    } else if (min[1] < version[1]) {
        return true;
    }

    return min[2] <= version[2];
}

export function createReplayBuffer(
    metadata: GameReplayData,
    inputs: GameInputEvent[]
): Buffer {
    const metadataStr = JSON.stringify(metadata);
    const metadataBuf = Buffer.from(metadataStr);
    const version = getVersion(metadata.version ?? "0.0.0");

    const list = inputs
        .map((e) => [e.frame, e.key + (e.type === InputEventType.Release ? 32 : 0)])
        .flat();

    let data: Uint8Array;
    if(checkMinVersion([0, 17, 22], version)) {
        data = dumpRecording_0_17_22(list);
    } else {
        data = dumpRecording(list);
    }

    const buf = Buffer.concat([metadataBuf, Buffer.from([10]), data]);
    return Buffer.from(pako.deflate(buf));
}

export function createReplayString(
    metadata: GameReplayData,
    inputs: GameInputEvent[]
): string {
    const buf = createReplayBuffer(metadata, inputs);
    return buf.toString("base64");
}

export function parseReplayFromBuffer(replayBuf: Buffer): GameReplayData {
    const arr = pako.inflate(replayBuf);

    const firstNewline = arr.indexOf(10);

    const metadata = arr.slice(0, firstNewline);
    const data = arr.slice(firstNewline + 1);

    const metadataStr = Buffer.from(metadata).toString();
    const replayData = JSON.parse(metadataStr) as Partial<GameReplayData>;
    
    // Replay versions above v0.17.21 use absolute timing
    const version = getVersion(replayData.version ?? "0.0.0");
    const minVersion = [0, 17, 22] as [number, number, number];
    const useAbsoluteTiming = checkMinVersion(minVersion, version);

    const buf = Buffer.from(data);

    replayData.inputs = pumpRecording(new Uint8Array(buf), useAbsoluteTiming);

    return replayData as GameReplayData;
}

export function parseReplayFromRepString(replayStr: string): GameReplayData {
    const repBuf = Buffer.from(replayStr.trim(), "base64");
    return parseReplayFromBuffer(repBuf);
}