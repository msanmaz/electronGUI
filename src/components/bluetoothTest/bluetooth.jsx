import React, { useEffect } from "react";
import BleSearch from "./bleSearch";
import GraphWrapper from "./graphWrapper";


function BluetoothComponent() {
  const [isZeroSession, setIsZeroSession] = React.useState(false);

  const isZeroSessionRef = React.useRef(isZeroSession);

useEffect(() => {
  isZeroSessionRef.current = isZeroSession;
}, [isZeroSession]);


  
return (
    <>
       <BleSearch />
       <GraphWrapper  setIsZeroSession={setIsZeroSession} isZeroSessionRef={isZeroSessionRef} />
    </>
  );
}

export default BluetoothComponent;
