import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRooms, getMessages, getUsers, createDirectMessage, getIndivitualMessages, createChannel, createGroup } from '../services/rocketchat';
import ChatList from './ChatList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDnd } from '../redux/features/dndSlice';

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
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [creatingDM, setCreatingDM] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(''); // 'channel' or 'team'
  const [channelName, setChannelName] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getRooms(authToken, userId);
        
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
        
        const result = await getMessages(currentRoom._id, authToken, userId);
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
        
        const result = await getIndivitualMessages(currentRoom._id, authToken, userId);
        
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

  if (error && !currentRoom) {
    return (
      <div className="flex flex-col h-screen justify-center items-center text-gray-600 text-center p-5">
        <h2 className="text-red-600 mb-4 text-xl">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded mt-4 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Logout Alert Modal */}
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

      {/* Create Channel/Team Modal */}
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

      {/* Creating DM Loading */}
      {creatingDM && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-700">Starting conversation...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-base">{user?.name || user?.username}</span>
          <span className={`text-xs mt-1 ${isDndEnabled ? 'text-yellow-500' : 'text-green-500'}`}>
            {isDndEnabled ? 'Do Not Disturb' : 'Online'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Channel/Team Buttons */}
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

          {/* Options Menu */}
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
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-1/4 min-w-[250px] bg-white border-r border-gray-200 flex flex-col">
          <ChatList 
            rooms={filteredItems}
            currentRoom={currentRoom} 
            onRoomSelect={handleRoomSelect}
            onUserSelect={handleUserSelect}
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
                  {currentRoom.name || currentRoom.fname || currentRoom.username || currentRoom.usernames[0] }
                </h3>
                <p className="text-gray-500 text-sm">
                  {currentRoom.topic || (currentRoom.t ? 'No topic set' : 'Start a new conversation')}
                </p>
              </div>

              {/* {error && ( */}
                {/* <div className="px-6 py-3 bg-red-50 border-b border-white"> */}
                  {/* <p className="text-red-600 text-sm">{error}</p> */}
                {/* </div> */}
              {/* // )} */}

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