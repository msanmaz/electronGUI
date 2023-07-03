
const DeviceInfo = (props) => {
    const {selectedDevice, deviceInfo,setSelectedDevice2} = props
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
  return (
    <>
     <div>
                <p className="text-xl font-bold" onClick={()=>handleBluetoothRequest(setSelectedDevice2)}>
                  Selected Device: {selectedDevice?.name}
                </p>
                <p className="text-xl py-[0.5rem] font-bold">
                  Battery Level: {deviceInfo}%
                </p>
                </div>
    </>
  )
}

export default DeviceInfo