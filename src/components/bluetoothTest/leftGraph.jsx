import React, { useState } from "react";
import LineChartPlot from "../lineChart/lineChart";
import {
  connectToDevice,
  sendCommand,
  calculateAverage,
} from "../../hooks/utilities";
import BluetoothButt from "./bluetoothButt";
import DeviceInfo from "../deviceInfo/deviceInfo";

const left = true;

const LeftGraph = ({ isZeroSessionRef, setIsZeroSession }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [localPackets, setLocalPackets] = useState([]);
  const [average, setAverage] = useState(null);
  const [packets, setPackets] = React.useState([]);
  const rxCharacteristicRef = React.useRef(null);
  const txCharacteristicRef = React.useRef(null);
  const rxCharacteristic = rxCharacteristicRef.current;
  const txCharacteristic = txCharacteristicRef.current;

  const workerPacketRef = React.useRef(null);
  const workerRef = React.useRef(null);

  const setRxCharacteristic = (value) => {
    rxCharacteristicRef.current = value;
  };

  const setTxCharacteristic = (value) => {
    txCharacteristicRef.current = value;
  };

  React.useEffect(() => {
    connectToDevice(
      selectedDevice,
      setRxCharacteristic,
      setTxCharacteristic,
      setDeviceInfo
    );
    return () => {
      if (selectedDevice) {
        selectedDevice.gatt.disconnect();
        console.log("Disconnected from GATT server");
      }
    };
  }, [selectedDevice]);

  React.useEffect(() => {
    if (localPackets?.length >= 251) {
      const leftAverage = calculateAverage(localPackets);
      console.log(`Left average: ${leftAverage}`);
      setAverage(leftAverage);
    }
  }, [localPackets]);

  const handleStopZeroStreamingWorker = () => {

    workerRef.current.terminate(); // Terminate the worker
    workerRef.current = "TERMINATED"; // Indicate that the worker is terminated
    setIsZeroSession(false);
    txCharacteristicRef.current.removeEventListener(
        "characteristicvaluechanged",
        handleStreamData
      );
    return sendCommand(
      "spstr",
      rxCharacteristicRef.current,
      txCharacteristicRef.current,
      handleStreamData
    );
  };

  const handleStartZeroSession = () => {
    return sendCommand(
      "ssstr",
      rxCharacteristic,
      txCharacteristic,
      handleStreamData
    ).then(() => setIsZeroSession(true));
  };


  React.useEffect(() => {
    const worker = new Worker(new URL("../../worker.js", import.meta.url));
    workerRef.current = worker;
    worker.onmessage = function ({ data: { parsedPackage, stopZeroSession } }) {
      if (stopZeroSession) {
        handleStopZeroStreamingWorker();
      } else {
        setLocalPackets((oldPackets) => [...oldPackets, parsedPackage]);
      }
    };
    return () => {
      worker.terminate();
    };
  }, []);


const updatePackets = (newPackets) => {
  requestAnimationFrame(() => {
    setPackets(newPackets);
  });
};


  let batch = []
  React.useEffect(() => {
    const workerPacket = new Worker(
      new URL("../../workerSecond.js", import.meta.url)
    );
    workerPacketRef.current = workerPacket

    workerPacket.onmessage = function ({ data: { responseBytes } }) {
      batch.push(responseBytes)
      if(batch.length >= 20){
        setPackets((oldPackets) => {
          const newPackets = [...oldPackets, responseBytes];
          return newPackets.slice(Math.max(newPackets.length - 500, 0));
        });
        batch = [];
      return;
      }

      // requestAnimationFrame(() => {
      //   setPackets((oldPackets) => {
      //     const newPackets = [...oldPackets, ...batch]; // Here batch of updates are used instead of a single update
      //     batch = [];
      //     return newPackets.slice(Math.max(newPackets.length - 1000, 0));
      //   });
      // });

      };
    return () => {
        workerPacket.terminate();
    };
  }, []);
  console.log(packets,'packets')

  const handleStreamData = React.useCallback(
    (event) => {
      if (localPackets.length === 0) {
        workerRef.current.postMessage({
          value: event.target.value,
          isZeroSessionRef: isZeroSessionRef.current, // assuming this is a ref
          side: left,
        });
      } else {
        workerPacketRef.current.postMessage({
          value: event.target.value,
          side: left,
          zeroSession:average
        });
      }
    },
    [isZeroSessionRef.current, localPackets,average]
  );

  const handleStartStreamingWorker = async () => {
    await sendCommand(
      "ssstr",
      rxCharacteristic,
      txCharacteristic,
      handleStreamData
    );
  };

  const handleStopStreamingWorker = () => {
    workerPacketRef.current.terminate(); // Terminate the worker
    workerPacketRef.current = "TERMINATED"; // Indicate that the worker is terminated
    txCharacteristic.removeEventListener(
      "characteristicvaluechanged",
      handleStreamData
    );
    return sendCommand(
      "spstr",
      rxCharacteristic,
      txCharacteristic,
      handleStreamData
    );
  };

  return (
    <div className="flex flex-col w-[50%]">
      <BluetoothButt
        workerRef={workerRef}
        handleStartStreamingWorker={handleStartStreamingWorker}
        handleStopStreamingWorker={handleStopStreamingWorker}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        sendCommand={sendCommand}
        rxCharacteristic={rxCharacteristic}
        txCharacteristic={txCharacteristic}
        handleStreamData={handleStreamData}
        packets={packets}
        setPackets={setPackets}
      />
      <DeviceInfo
        setSelectedDevice2={setSelectedDevice}
        deviceInfo={deviceInfo}
        selectedDevice={selectedDevice}
      />
      <div onClick={handleStartZeroSession}>Zero Session: {localPackets.length}</div>
      <LineChartPlot data={packets} left={true} zeroSession={average} />
    </div>
  );
};

export default LeftGraph;
