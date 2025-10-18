import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, getMessages } from '../services/rocketchat';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatLayout = () => {
  const { authToken, userId, user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken || !userId) return;
      try {
        const result = await getRooms(authToken, userId);
        if (result.success) {
          setRooms(result.rooms);
          if (result.rooms.length > 0) setCurrentRoom(result.rooms[0]);
        } else setError(result.error);
      } catch {
        setError('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [authToken, userId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoom || !authToken || !userId) return;
      try {
        const result = await getMessages(currentRoom._id, authToken, userId);
        if (result.success) setMessages(result.messages.reverse());
        else setError(result.error);
      } catch {
        setError('Failed to load messages');
      }
    };
    loadMessages();
  }, [currentRoom, authToken, userId]);

  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;

    const pollMessages = async () => {
      try {
        const result = await getMessages(currentRoom._id, authToken, userId);
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
  };

  const handleNewMessage = (message) => setMessages(prev => [...prev, message]);
  const handleLogout = () => logout();

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 justify-center items-center text-gray-600">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-base">{user?.name || user?.username}</span>
          <span className="text-green-500 text-xs mt-1">Online</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Chat content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 min-w-[250px] bg-white border-r border-gray-200 flex flex-col">
          <RoomList rooms={rooms} currentRoom={currentRoom} onRoomSelect={handleRoomSelect} />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {currentRoom ? (
            <>
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <h3 className="text-gray-800 text-lg mb-1">#{currentRoom.name}</h3>
                <p className="text-gray-500 text-sm">{currentRoom.topic || 'No topic set'}</p>
              </div>

              <MessageList messages={messages} currentUserId={userId} />
              <MessageInput roomId={currentRoom._id} onNewMessage={handleNewMessage} />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 text-center">
              <h3 className="text-gray-800 mb-2">Select a room to start chatting</h3>
              <p>Choose a room from the sidebar to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
