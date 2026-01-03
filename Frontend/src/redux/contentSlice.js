import { createSlice } from "@reduxjs/toolkit";

const contentSlice = createSlice({
  name: "content",
  initialState: {
    allVideosData: [],
    allShortsData: [],
    totalRevenue: 0,
  },
  reducers: {
    setAllVideosData: (state, action) => {
      state.allVideosData = action.payload;
    },
    setAllShortsData: (state, action) => {
      state.allShortsData = action.payload;
    },
    setContentRevenue: (state, action) => {
      state.totalRevenue = action.payload;
    },
  },
});

export const {
  setAllVideosData,
  setAllShortsData,
  setContentRevenue,
} = contentSlice.actions;

export default contentSlice.reducer;