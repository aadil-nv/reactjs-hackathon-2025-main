import React from 'react';

const ChatList = ({ 
  rooms, 
  currentRoom, 
  onRoomSelect, 
  activeTab, 
  onTabChange,
  channelCount,
  directCount,
  currentUserId 
}) => {
  const totalCount = channelCount + directCount;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e1e5e9] bg-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="m-0 text-[#333] text-base font-semibold">Chats</h3>
          <span className="bg-[#667eea] text-white px-2 py-1 rounded-full text-[12px] font-semibold">
            {rooms.length}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange('all')}
            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => onTabChange('channels')}
            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'channels'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Channels ({channelCount})
          </button>
          <button
            onClick={() => onTabChange('direct')}
            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'direct'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Direct ({directCount})
          </button>
        </div>
      </div>

      {/* Room/User list */}
      <div
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1',
        }}
      >
        {rooms.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-52 text-[#666] text-sm text-center px-4">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium mb-1">No {activeTab === 'channels' ? 'channels' : activeTab === 'direct' ? 'direct messages' : 'chats'}</p>
            <p className="text-xs">Start a conversation to get chatting!</p>
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = currentRoom?._id === room._id;
            const isDirect = room.t === 'd';
            
            // For direct messages, get the other user's name
            const displayName = isDirect 
              ? (room.usernames?.find(name => name !== currentUserId) || room.fname || room.name || 'Unknown User')
              : (room.name || room.fname || 'Unnamed Room');

            return (
              <div
                key={room._id}
                onClick={() => onRoomSelect(room)}
                className={`
                  flex items-center px-5 py-3 cursor-pointer border-l-3
                  ${isActive ? 'bg-blue-100 border-l-[#667eea]' : 'border-l-transparent'}
                  hover:bg-gray-100 transition-colors
                `}
              >
                {/* Avatar/Icon */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0
                  ${isDirect 
                    ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white' 
                    : room.t === 'p' 
                      ? 'bg-orange-500 text-white'
                      : 'bg-[#667eea] text-white'
                  }
                `}>
                  {isDirect ? (
                    displayName.charAt(0).toUpperCase()
                  ) : (
                    room.t === 'p' ? '🔒' : '#'
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-[#333] text-sm truncate">
                      {displayName}
                    </span>
                    {isDirect && (
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Online"></span>
                    )}
                  </div>
                  <div className="text-[#666] text-xs truncate">
                    {room.topic || room.lastMessage?.msg || 'No recent messages'}
                  </div>
                </div>

                {/* Unread badge */}
                {room.unread > 0 && (
                  <div className="bg-red-600 text-white rounded-full px-2 py-0.5 text-[11px] font-semibold min-w-[20px] text-center ml-2">
                    {room.unread > 99 ? '99+' : room.unread}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;