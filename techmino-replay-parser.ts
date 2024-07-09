import { readFile } from 'fs/promises';
import { unzip } from 'zlib';

// Assuming the file path is provided as a command-line argument
const filePath = process.argv[2];
if (!filePath) {
    console.log("Please provide a file path.");
    process.exit(1);
}

async function decompressData(filePath: string): Promise<Buffer[]> {
    const data = await readFile(filePath);
    return new Promise((resolve, reject) => {
        unzip(data, (err, buffer) => {
            if (err) reject(err);
            else resolve(buffer.toString().split("\n").map(line => Buffer.from(line)));
        });
    });
}

function pumpRecording(rep: Buffer[], deltaTime: number = 1): number[] {
    let result: number[] = [];
    let currentFrame = 0;
    let p = 0;
    const length = rep.length - 1;

    while (p <= length) {
        let code = 0;
        let b = rep[p][0];
        while (b >= 128) {
            code = code * 128 + b - 128;
            if (p + 1 === length) return result;
            p += 1;
            b = rep[p][0];
        }
        currentFrame += code * 128 + b + deltaTime;
        result.push(currentFrame);
        if (p === length) return result;

        p += 1;
        let event = 0;
        b = rep[p][0];
        while (b >= 128) {
            event = event * 128 + b - 128;
            if (p + 1 === length) return result;
            p += 1;
            b = rep[p][0];
        }
        result.push(event * 128 + b);
        if (p === length) return result;
        p += 1;
    }

    return result;
};

const acceptedKeys = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52
])

function printResult(inputData: number[]) {
    const keyList = [
        "", "Move Left", "Move Right", "Rotate Right", "Rotate Left", "Rotate 180°",
        "Hard Drop", "Soft Drop", "Hold", "Function 1", "Function 2",
        "Instant Left", "Instant Right", "Sonic Drop", "Down 1", "Down 4", "Down 10",
        "Left Drop", "Right Drop", "Left Zangi", "Right Zangi"
    ];

    if (inputData.length % 2 !== 0) inputData.pop();

    for (let i = 0; i < inputData.length; i += 2) {
        const frame = inputData[i];
        const eventKey = inputData[i + 1];
        
        if(eventKey >= frame || !acceptedKeys.has(eventKey)) {
            continue;
        }

        console.log(
            `Frame ${frame} - ` +
            (eventKey > 32 ? "RELEASE " : "PRESS   ") +
            keyList[eventKey % 32]
        );
    }
};

async function main() {
    const decompressedData = await decompressData(filePath);
    console.log("Decompressed data:", decompressedData[0].toString());
    printResult(pumpRecording(decompressedData.slice(1)));
};

main().catch(console.error);