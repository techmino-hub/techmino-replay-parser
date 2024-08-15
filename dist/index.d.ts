import { Buffer } from 'buffer';
export declare function parseReplayFromBuffer(replayBuf: Buffer): Promise<GameReplayData>;
export declare function parseReplayFromRepString(replayStr: string): Promise<GameReplayData>;
/**
 * Represents the decompressed replay data as stored in-game.
 */
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
export declare enum InputEventType {
    Press = 0,
    Release = 1
}
/** Represents the input button of an input event. */
export declare enum InputKey {
    Invalid = 0,
    MoveLeft = 1,
    MoveRight = 2,
    RotateRight = 3,
    RotateLeft = 4,
    Rotate180 = 5,
    HardDrop = 6,
    SoftDrop = 7,
    Hold = 8,
    Function1 = 9,
    Function2 = 10,
    InstantLeft = 11,
    InstantRight = 12,
    SonicDrop = 13,
    Down1 = 14,
    Down4 = 15,
    Down10 = 16,
    LeftDrop = 17,
    RightDrop = 18,
    LeftZangi = 19,
    RightZangi = 20
}
