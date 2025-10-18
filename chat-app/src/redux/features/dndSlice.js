import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDndEnabled: false,
};

const dndSlice = createSlice({
  name: 'dnd',
  initialState,
  reducers: {
    toggleDnd: (state) => {
      state.isDndEnabled = !state.isDndEnabled;
    },
    setDnd: (state, action) => {
      state.isDndEnabled = action.payload;
    },
  },
});

export const { toggleDnd, setDnd } = dndSlice.actions;
export default dndSlice.reducer;
