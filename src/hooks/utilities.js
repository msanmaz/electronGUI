export function isPacketUnwanted(packet, unwantedPackets) {
    return unwantedPackets.some(
      (unwantedPacket) =>
        packet.length === unwantedPacket.length &&
        packet.every((v, i) => v === unwantedPacket[i])
    );
  }

  export function calculateAverage(data) {
    if (!data) {
        return []
    }
  
    let sums = {};
    let newAverages = {};
  
    // Initialize sums object
    for (let i = 1; i <= 16; i++) {
      sums[`c${i}`] = 0;
    }
  
    // Add up all values
    for (let item of data) {
      for (let i = 1; i <= 16; i++) {
        sums[`c${i}`] += item[`c${i}`];
      }
    }
  
    // Calculate averages
    for (let i = 1; i <= 16; i++) {
      newAverages[`c${i}`] = sums[`c${i}`] / data.length;
    }
  
    return newAverages;
  }

//  export const handleStopZeroSession = (rxCharacteristic,txCharacteristic,rxCharacteristicLeft,txCharacteristicLeft,setIsZeroSession,handleStreamData,handleStreamDataLeft) => {
//     return sendCommand('spstr', rxCharacteristic, txCharacteristic, handleStreamData)
//       .then(() => sendCommand('spstr', rxCharacteristicLeft, txCharacteristicLeft, handleStreamDataLeft))
//       .then(() => setIsZeroSession(false));
//   };

 export const sendCommand = async (command, rxCharacteristic, txCharacteristic, handleStreamDataFunc) => {
    switch(command) {
      case 'ssstr':
        return sendSSSTRCommand(rxCharacteristic, txCharacteristic, handleStreamDataFunc);
      case 'spstr':
        return sendSPSTRCommand(rxCharacteristic, txCharacteristic, handleStreamDataFunc);
      default:
        console.error(`Unsupported command: ${command}`);
    }
  }


   export const connectToDevice = async (selectedDevice, setRxCharacteristic, setTxCharacteristic, setDeviceInfo) => {
    if (selectedDevice) {
      try {
        const server = await selectedDevice.gatt.connect();
        console.log("Connected to GATT server:", server);

        const uartService = await server.getPrimaryService(
          "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
        );
        const rxCharacteristic = await uartService.getCharacteristic(
          "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
        );
        const txCharacteristic = await uartService.getCharacteristic(
          "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
        );
        await txCharacteristic.startNotifications();

        setRxCharacteristic(rxCharacteristic);
        setTxCharacteristic(txCharacteristic);

        const encoder = new TextEncoder("utf-8");
        const data = encoder.encode("batlv?");
        await rxCharacteristic.writeValue(data);

        // Create a promise that resolves when the battery level is received
        const batteryLevelReceived = new Promise((resolve) => {
          const handleBatteryLevelData = (event) => {
            let value = event.target.value;
            let responseBytes = [];
            for (let i = 0; i < value.byteLength; i++) {
              responseBytes.push(value.getUint8(i));
            }
            let batteryLevelBytes = responseBytes.slice(6);
            let batteryLevelString = String.fromCharCode(
              ...batteryLevelBytes
            );
            let batteryLevel = parseInt(batteryLevelString);
            console.log(`Battery level: ${batteryLevel}`);
            setDeviceInfo(batteryLevel);
            // Once the battery level is received, remove this event listener
            txCharacteristic.removeEventListener(
              "characteristicvaluechanged",
              handleBatteryLevelData
            );
            resolve();
          };
          txCharacteristic.addEventListener(
            "characteristicvaluechanged",
            handleBatteryLevelData
          );
        });

        // Wait for the battery level to be received
        await batteryLevelReceived;

      } catch (error) {
        console.error("Failed to connect to the Bluetooth device:", error);
      }
    }
  };
  
  
  export function sendSSSTRCommand(rxCharacteristic, txCharacteristic, handleStreamDataFunc) {
    const encoder = new TextEncoder();
    const ssstr = encoder.encode("ssstr");
    return rxCharacteristic.writeValue(ssstr).then(() => {
      txCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleStreamDataFunc
      );
      console.log('event listener added',txCharacteristic)
    });
  }
  
  export function sendSPSTRCommand(rxCharacteristic) {
    const encoder = new TextEncoder();
    const spstr = encoder.encode("spstr");
    const ssend = encoder.encode("ssend");
    return rxCharacteristic.writeValue(spstr).then(() => {
        console.log("spstr sent")
      return rxCharacteristic.writeValue(ssend);
    })
  }
  