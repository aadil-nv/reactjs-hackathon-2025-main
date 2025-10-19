// features/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], 
  totalUnread: 0, 
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
      state.totalUnread = state.notifications.reduce(
        (sum, n) => sum + (n.unread || 0),
        0
      );
    },

    addNotification: (state, action) => {
      const existingIndex = state.notifications.findIndex(
        (n) => n.roomId === action.payload.roomId
      );

      if (existingIndex >= 0) {
        state.notifications[existingIndex] = {
          ...state.notifications[existingIndex],
          ...action.payload,
        };
      } else {
        state.notifications.push(action.payload);
      }

      state.totalUnread = state.notifications.reduce(
        (sum, n) => sum + (n.unread || 0),
        0
      );
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.roomId !== action.payload
      );
      state.totalUnread = state.notifications.reduce(
        (sum, n) => sum + (n.unread || 0),
        0
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.totalUnread = 0;
    },

    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.roomId === action.payload
      );
      if (notification) {
        notification.unread = 0;
        notification.mentions = 0;
      }
      state.totalUnread = state.notifications.reduce(
        (sum, n) => sum + (n.unread || 0),
        0
      );
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  clearNotifications,
  markAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
