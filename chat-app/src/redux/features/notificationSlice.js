// features/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // all notification objects
  totalUnread: 0, // total unread count
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Set all notifications at once
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
      state.totalUnread = state.notifications.reduce(
        (sum, n) => sum + (n.unread || 0),
        0
      );
    },

    // Add or update a single notification
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

    // Remove a notification by room ID
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.roomId !== action.payload
      );
      state.totalUnread = state.notifications.reduce(
        (sum, n) => sum + (n.unread || 0),
        0
      );
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.totalUnread = 0;
    },

    // Mark a specific room as read
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
