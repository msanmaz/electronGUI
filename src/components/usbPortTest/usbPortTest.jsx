import React,{ useState } from "react";
const UsbPortTest = () => {
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState(null);

  
  React.useEffect(() => {
    const handleUpdateDeviceList = (deviceList) => {
      setDevices(deviceList);
    };

    window.electron.on("get-usb-device-list", handleUpdateDeviceList);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.electron.off("get-usb-device-list", handleUpdateDeviceList);
    };
  }, []);

  const requestSerialPort = async () => {
    if (!navigator.serial) {
      console.error("Web Serial not supported");
      return;
    }

    try {
      const port = await navigator.usb.requestDevice({
        filters: [{ usbVendorId: 0x05ac }],
      });
      await port.open({ baudRate: 9600 });
      console.log("Serial port opened:", port);
      await port.selectConfiguration(1);
      port.configuration.interfaces.forEach((interfacess) => {
        interfacess.alternates.forEach((alternate) => {
          alternate.endpoints.forEach((endpoint) => {
            console.log("Endpoint Number:", endpoint.endpointNumber);
            console.log("Direction:", endpoint.direction);
          });
        });
      });
      await port.claimInterface(0);
      console.log("Serial port configured!");
      const transfer = await port.transferOut(
        2,
        new Uint8Array(
          new TextEncoder().encode("./ideviceinfo -q com.apple.mobile.battery")
        )
      );
      console.log(transfer, "out");
      port.transferIn(3,41).then((result) => {
        if(result){
          console.log(result, "in")
        }
      })
      const response = await port.transferIn(1, 64); // Assuming endpoint 1 and 64 bytes of data
      console.log(response);
    } catch (error) {
      setError(error.message);
      console.error("There was an error:", error.message);
    }
  };



  return (
    <div>
      <button onClick={requestSerialPort}>Request USB Device</button>
      {error && <p className="text-xl font-bold text-red-500">{error}</p>}
        {
          devices&&
                <p>Name: {devices.device.productName}, Serial: {devices.device.serialNumber}</p>     
        }
    </div>
  );
};

export default UsbPortTest;
