import React, { useEffect,useState } from "react";

const BleSearch = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const handleUpdateDeviceList = (deviceList) => {
      setDevices(deviceList);
    };

    window.electron.on("update-device-list", handleUpdateDeviceList);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.electron.off("update-device-list", handleUpdateDeviceList);
    };
  }, []);

  const handleDeviceSelected = React.useCallback(async (device) => {
    try {
      window.electron.send("bluetooth-pairing-request", device);
    } catch (error) {
      console.log(`Failed to connect to the Bluetooth device: ${error}`);
    }
  }, []);

  return (
    <>
      <ul>
        {devices.map((device, i) => (
          <li
            className="text-2xl font-bold"
            onClick={() => handleDeviceSelected(device)}
            key={i}
          >
            {device.deviceName || `ID: ${device.deviceId}`}
          </li>
        ))}
      </ul>
    </>
  );
};

export default BleSearch;
