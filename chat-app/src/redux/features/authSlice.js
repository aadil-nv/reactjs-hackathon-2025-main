import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  authToken: null,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, authToken, userId } = action.payload;
      state.user = user;
      state.authToken = authToken;
      state.userId = userId;
    },
    logout: (state) => {
      state.user = null;
      state.authToken = null;
      state.userId = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
