import React from "react";
import { useDispatch } from "react-redux"
import { setDeviceInfo,setDeviceInfo2 } from "../../../lib/deviceSlice";

 const BluetoothButtons = ({ 
    sendCommand,
    setSelectedDevice, 
    setSelectedDevice2,
    rxCharacteristic, 
    txCharacteristic, 
    handleStreamData,
    rxCharacteristicLeft, 
    txCharacteristicLeft, 
    handleStreamDataLeft,
    packets,
    setPackets,
    packetsLeft,
    setPacketsLeft,
    selectedDevice,
    selectedDevice2
  }) => {
    const dispatch = useDispatch()
    const handleBluetoothRequest = async (setSelectedDeviceFunc) => {
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
            setSelectedDeviceFunc(device);
            return;
          }
          // setDevices((prevDevices) => [...prevDevices, device]);
        } catch (error) {
          console.error(error);
        }
      };


  const handleStartStreaming = async () => {
    if(packets.length > 0 && packetsLeft.length > 0){
      console.log('resetting')
      setPackets([])
      setPacketsLeft([])
    }
  
  //  await sendCommand('ssstr', rxCharacteristic, txCharacteristic, handleStreamData);
   await sendCommand('ssstr', rxCharacteristicLeft, txCharacteristicLeft, handleStreamDataLeft);
  };
  
  const handleStopStreaming = () => {
    txCharacteristic.removeEventListener(
      "characteristicvaluechanged",
      handleStreamData
    );
    txCharacteristicLeft.removeEventListener(
      "characteristicvaluechanged",
      handleStreamDataLeft
    );
  
    return sendCommand('spstr', rxCharacteristic, txCharacteristic, handleStreamData)
      .then(() => sendCommand('spstr', rxCharacteristicLeft, txCharacteristicLeft, handleStreamDataLeft));
  };

    
  const handleCancelBluetoothRequest = React.useCallback(() => {
    if (selectedDevice && selectedDevice2) {
       console.log("Disconnected from GATT server");
      selectedDevice.gatt.disconnect();
      selectedDevice2.gatt.disconnect();
      setSelectedDevice(null);
      setSelectedDevice2(null);
      dispatch(setDeviceInfo(null))
      dispatch(setDeviceInfo2(null))
    }
  }, [selectedDevice,selectedDevice2]);

  

    return (
      <div className=" flex-row gap-[1rem] text-center text-2xl font-extrabold flex justify-center">
        <button onClick={()=>handleBluetoothRequest(setSelectedDevice)}>Test Bluetooth</button>
        {selectedDevice && selectedDevice2  &&  
        <div className="flex flex-col"> 
          <button onClick={handleStartStreaming}>Start Streaming</button>  
          <button onClick={handleStopStreaming}>Stop Streaming</button> 
        </div>}
        <button onClick={handleCancelBluetoothRequest}>Cancel Bluetooth</button>
      </div>
    );
  };
  


  export default BluetoothButtons;