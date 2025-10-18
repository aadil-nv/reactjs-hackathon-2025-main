import React from 'react';
import { useDispatch } from 'react-redux';
import { clearNotifications } from '../redux/features/notificationSlice';

const NotificationList = ({ notifications, onNotificationClick, onClose }) => {
  const dispatch = useDispatch();

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'c':
        return '#';
      case 'd':
        return '@';
      case 'p':
        return '🔒';
      default:
        return '#';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'c':
        return 'bg-blue-100 text-blue-600';
      case 'd':
        return 'bg-green-100 text-green-600';
      case 'p':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notif, index) => (
              <div
                key={index}
                onClick={() => onNotificationClick(notif)}
                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${getTypeColor(notif.type)} flex items-center justify-center font-semibold flex-shrink-0`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {notif.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {notif.unread > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          {notif.unread} unread
                        </span>
                      )}
                      {notif.mentions > 0 && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                          {notif.mentions} mention{notif.mentions !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;