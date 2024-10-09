import { Buffer } from 'buffer';
export declare function parseReplayFromBuffer(replayBuf: Buffer): Promise<GameReplayData>;
export declare function parseReplayFromRepString(replayStr: string): Promise<GameReplayData>;
/** Represents the decompressed replay data as stored in-game. */
export type GameReplayData = {
    inputs: GameInputEvent[];
    tasUsed?: boolean;
    private?: boolean;
    player: string;
    seed: number;
    version: string;
    date: string;
    mod: [number, number][];
    mode: string;
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
    [key: string]: unknown;
};
/** Represents a single input event in a replay. */
export type GameInputEvent = {
    frame: number;
    type: InputEventType;
    key: InputKey;
};
/** Represents the kind of input event. */
export declare const InputEventType: {
    readonly Press: 0;
    readonly Release: 1;
};
export type InputEventType = typeof InputEventType[keyof typeof InputEventType];
/** Represents the input button of an input event. */
export declare const InputKey: {
    readonly Invalid: 0;
    readonly MoveLeft: 1;
    readonly MoveRight: 2;
    readonly RotateRight: 3;
    readonly RotateLeft: 4;
    readonly Rotate180: 5;
    readonly HardDrop: 6;
    readonly SoftDrop: 7;
    readonly Hold: 8;
    readonly Function1: 9;
    readonly Function2: 10;
    readonly InstantLeft: 11;
    readonly InstantRight: 12;
    readonly SonicDrop: 13;
    readonly Down1: 14;
    readonly Down4: 15;
    readonly Down10: 16;
    readonly LeftDrop: 17;
    readonly RightDrop: 18;
    readonly LeftZangi: 19;
    readonly RightZangi: 20;
};
export type InputKey = typeof InputKey[keyof typeof InputKey];
