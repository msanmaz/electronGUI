import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedDevice: null,
  selectedDevice2: null,
  deviceInfo: null,
  deviceInfo2: null,
  packets: [],
  packetsLeft: [],
  localPacketsRight: [],
  localPacketsLeft: [],
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setSelectedDevice: (state, action) => {
      state.selectedDevice = action.payload;
    },
    setSelectedDevice2: (state, action) => {
      state.selectedDevice2 = action.payload;
    },
    setDeviceInfo: (state, action) => {
      state.deviceInfo = action.payload;
    },
    setDeviceInfo2: (state, action) => {
      state.deviceInfo2 = action.payload;
    },
    setPackets: (state, action) => {
      state.packets = action.payload;
    },
    setPacketsLeft: (state, action) => {
      state.packetsLeft = action.payload;
    },
    setLocalPacketsRight: (state, action) => {
      state.localPacketsRight = action.payload;
    },
    setLocalPacketsLeft: (state, action) => {
      state.localPacketsLeft = action.payload;
    },
  },
});

export const { 
  setSelectedDevice, setSelectedDevice2, setDeviceInfo, 
  setDeviceInfo2, setPackets, setPacketsLeft, 
  setLocalPacketsRight, setLocalPacketsLeft 
} = deviceSlice.actions;

export default deviceSlice.reducer;
