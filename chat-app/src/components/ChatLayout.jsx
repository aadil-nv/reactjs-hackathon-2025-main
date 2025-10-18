import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRooms, getChannelMessages, getUsers, createDirectMessage, getIndivitualMessages, createChannel, createGroup, joinChannel, getNotifications } from '../services/rocketchat';
import ChatList from './ChatList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDnd } from '../redux/features/dndSlice';
import { setNotifications, clearNotifications, markAsRead } from '../redux/features/notificationSlice';

const ChatLayout = () => {
  const { authToken, userId, user, logout } = useAuth();  
  const [rooms, setRooms] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const isDndEnabled = useSelector((state) => state.dnd.isDndEnabled);
  const notifications = useSelector((state) => state.notification.notifications);
  const totalUnread = useSelector((state) => state.notification.totalUnread);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [creatingDM, setCreatingDM] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('');
  const [channelName, setChannelName] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joiningChannel, setJoiningChannel] = useState(false);
  const dispatch = useDispatch();
  const notificationRef = useRef(null);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());
  const [toastNotifications, setToastNotifications] = useState([]);
  console.log("error ",error);
  

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getRooms(authToken, userId);
        console.log("result is #################################", result);
        
        if (result.success) {
          const channels = result.rooms.filter(room => room.t === 'c' || room.t === 'p');
          const dms = result.rooms.filter(room => room.t === 'd');
          
          setRooms(channels);
          setDirectMessages(dms);
          
          if (result.rooms.length > 0) {
            setCurrentRoom(result.rooms[0]);
          }
        } else {
          setError(result.error);
        }
      } catch {
        setError('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [authToken, userId]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getNotifications(authToken, userId);
        if (result.success) {
          dispatch(setNotifications(result.notifications));
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
  }, [authToken, userId, dispatch]);

  // Poll notifications every 5 secondsfsdfasd
  useEffect(() => {
    if (!authToken || !userId) return;

    const pollNotifications = async () => {
      try {
        const result = await getNotifications(authToken, userId);
        if (result.success) {
          // Filter out dismissed notifications
          const filteredNotifications = result.notifications.filter(
            notif => !dismissedNotifications.has(notif.roomId)
          );

          // Check for new notifications to show as toast
          const existingRoomIds = new Set(notifications.map(n => n.roomId));
          const newNotifications = filteredNotifications.filter(
            notif => !existingRoomIds.has(notif.roomId) && notif.unread > 0
          );

          // Show toast for new notifications
          if (newNotifications.length > 0) {
            newNotifications.forEach(notif => {
              const toastId = `${notif.roomId}-${Date.now()}`;
              setToastNotifications(prev => [...prev, { ...notif, id: toastId }]);
              
              // Auto-dismiss toast after 5 seconds
              setTimeout(() => {
                setToastNotifications(prev => prev.filter(t => t.id !== toastId));
              }, 5000);
            });
          }

          dispatch(setNotifications(filteredNotifications));
        }
      } catch (err) {
        console.error('Error polling notifications:', err);
      }
    };

    const interval = setInterval(pollNotifications, 5000);
    return () => clearInterval(interval);
  }, [authToken, userId, dispatch, dismissedNotifications, notifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  console.log("current room is @@@@@@@@", currentRoom);

  useEffect(() => {
    const loadUsers = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getUsers(authToken, userId);
        if (result.success) {
          const otherUsers = result.users.filter(u => u._id !== userId);
          setUsers(otherUsers);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, [authToken, userId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoom || !authToken || !userId) return;
      
      if (!currentRoom.t) {
        console.log('Skipping message load - not a room yet');
        return;
      }
      
      try {
        console.log("1111========currentRoom============", currentRoom._id);
        console.log("11111======authToken=================", authToken);
        console.log("1111==========userId===========", userId);
        
        let result;
        if (currentRoom.t === 'c' || currentRoom.t === 'p') {
          result = await getChannelMessages(currentRoom._id, authToken, userId);
        } else {
          result = await getChannelMessages(currentRoom._id, authToken, userId);
        }
        
        if (result.success) {
          setMessages(result.messages.reverse());
        } else {
          if (result.error && !result.error.includes('not found')) {
            setError(result.error);
          }
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    loadMessages();
  }, [currentRoom, authToken, userId]);

  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;
    
    if (!currentRoom.t) return;

    const pollMessages = async () => {
      try {
        console.log("222========currentRoom============", currentRoom._id);
        console.log("=222======authToken=================", authToken);
        console.log("=2222==========userId===========", userId);
        
        let result;
        if (currentRoom.t === 'c' || currentRoom.t === 'p') {
          result = await getChannelMessages(currentRoom._id, authToken, userId);
        } else {
          result = await getIndivitualMessages(currentRoom._id, authToken, userId);
        }

        console.log("77777777777777777777777777", result);
        
        if (result.success) {
          const newMessages = result.messages.reverse();
          setMessages(prev => (newMessages.length !== prev.length ? newMessages : prev));
        }
      } catch (_err) {
        console.error('Error polling messages:', _err);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [currentRoom, authToken, userId]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setMessages([]);
    setError('');
    dispatch(markAsRead(room._id));
    // Remove from dismissed list when user opens the room
    setDismissedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(room._id);
      return newSet;
    });
  };

  const handleJoinChannel = async (channel) => {
    setJoiningChannel(true);
    setError('');
    
    try {
      const result = await joinChannel(channel.name, authToken, userId);
      if (result.success) {
        setRooms(prev => prev.map(r => 
          r._id === result.channel._id ? result.channel : r
        ));
        setCurrentRoom(result.channel);
        setMessages([]);
      } else {
        setError(result.error || 'Failed to join channel');
      }
    } catch (err) {
      console.error('Error joining channel:', err);
      setError('Failed to join channel');
    } finally {
      setJoiningChannel(false);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    setCreatingDM(true);
    setError('');
    
    try {
      const result = await createDirectMessage(authToken, userId, selectedUser.username);
      if (result.success) {
        const existingDM = directMessages.find(dm => dm._id === result.room._id);
        if (!existingDM) {
          setDirectMessages(prev => [...prev, result.room]);
        }
        setCurrentRoom(result.room);
        setMessages([]);
      } else {
        setError(result.error || 'Failed to start conversation');
      }
    } catch (err) {
      console.error('Error creating DM:', err);
      setError('Failed to start conversation');
    } finally {
      setCreatingDM(false);
    }
  };

  const handleNewMessage = (message) => setMessages(prev => [...prev, message]);
  
  const handleLogoutClick = () => {
    setShowLogoutAlert(true);
    setShowOptionsMenu(false);
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutAlert(false);
  };

  const handleToggleDnd = () => {
    dispatch(toggleDnd());
    setShowOptionsMenu(false);
  };

  const handleNotificationClick = (notification) => {
    const room = [...rooms, ...directMessages].find(r => r._id === notification.roomId);
    if (room) {
      handleRoomSelect(room);
      setShowNotifications(false);
    }
  };

  const handleClearNotifications = () => {
    // Add all current notification room IDs to dismissed list
    const roomIds = notifications.map(n => n.roomId);
    setDismissedNotifications(prev => new Set([...prev, ...roomIds]));
    dispatch(clearNotifications());
  };

  const removeToast = (toastId) => {
    setToastNotifications(prev => prev.filter(t => t.id !== toastId));
  };

  const handleToastClick = (notification) => {
    const room = [...rooms, ...directMessages].find(r => r._id === notification.roomId);
    if (room) {
      handleRoomSelect(room);
      removeToast(notification.id);
    }
  };

  const openCreateModal = (type) => {
    setCreateType(type);
    setShowCreateModal(true);
    setChannelName('');
    setIsReadOnly(false);
    setSelectedMembers([]);
    setCreateError('');
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateType('');
    setChannelName('');
    setIsReadOnly(false);
    setSelectedMembers([]);
    setCreateError('');
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreate = async () => {
    if (!channelName.trim()) {
      setCreateError('Name is required');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      let result;
      if (createType === 'channel') {
        result = await createChannel(channelName.trim(), authToken, userId, isReadOnly);
        if (result.success) {
          setRooms(prev => [...prev, result.channel]);
          setCurrentRoom(result.channel);
          closeCreateModal();
        } else {
          setCreateError(result.error || 'Failed to create channel');
        }
      } else if (createType === 'team') {
        result = await createGroup(channelName.trim(), authToken, userId, selectedMembers);
        if (result.success) {
          setRooms(prev => [...prev, result.group]);
          setCurrentRoom(result.group);
          closeCreateModal();
        } else {
          setCreateError(result.error || 'Failed to create team');
        }
      }
    } catch (err) {
      console.error('Error creating:', err);
      setCreateError('Failed to create. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'channels':
        return rooms;
      case 'direct':
        return directMessages;
      case 'users':
        return users;
      case 'all':
      default:
        return [...rooms, ...directMessages];
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 justify-center items-center text-gray-600">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  // if (error && !currentRoom) {
  //   return (
  //     <div className="flex flex-col h-screen justify-center items-center text-gray-600 text-center p-5">
  //       <h2 className="text-red-600 mb-4 text-xl">Error</h2>
  //       <p>{error}</p>
  //       <button
  //         onClick={() => window.location.reload()}
  //         className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded mt-4 transition-colors"
  //       >
  //         Retry
  //       </button>
  //     </div>
  //   );
  // }

  const filteredItems = getFilteredItems();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toastNotifications.map((toast) => (
          <div
            key={toast.id}
            className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 pointer-events-auto transform transition-all duration-300 ease-in-out animate-slide-in"
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <style>{`
              @keyframes slideIn {
                from {
                  transform: translateX(400px);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            `}</style>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {toast.type === 'd' ? '@' : '#'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 truncate">
                    {toast.name}
                  </span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {toast.mentions > 0 ? (
                    <span className="text-red-600 font-medium">
                      {toast.mentions} new mention{toast.mentions !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span>
                      {toast.unread} new message{toast.unread !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => handleToastClick(toast)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLogoutAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Create {createType === 'channel' ? 'Channel' : 'Team'}
                </h3>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {createError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  {createType === 'channel' ? 'Channel' : 'Team'} Name
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder={`Enter ${createType} name`}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                />
              </div>

              {createType === 'channel' && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isReadOnly}
                      onChange={(e) => setIsReadOnly(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      disabled={creating}
                    />
                    <span className="text-gray-700">Read-only channel</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Only admins can post messages
                  </p>
                </div>
              )}

              {createType === 'team' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Add Members (Optional)
                  </label>
                  <div className="border border-gray-300 rounded max-h-48 overflow-y-auto">
                    {users.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No users available
                      </div>
                    ) : (
                      users.map(user => (
                        <label
                          key={user._id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(user.username)}
                            onChange={() => toggleMemberSelection(user.username)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            disabled={creating}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                              {(user.name || user.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {user.name || user.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedMembers.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeCreateModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={creating || !channelName.trim()}
              >
                {creating && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {(creatingDM || joiningChannel) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-700">
              {joiningChannel ? 'Joining channel...' : 'Starting conversation...'}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-base">{user?.name || user?.username}</span>
          <span className={`text-xs mt-1 ${isDndEnabled ? 'text-yellow-500' : 'text-green-500'}`}>
            {isDndEnabled ? 'Do Not Disturb' : 'Online'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.roomId}
                        onClick={() => handleNotificationClick(notif)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {notif.type === 'd' ? '@' : '#'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-800 truncate">
                                {notif.name}
                              </span>
                              {notif.unread > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                  {notif.unread}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {notif.mentions > 0 ? (
                                <span className="text-red-600 font-medium">
                                  {notif.mentions} mention{notif.mentions !== 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span>
                                  {notif.unread} unread message{notif.unread !== 1 ? 's' : ''}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => openCreateModal('channel')}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
            title="Add Channel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Channel
          </button>
          
          <button
            onClick={() => openCreateModal('team')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
            title="Add Team"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Team
          </button>

          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleToggleDnd}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-700">Do Not Disturb</span>
                  <div className={`w-12 h-6 rounded-full transition-colors ${isDndEnabled ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${isDndEnabled ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`}></div>
                  </div>
                </button>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-1/4 min-w-[250px] bg-white border-r border-gray-200 flex flex-col">
          <ChatList 
            rooms={filteredItems}
            currentRoom={currentRoom} 
            onRoomSelect={handleRoomSelect}
            onUserSelect={handleUserSelect}
            onJoinChannel={handleJoinChannel}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            channelCount={rooms.length}
            directCount={directMessages.length}
            userCount={users.length}
            currentUserId={userId}
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-100">
          {currentRoom ? (
            <>
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <h3 className="text-gray-800 text-lg mb-1">
                  {currentRoom.t === 'd' ? '@' : currentRoom.t ? '#' : '@'}
                  {currentRoom.name || currentRoom.fname || currentRoom.username || currentRoom.usernames?.[1]}
                </h3>
                <p className="text-gray-500 text-sm">
                  {currentRoom.topic || (currentRoom.t ? 'No topic set' : 'Start a new conversation')}
                </p>
              </div>

              {/* {error && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )} */}

              <MessageList messages={messages} currentUserId={userId} />
              <MessageInput roomId={currentRoom._id} onNewMessage={handleNewMessage} />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 text-center">
              <h3 className="text-gray-800 mb-2">Select a chat to start messaging</h3>
              <p>Choose a channel or direct message from the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;