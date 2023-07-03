// import React,{useState} from 'react'
// import LineChartPlot from '../lineChart/lineChart'
// import { connectToDevice,isPacketUnwanted, sendCommand,calculateAverage } from '../../hooks/utilities'
// import useGetWordFromFourBytes from '../../hooks/useGetWordFromFourBytes'
// import useGetWordFromTwoBytes from '../../hooks/useGetWordFromTwoBytes'
// import BluetoothButt from './bluetoothButt'
// import DeviceInfo from '../deviceInfo/deviceInfo'
// import useGetWordFromTwoBytes12 from '../../hooks/useGetWordFromTwoBytes12'

// const MAX_PACKETS = 1000;
// const RightGraph = ({isZeroSessionRef,setIsZeroSession}) => {
//     const [selectedDevice, setSelectedDevice] = useState(null);
//     const [rxCharacteristic, setRxCharacteristic] = useState(null);
//     const [txCharacteristic, setTxCharacteristic] = useState(null);
//     const [deviceInfo, setDeviceInfo] = useState(null);
//     const [localPackets, setLocalPackets] = useState([]);
//     const [average, setAverage] = useState(null);
//     const [packets, setPackets] = React.useState([]);



//     const getWordFromFourBytes = useGetWordFromFourBytes();
//     const getWordFromTwoBytes = useGetWordFromTwoBytes();
//     const getWordFrom12Bytes = useGetWordFromTwoBytes12();

//     React.useEffect(() => {
//         connectToDevice(selectedDevice, setRxCharacteristic, setTxCharacteristic, setDeviceInfo);
//         return () => {
//           if (selectedDevice) {
//             selectedDevice.gatt.disconnect();
//             console.log("Disconnected from GATT server");
//           }
//         };
//       }, [selectedDevice]);


// React.useEffect(() => {
//     if (localPackets?.length >= 251) {
//       const leftAverage = calculateAverage(localPackets);
//       console.log(`Left average: ${leftAverage}`);
//       setAverage(leftAverage)
//     }
//   }, [localPackets]);
  
  
//   const handleStopZeroSession = () => {
//     return sendCommand('spstr', rxCharacteristic, txCharacteristic, handleStreamData)
//       .then(() => setIsZeroSession(false));
//   };

//   const handleStartZeroSession = () => {
//     return sendCommand('ssstr', rxCharacteristic, txCharacteristic, handleStreamData)
//       .then(() => setIsZeroSession(true));
//   };
//       const onZeroSessionPacketReceived = React.useCallback(
//         (packet, left = null) => {
//           let counter = getWordFromFourBytes(
//             packet[4],
//             packet[5],
//             packet[6],
//             packet[7],
//             true
//           );
    
//           // Split the packet into multiple packages of 56 bytes each
//           const packages = [];
//           for (let i = 8; i < packet.length; i += 56) {
//             packages.push(packet.slice(i, i + 56));
//           }
    
//           // Process each package
//           packages.forEach((packages, index) => {
//             let parsedPackage = {
//               counter: counter + index,
//               side: left ? 'L' : 'R',
//             };
    
//             for (let i = 1; i <= 16; i++) {
//               const index = 24 + (i - 1) * 2;
//               parsedPackage["c" + i] = getWordFromTwoBytes(
//                 packages[index],
//                 packages[index + 1],
//                 true
//               );
//             }
//             if(parsedPackage.counter  === 252){
//               handleStopZeroSession()
//               return
//             }
//             console.log(`Chunk ${index + 1}:`, parsedPackage);
//             setLocalPackets(oldPackets => [...oldPackets, parsedPackage]); 
//           });
//         },
//         [getWordFromTwoBytes, getWordFromFourBytes,rxCharacteristic,txCharacteristic]
//       );

//       const onPacketReceived = React.useCallback(
//         (packet,left=null) => {
//           let counter = getWordFromFourBytes(
//             packet[4],
//             packet[5],
//             packet[6],
//             packet[7],
//             true
//           );
//           // Split the packet into multiple packages of 56 bytes each
//           const packages = [];
//           for (let i = 8; i < packet.length; i += 56) {
//             packages.push(packet.slice(i, i + 56));
//           }
//           // Process each package
//           packages.forEach((packages, index) => {
//             let parsedPackage = {
//               counter: counter + index,
//               side: left ? 'L' : 'R',
//               G_X: getWordFromTwoBytes(packages[0], packages[1], false) * 0.07,
//               G_Y: getWordFromTwoBytes(packages[2], packages[3], false) * 0.07,
//               G_Z: getWordFromTwoBytes(packages[4], packages[5], false) * 0.07,
//               A_X:
//                 (getWordFromTwoBytes(packages[6], packages[7], false) * 0.488) /
//                 1000,
//               A_Y:
//                 (getWordFromTwoBytes(packages[8], packages[9], false) * 0.488) /
//                 1000,
//               A_Z:
//                 (getWordFromTwoBytes(packages[10], packages[11], false) * 0.488) /
//                 1000,
//               M_X: getWordFromTwoBytes(packages[12], packages[13], false),
//               M_Y: getWordFromTwoBytes(packages[14], packages[15], false),
//               M_Z: getWordFromTwoBytes(packages[16], packages[17], false),
//               A_X_W:
//                 getWordFrom12Bytes(packages[18], packages[19], false) * -1 * 0.049,
//               A_Y_W:
//                 getWordFrom12Bytes(packages[20], packages[21], false) * -1 * 0.049,
//               A_Z_W: getWordFrom12Bytes(packages[22], packages[23], false) * 0.049,
//             };
    
//             for (let i = 1; i <= 16; i++) {
//               const index = 24 + (i - 1) * 2;
//               parsedPackage["c" + i] = getWordFromTwoBytes(
//                 packages[index],
//                 packages[index + 1],
//                 true
//               );
//             }
              
//             //  console.log(`Chunk ${index + 1}:`, parsedPackage);
//               setPackets((oldPackets) => {
//                 const newPackets = [...oldPackets, parsedPackage];
//                 return newPackets.slice(Math.max(newPackets.length - MAX_PACKETS, 0));
//               });
            
//           });
//         },
//         [getWordFrom12Bytes, getWordFromFourBytes, setPackets, getWordFromTwoBytes]
//       );


//       const handleStreamData = React.useCallback(
//         (event) => {
//           let value = event.target.value;
//           let responseBytes = [];
    
//           for (let i = 0; i < value.byteLength; i++) {
//             responseBytes.push(value.getUint8(i));
//           }
    
//           const unwantedPacketStart = [115, 115, 115, 116, 114, 33];
//           const unwantedPacketStop = [115, 112, 115, 116, 114, 33];
//           const unwantedPackets = [unwantedPacketStart, unwantedPacketStop];
//           const isUnwanted = isPacketUnwanted(responseBytes, unwantedPackets);
    
//           if (!isUnwanted) {
//             if(isZeroSessionRef.current){
//               onZeroSessionPacketReceived(responseBytes);
//               // console.log(`Received package data (zero session): ${responseBytes}`);
//               return
//             }
//             // Process the streaming data here
//             onPacketReceived(responseBytes);
//             //  console.log(`Received package data: ${responseBytes}`);
//           }
//         },
//         [onPacketReceived, onZeroSessionPacketReceived]
//       );




    
    

//   return (
// <div className='flex flex-col w-[50%]'>
// <BluetoothButt
// selectedDevice={selectedDevice}
// setSelectedDevice={setSelectedDevice}
// sendCommand={sendCommand}
// rxCharacteristic={rxCharacteristic}
// txCharacteristic={txCharacteristic}
// handleStreamData={handleStreamData}
// packets={packets}
// setPackets={setPackets}
// />
// <DeviceInfo
//                 setSelectedDevice2={setSelectedDevice}
//                 deviceInfo={deviceInfo}
//                 selectedDevice={selectedDevice}
//               />
//               <div onClick={handleStartZeroSession}>Zero Session</div>

// <LineChartPlot data={packets} zeroSession={average} />

// </div>
//   )
// }

// export default RightGraph





import React, { useState } from "react";
import LineChartPlot from "../lineChart/lineChart";
import {
  connectToDevice,
  sendCommand,
  calculateAverage,
} from "../../hooks/utilities";
import BluetoothButt from "./bluetoothButt";
import DeviceInfo from "../deviceInfo/deviceInfo";

const left = false;

const RightGraph = ({ isZeroSessionRef, setIsZeroSession }) => {
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

  let batch = []
  React.useEffect(() => {
    const workerPacket = new Worker(
      new URL("../../workerForth.js", import.meta.url)
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
      };
    return () => {
        workerPacket.terminate();
    };
  }, []);

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

export default RightGraph;
