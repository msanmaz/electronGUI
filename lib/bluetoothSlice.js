import { createSlice } from '@reduxjs/toolkit'

// Define a slice of the Redux state
const bluetoothSlice = createSlice({
  name: 'bluetooth',
  initialState: {
    rxCharacteristic: null,
    rxCharacteristicLeft: null,
    txCharacteristic: null,
    txCharacteristicLeft: null,
    isZeroSession: false,
  },
  reducers: {
    setRxCharacteristic: (state, action) => {
      state.rxCharacteristic = action.payload;
    },
    setRxCharacteristicLeft: (state, action) => {
      state.rxCharacteristicLeft = action.payload;
    },
    setTxCharacteristic: (state, action) => {
      state.txCharacteristic = action.payload;
    },
    setTxCharacteristicLeft: (state, action) => {
      state.txCharacteristicLeft = action.payload;
    },
    setIsZeroSession: (state, action) => {
      state.isZeroSession = action.payload;
    },
  },
})

// Export the action creators
export const {
  setRxCharacteristic,
  setRxCharacteristicLeft,
  setTxCharacteristic,
  setTxCharacteristicLeft,
  setIsZeroSession,
} = bluetoothSlice.actions


export default bluetoothSlice.reducer