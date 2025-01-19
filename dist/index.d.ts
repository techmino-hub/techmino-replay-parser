import { Buffer } from '../node_modules/buffer/index.js';
/** Represents the decompressed replay data as stored in-game. */
export type GameReplayData = {
    /**
     * A list of input events that occurred during the replay.
     * Note: does not exist in the raw game metadata.
     */
    inputs: GameInputEvent[];
    metadata: GameReplayMetadata;
};
export type GameReplayMetadata = {
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
};
/** Represents a single input event in a replay. */
export type GameInputEvent = {
    /** The frame the input event occured. */
    frame: number;
    /** The kind of input event (press or release). */
    type: InputEventType;
    /** The key that was pressed or released. */
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
export declare function createReplayBuffer(replayData: GameReplayData): Buffer;
export declare function createReplayString(replayData: GameReplayData): string;
export declare function parseReplayFromBuffer(replayBuf: Buffer): GameReplayData;
export declare function parseReplayFromRepString(replayStr: string): GameReplayData;
