import React, { useEffect, useState } from "react";
import BleSearch from "./bleSearch";
import useGetWordFromFourBytes from "../../hooks/useGetWordFromFourBytes";
import useGetWordFromTwoBytes from "../../hooks/useGetWordFromTwoBytes";
import useGetWordFromTwoBytes12 from "../../hooks/useGetWordFromTwoBytes12";
import LineChartPlot from "../lineChart/lineChart";

function BluetoothComponent() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [packets, setPackets] = useState([]);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);

  const getWordFromFourBytes = useGetWordFromFourBytes();
  const getWordFromTwoBytes = useGetWordFromTwoBytes();
  const getWordFrom12Bytes = useGetWordFromTwoBytes12();

  

  const handleBluetoothRequest = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,
        filters: [
          {
            services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
          },
        ],
        optionalServices: ["6e400002-b5a3-f393-e0a9-e50e24dcca9e"],
      });

      if (
        Object.prototype.toString.call(device) === "[object BluetoothDevice]"
      ) {
        setSelectedDevice(device);
        return;
      }
      // setDevices((prevDevices) => [...prevDevices, device]);
    } catch (error) {
      console.error(error);
    }
  };

  const onPacketReceived = React.useCallback(
    (packet) => {
      let counter = getWordFromFourBytes(
        packet[4],
        packet[5],
        packet[6],
        packet[7],
        true
      );
      // Split the packet into multiple packages of 56 bytes each
      const packages = [];
      for (let i = 8; i < packet.length; i += 56) {
        packages.push(packet.slice(i, i + 56));
      }
      console.log(packages)
      // Process each package
      packages.forEach((packages, index) => {
        let parsedPackage = {
          counter: counter + index,
          G_X: getWordFromTwoBytes(packages[0], packages[1], false) * 0.07,
          G_Y: getWordFromTwoBytes(packages[2], packages[3], false) * 0.07,
          G_Z: getWordFromTwoBytes(packages[4], packages[5], false) * 0.07,
          A_X: getWordFromTwoBytes(packages[6], packages[7], false) * 0.488 / 1000,
          A_Y: getWordFromTwoBytes(packages[8], packages[9], false) * 0.488 / 1000,
          A_Z: getWordFromTwoBytes(packages[10], packages[11], false) * 0.488 / 1000,
          M_X: getWordFromTwoBytes(packages[12], packages[13], false),
          M_Y: getWordFromTwoBytes(packages[14], packages[15], false),
          M_Z: getWordFromTwoBytes(packages[16], packages[17], false),
          A_X_W: getWordFrom12Bytes(packages[18], packages[19], false) * -1 * 0.049,
          A_Y_W: getWordFrom12Bytes(packages[20], packages[21], false) * -1 * 0.049,
          A_Z_W: getWordFrom12Bytes(packages[22], packages[23], false) * 0.049,
        };

        for (let i = 1; i <= 16; i++) {
          const index = 24 + (i - 1) * 2;
          parsedPackage["c" + i] = getWordFromTwoBytes(
            packages[index],
            packages[index + 1],
            true
          );
        }

        console.log(`Chunk ${index + 1}:`, parsedPackage);
        setPackets((oldPackets) => [...oldPackets, parsedPackage]);
      });
    },
    [getWordFrom12Bytes, getWordFromFourBytes, setPackets, getWordFromTwoBytes]
  );


  useEffect(() => {
    const connectToDevice = async () => {
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
    connectToDevice();
    return () => {
      if (selectedDevice) {
        selectedDevice.gatt.disconnect();
        console.log("Disconnected from GATT server");
      }
    };
  }, [selectedDevice]);

  function isPacketUnwanted(packet, unwantedPackets) {
    return unwantedPackets.some(
      (unwantedPacket) =>
        packet.length === unwantedPacket.length &&
        packet.every((v, i) => v === unwantedPacket[i])
    );
  }

  const handleStreamData = React.useCallback((event) => {
    let value = event.target.value;
    let responseBytes = [];

    for (let i = 0; i < value.byteLength; i++) {
      responseBytes.push(value.getUint8(i));
    }

    const unwantedPacketStart = [115, 115, 115, 116, 114, 33];
    const unwantedPacketStop = [115, 112, 115, 116, 114, 33];
    const unwantedPackets = [unwantedPacketStart, unwantedPacketStop];
    const isUnwanted = isPacketUnwanted(responseBytes, unwantedPackets);

    if (!isUnwanted) {
      // Process the streaming data here
      onPacketReceived(responseBytes);
      console.log(`Received package data: ${responseBytes}`);
    }
  }, [onPacketReceived]);

  const sendSSSTRCommand = async () => {
    const encoder = new TextEncoder();
    const ssstr = encoder.encode("ssstr");
    await rxCharacteristic.writeValue(ssstr);
    txCharacteristic.addEventListener(
      "characteristicvaluechanged",
      handleStreamData
    );
  };

  const handleCancelBluetoothRequest = React.useCallback(() => {
    if (selectedDevice) {
      // console.log("Disconnected from GATT server");
      selectedDevice.gatt.disconnect();
      setSelectedDevice(null);
      setDeviceInfo(null);
    }
  }, [selectedDevice]);

  const sendSPSTRCommand = React.useCallback(async () => {
    const encoder = new TextEncoder();
    const spstr = encoder.encode("spstr");
    const ssend = encoder.encode("ssend");
    await rxCharacteristic.writeValue(spstr);
    await rxCharacteristic.writeValue(ssend);
    txCharacteristic.removeEventListener(
      "characteristicvaluechanged",
      handleStreamData
    );
    console.log("Stopped streaming");
  }, [rxCharacteristic, txCharacteristic, handleStreamData]);

  
  return (
    <div className="flex flex-col justify-center gap-[1rem]">
      <div className="flex-row gap-[1rem] text-center text-2xl font-extrabold flex justify-center">
        <button onClick={handleBluetoothRequest}>Test Bluetooth</button>
        <button onClick={handleCancelBluetoothRequest}>Cancel Bluetooth</button>
      </div>

      <div className="flex-col flex">
        {!selectedDevice && <BleSearch />}

        {selectedDevice && (
          <>
            <div className="flex flex-row">
              <div>
                <p className="text-xl font-bold">
                  Selected Device: {selectedDevice.name}
                </p>
                <p className="text-xl py-[0.5rem] font-bold">
                  Battery Level: {deviceInfo}%
                </p>
                <div className="py-[0.5rem]">
                  <button
                    className="text-xl font-bold"
                    onClick={sendSSSTRCommand}
                  >
                    Start Streaming
                  </button>
                  <button
                    className="text-xl font-bold"
                    onClick={sendSPSTRCommand}
                  >
                    Stop Streaming
                  </button>
                </div>
              </div>

              <LineChartPlot data={packets} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BluetoothComponent;
