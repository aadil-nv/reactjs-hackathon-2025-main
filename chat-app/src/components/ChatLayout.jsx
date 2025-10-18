import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRooms, getMessages, getUsers, createDirectMessage, getIndivitualMessages } from '../services/rocketchat';
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
  const dispatch = useDispatch();

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getRooms(authToken, userId);
        console.log("result is ##########", result);
        
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

  console.log("current roo is @@@@@@@@",currentRoom);
  

  useEffect(() => {
    const loadUsers = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getUsers(authToken, userId);
        if (result.success) {
          // Filter out current user
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
      
      // Don't try to load messages if this is a temporary user object (not a real room)
      if (!currentRoom.t) {
        console.log('Skipping message load - not a room yet');
        return;
      }
      
      try {
          console.log("1111========currentRoom============",currentRoom._id);
        console.log("11111======authToken=================",authToken);
        console.log("1111==========userId===========",userId);
        
        const result = await getMessages(currentRoom._id, authToken, userId);
        if (result.success) {
          setMessages(result.messages.reverse());
        } else {
          // Don't show error for empty rooms
          if (result.error && !result.error.includes('not found')) {
            setError(result.error);
          }
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        // Don't show error for new conversations
      }
    };
    loadMessages();
  }, [currentRoom, authToken, userId]);

  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;
    
    // Don't poll if this isn't a real room yet
    if (!currentRoom.t) return;

    const pollMessages = async () => {
      try {
        console.log("222========currentRoom============",currentRoom._id);
        console.log("=222======authToken=================",authToken);
        console.log("=2222==========userId===========",userId);
        
        const result = await getIndivitualMessages(currentRoom._id, authToken, userId);

        console.log("77777777777777777777777777",result);
        
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
    setError(''); // Clear any previous errors
  };

  const handleUserSelect = async (selectedUser) => {
    setCreatingDM(true);
    setError(''); // Clear any previous errors
    
    try {
      const result = await createDirectMessage(authToken, userId, selectedUser.username);
      if (result.success) {
        // Check if DM already exists in our list
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

      {creatingDM && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-700">Starting conversation...</p>
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
        
        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
          >
            Options
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  handleToggleDnd();
                  setShowOptionsMenu(false);
                }}
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

              {error && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                  {/* <p className="text-red-600 text-sm">{error}</p> */}
                </div>
              )}

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