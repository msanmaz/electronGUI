// useBluetoothCommands.js
import { useState, useEffect } from 'react';

export const useBluetoothCommands = (selectedDevice, commands, processFunctions) => {
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const connectToDevice = async () => {
      if (selectedDevice) {
        try {
            let server 
            if(!selectedDevice.gatt.connected) {
             server = await selectedDevice.gatt.connect();
            console.log("Connected to GATT server:", server);
            }


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

          const encoder = new TextEncoder("utf-8");

          for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const processFunction = processFunctions[i];

            const data = encoder.encode(command);
            await rxCharacteristic.writeValue(data);

            const handleData = (event) => {
              const processedData = processFunction(event);
              setResponses((prevResponses) => [...prevResponses, processedData]);
            };

            txCharacteristic.addEventListener(
              "characteristicvaluechanged",
              handleData
            );

            // Remove the event listener once the command response has been processed
            await new Promise((resolve) => {
              txCharacteristic.addEventListener(
                "characteristicvaluechanged",
                () => resolve(),
                { once: true }
              );
            });
            txCharacteristic.removeEventListener(
              "characteristicvaluechanged",
              handleData
            );
          }
        } catch (error) {
          console.error("Failed to connect to the Bluetooth device:", error);
          setError(error);
        }
      }
    };
    connectToDevice();
  }, [selectedDevice, commands, processFunctions]);

  return { responses, error };
};
