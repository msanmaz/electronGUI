import ChildBox from "./components/boxes/childboxes";
import GridBox from "./components/boxes/boxes";
import "./App.css";
import BluetoothComponent from "./components/bluetoothTest/bluetooth.jsx";


function App() {
  return (
    <>
    <div className="dash-container justify-center min-h-screen">
    <GridBox>
        <ChildBox value={"10"} headline="Scan Devices" />
        <ChildBox value={"10"} headline="Available Devices" />
        <ChildBox value={"10"} headline="Sessions" />
        <ChildBox value="0" headline="Injured Athletes" />
        <ChildBox value="0" headline="Alerts" />
      </GridBox>
    <BluetoothComponent/>
    </div>

    </>
  );
}

export default App;
