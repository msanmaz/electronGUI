function getWordFromTwoBytes12(byte1, byte2, bigEndian) {
    const sixteenBitResult = getWordFromTwoBytes(byte1, byte2, bigEndian);
    if (sixteenBitResult === 0) {
        return 0;
    } else {
        return sixteenBitResult / 16;
    }
}

function getWordFromTwoBytes(byte1, byte2, bigEndian) {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint8(0, byte1);
    view.setUint8(1, byte2);
    return bigEndian ? view.getInt16(0) : view.getInt16(0, true);
}

function getWordFromFourBytes(byte1, byte2, byte3, byte4, bigEndian) {
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer);

    view.setUint8(0, byte1);
    view.setUint8(1, byte2);
    view.setUint8(2, byte3);
    view.setUint8(3, byte4);

    return view.getInt32(0, !bigEndian);
}



function isPacketUnwanted(packet, unwantedPackets) {
    return unwantedPackets.some(
        (unwantedPacket) =>
            packet.length === unwantedPacket.length &&
            packet.every((v, i) => v === unwantedPacket[i])
    );
}



let firstPacket = true;
let zeroSessionValues;
const keys = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16'];

self.onmessage = ({ data: { value, left,zeroSession } }) => {
    let responseBytes = new Uint8Array(value.buffer);

    const unwantedPacketStart = new Uint8Array([115, 115, 115, 116, 114, 33]);
    const unwantedPacketStop = new Uint8Array([115, 112, 115, 116, 114, 33]);
    const unwantedPackets = [unwantedPacketStart, unwantedPacketStop];

    if (zeroSession) {
        zeroSessionValues = new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            zeroSessionValues[i] = zeroSession[keys[i]];
        }
    }


    let isUnwanted = false;
    if (firstPacket) {
        isUnwanted = isPacketUnwanted(responseBytes, unwantedPackets);
        firstPacket = false;
    }

    if (!isUnwanted) {
        let counter = getWordFromFourBytes(
            responseBytes[4],
            responseBytes[5],
            responseBytes[6],
            responseBytes[7],
            true
        );

        // Split the packet into multiple packages of 56 bytes each
        const packages = [];
        for (let i = 8; i < responseBytes.length; i += 56) {
            packages.push(responseBytes.slice(i, i + 56));
        }

        // Process each package
        packages.forEach((pkg, index) => {
            let parsedPackage = {
                counter: counter + index,
                side: left ? 'L' : 'R',
                G_X: getWordFromTwoBytes(pkg[0], pkg[1], false) * 0.07,
                G_Y: getWordFromTwoBytes(pkg[2], pkg[3], false) * 0.07,
                G_Z: getWordFromTwoBytes(pkg[4], pkg[5], false) * 0.07,
                A_X: (getWordFromTwoBytes(pkg[6], pkg[7], false) * 0.488) / 1000,
                A_Y: (getWordFromTwoBytes(pkg[8], pkg[9], false) * 0.488) / 1000,
                A_Z: (getWordFromTwoBytes(pkg[10], pkg[11], false) * 0.488) / 1000,
                M_X: getWordFromTwoBytes(pkg[12], pkg[13], false),
                M_Y: getWordFromTwoBytes(pkg[14], pkg[15], false),
                M_Z: getWordFromTwoBytes(pkg[16], pkg[17], false),
                A_X_W: getWordFromTwoBytes12(pkg[18], pkg[19], false) * -1 * 0.049,
                A_Y_W: getWordFromTwoBytes12(pkg[20], pkg[21], false) * -1 * 0.049,
                A_Z_W: getWordFromTwoBytes12(pkg[22], pkg[23], false) * 0.049,
            };

            // for (let i = 1; i <= 16; i++) {
            //     const index = 24 + (i - 1) * 2;
            //     const value = getWordFromTwoBytes(pkg[index], pkg[index + 1], true);
            //     parsedPackage["c" + i] = value - zeroSession["c" + i];
            //     // parsedPackage["c" + i] = getWordFromTwoBytes(pkg[index], pkg[index + 1], true);
            // }

            for (let i = 1; i <= 16; i++) {
                const index = 24 + (i - 1) * 2;
                const value = getWordFromTwoBytes(pkg[index], pkg[index + 1], true);
                parsedPackage["c" + i] = value - zeroSession["c" + i];
            }
            

            // Send back the parsed data
            self.postMessage({ responseBytes: parsedPackage });
        });
    }
};
