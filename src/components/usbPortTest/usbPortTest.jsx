// // import { useState } from "react";

// // const UsbPortTest = () => {
// //   const getPorts = async () => {
// //     try {
// //       const port = await navigator.serial.requestPort();
// //       await port.open({ baudRate: 9600 });  // replace with your required baud rate
// //      port.getSignals().then((info) =>{return info, console.log(info)})

// //       const reader = port.readable.getReader();
// //       const data = await reader.read();
// //       console.log(data)
// //       // Assuming the data received is in text format
// //       const receivedData = new TextDecoder().decode(data.value);
// //       console.log(receivedData)
// //       // setDevices((prevDevices) => [...prevDevices, receivedData]);

// //       await reader.cancel();
// //       await port.close();
// //     } catch (err) {
// //       console.error('There was an error:', err);
// //     }
// //   };
  
// //   return (
// //     <>      
// //       <h2>Serial Ports</h2>
// //       <button onClick={getPorts}>Request Serial Port</button>
// //     </>
// //   );
// // };

// // export default UsbPortTest;

// import { useEffect, useState } from "react";

// const UsbPortTest = () => {
//   const [ports, setPorts] = useState([]);

//   useEffect(() => {
//     const handleUpdateSerialPorts = (event, ports) => {
//       setPorts(ports);
//     };

//     window.electron.on('update-serial-ports', handleUpdateSerialPorts);

//     // Clean up the event listener when the component unmounts
//     return () => {
//       window.electron.off('update-serial-ports', handleUpdateSerialPorts);
//     };
//   }, []);

//   const refreshSerialPorts = () => {
//     window.electron.send('refresh-serial-ports');
//   };
//   console.log(ports)
//   return (
//     <>      
//       <h2>Serial Ports</h2>
//       <button onClick={refreshSerialPorts}>Refresh Serial Ports</button>
//       <ul>
//         {ports.map((port, index) => (
//           <li key={index}>{port.path}</li>
//         ))}
//       </ul>
//     </>
//   );
// };

// export default UsbPortTest;


import {useState} from 'react';
const UsbPortTest = () => {
  const [error, setError] = useState(null);
  const requestDevice = () => {
    if (!navigator.usb) {
      console.error('WebUSB not supported');
      return;
    }

    navigator.usb.requestDevice({ filters: [{vendorId:0x2544}] })
      .then(device => {
        console.log(device.productName);
        console.log(device.manufacturerName);
        return device.open() // Begin a session.
      })
      // .then((device)=> device.selectConfiguration(1))
      // .then((device) => device.claimInterface(2))
      .catch(error => {
        setError(error.message)
        console.error('There was an error:', error.message);
      });
  };

  return (
    <div>
      <button onClick={requestDevice}>Request USB Device</button>
      {error&&<p className='text-xl font-bold text-red-500'>{error}</p>}
    </div>
  );
};

export default UsbPortTest;
