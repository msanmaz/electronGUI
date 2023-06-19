import React, { useEffect, useState } from "react";
import BleSearch from "./bleSearch";

function BluetoothComponent() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);

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

  const handleStreamData = React.useCallback((event) => {
    let value = event.target.value;
    let responseBytes = [];

    for (let i = 0; i < value.byteLength; i++) {
      responseBytes.push(value.getUint8(i));
    }

    // Process the streaming data here
    console.log(`Received stream data: ${responseBytes}`);
  }, []);

  const sendSSSTRCommand = async () => {
    const encoder = new TextEncoder();
    const ssstr = encoder.encode("ssstr");
    await rxCharacteristic.writeValue(ssstr);
    txCharacteristic.addEventListener(
      "characteristicvaluechanged",
      handleStreamData
    );
  };

  const handleCancelBluetoothRequest = () => {
    if (selectedDevice) {
      selectedDevice.gatt.disconnect();
      console.log("Disconnected from GATT server");
      setSelectedDevice(null);
      setDeviceInfo(null);
    }
  };

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
                <div className="py-[1rem]">
                <button className="text-xl font-bold" onClick={sendSSSTRCommand}>Start Streaming</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BluetoothComponent;
