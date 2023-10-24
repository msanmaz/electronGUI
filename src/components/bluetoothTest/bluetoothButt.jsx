 const BluetoothButt = ({ 
    sendCommand,
    setSelectedDevice, 
    rxCharacteristic, 
    txCharacteristic, 
    handleStreamData,
    packets,
    setPackets,
    selectedDevice,
    handleStartStreamingWorker = () => {},
    handleStopStreamingWorker= () => {},
  }) => {
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
    if(packets?.length > 0){
      console.log('resetting')
      setPackets([])
    }

   await sendCommand('ssstr', rxCharacteristic, txCharacteristic, handleStreamData);
  };
  
  const handleStopStreaming = () => {
    txCharacteristic.removeEventListener(
      "characteristicvaluechanged",
      handleStreamData
    );
    return sendCommand('spstr', rxCharacteristic, txCharacteristic, handleStreamData)
  };



    return (
      <div className=" flex-row gap-[1rem] text-center text-2xl font-extrabold flex justify-center">
        {
            !selectedDevice &&
        <button onClick={()=>handleBluetoothRequest(setSelectedDevice)}>Test Bluetooth</button>

        }
        {selectedDevice  &&  
        <div className="flex flex-col"> 
                  <button onClick={handleStartStreamingWorker}>Start Worker Thread Streaming</button>  
                  <button onClick={handleStopStreamingWorker}>Stop Worker Thread Streaming</button>  

          <button onClick={handleStartStreaming}>Start Streaming</button>  
          <button onClick={handleStopStreaming}>Stop Streaming</button> 
        </div>}
      </div>
    );
  };
  


  export default BluetoothButt