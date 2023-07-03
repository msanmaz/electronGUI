

 function isPacketUnwanted(packet, unwantedPackets) {
    return unwantedPackets.some(
      (unwantedPacket) =>
        packet.length === unwantedPacket.length &&
        packet.every((v, i) => v === unwantedPacket[i])
    );
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


  self.onmessage = ({ data: { value, isZeroSessionRef, left } }) => {
    let responseBytes = [];
    for (let i = 0; i < value.byteLength; i++) {
      responseBytes.push(value.getUint8(i));
    }
  
    const unwantedPacketStart = [115, 115, 115, 116, 114, 33];
    const unwantedPacketStop = [115, 112, 115, 116, 114, 33];
    const unwantedPackets = [unwantedPacketStart, unwantedPacketStop];
    const isUnwanted = isPacketUnwanted(responseBytes, unwantedPackets);
    
  
    if (!isUnwanted) {
      // Here you would now include the logic from your onZeroSessionPacketReceived function
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
      packages.forEach((packages, index) => {
        let parsedPackage = {
          counter: counter + index,
          side: left ? "L" : "R",
        };
  
        for (let i = 1; i <= 16; i++) {
          const index = 24 + (i - 1) * 2;
          parsedPackage["c" + i] = getWordFromTwoBytes(
            packages[index],
            packages[index + 1],
            true
          );
        }
  
        if (parsedPackage.counter === 252) {
          self.postMessage({ stopZeroSession: true });
          return;
        }
  
        self.postMessage({ parsedPackage, isZeroSessionRef });
      });
    }
  };
  