import React from "react";
import ChildBox from "./components/boxes/childboxes";
import GridBox from "./components/boxes/boxes";
import "./App.css";
import UsbPortTest from "./components/usbPortTest/usbPortTest";
// import UsbPortTest from "./components/usbPortTest/usbPortTest";
import store from '../lib/store'
import { Provider } from 'react-redux'
import BluetoothComponentBlock from "./components/bluetoothTest/bluetooth.jsx";

function App() {
  return (
    <Provider store={store}>
    <div className="dash-container justify-center min-h-screen">
    <GridBox>
        <ChildBox value={"10"} headline="Scan Devices" />
        <ChildBox value={"10"} headline="Available Devices" />
        <ChildBox value={"10"} headline="Sessions" />
        <ChildBox value="0" headline="Injured Athletes" />
        <ChildBox value="0" headline="Alerts" />
      </GridBox>
    <BluetoothComponentBlock/>
    <UsbPortTest/>
    </div>

    </Provider>

  );
}

export default App;
