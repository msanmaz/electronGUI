import { configureStore } from "@reduxjs/toolkit"
import bluetoothSlice from "./bluetoothSlice"
import deviceSlice from "./deviceSlice"

// Create the Redux store
const store = configureStore({
    reducer: {
        bluetooth: bluetoothSlice,
        device: deviceSlice,
    }
});

export default store;
