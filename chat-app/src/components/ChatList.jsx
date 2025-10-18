import React from 'react';
import { useSelector } from 'react-redux';

const ChatList = ({ 
  rooms, 
  currentRoom, 
  onRoomSelect,
  onUserSelect,
  activeTab, 
  onTabChange,
  channelCount,
  directCount,
  userCount,
  currentUserId 
}) => {
  console.log("Chat list is calling ===>", rooms, currentRoom, activeTab);
  const totalCount = channelCount + directCount;
  const isUsersTab = activeTab === 'users';
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e1e5e9] bg-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="m-0 text-[#333] text-base font-semibold">
            {isUsersTab ? 'Users' : 'Chats'}
          </h3>
          <span className="bg-[#667eea] text-white px-2 py-1 rounded-full text-[12px] font-semibold">
            {isUsersTab ? userCount : rooms.length}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onTabChange('all')}
            className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => onTabChange('channels')}
            className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'channels'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Channels ({channelCount})
          </button>
          <button
            onClick={() => onTabChange('direct')}
            className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'direct'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Direct ({directCount})
          </button>
          <button
            onClick={() => onTabChange('users')}
            className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-[#667eea] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Users ({userCount})
          </button>
        </div>
      </div>

      {/* List */}
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
            <p className="font-medium mb-1">
              No {activeTab === 'channels' ? 'channels' : activeTab === 'direct' ? 'direct messages' : activeTab === 'users' ? 'users found' : 'chats'}
            </p>
            <p className="text-xs">
              {activeTab === 'users' ? 'No other users available' : 'Start a conversation to get chatting!'}
            </p>
          </div>
        ) : (
          rooms.map((item) => {
            // Check if this is a user object (for users tab) or room object
            const isUser = !item.t && item.username;
            const isActive = !isUser && currentRoom?._id === item._id;
            const isDirect = !isUser && item.t === 'd';
            
            let displayName, avatarContent, bgColor;
            
            if (isUser) {
              // User item
              displayName = item.name || item.username;
              avatarContent = displayName.charAt(0).toUpperCase();
              bgColor = 'bg-gradient-to-br from-purple-400 to-pink-400';
            } else {
              // Room item
              displayName = isDirect 
                ? (item.usernames?.find(name => name !== currentUserId) || item.fname || item.name || user?.name || 'Unknown User')
                : (item.name || item.fname || 'Unnamed Room');
              
              if (isDirect) {
                avatarContent = displayName.charAt(0).toUpperCase();
                bgColor = 'bg-gradient-to-br from-purple-400 to-pink-400';
              } else if (item.t === 'p') {
                avatarContent = '🔒';
                bgColor = 'bg-orange-500';
              } else {
                avatarContent = '#';
                bgColor = 'bg-[#667eea]';
              }
            }

            // Safe message preview with fallback
            const getMessagePreview = () => {
              if (isUser) {
                return `@${item.username}`;
              }
              
              // Check if lastMessage exists and has msg property
              if (item.lastMessage?.msg) {
                return item.lastMessage.msg;
              }
              
              // Check if topic exists
              if (item.topic) {
                return item.topic;
              }
              
              // Default fallback
              return 'No messages yet';
            };

            return (
              <div
                key={item._id}
                onClick={() => isUser ? onUserSelect(item) : onRoomSelect(item)}
                className={`
                  flex items-center px-5 py-3 cursor-pointer border-l-3
                  ${isActive ? 'bg-blue-100 border-l-[#667eea]' : 'border-l-transparent'}
                  hover:bg-gray-100 transition-colors
                `}
              >
                {/* Avatar/Icon */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0 text-white
                  ${bgColor}
                `}>
                  {avatarContent}
                </div>

                {/* Info */}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-[#333] text-sm truncate">
                      {displayName}
                    </span>
                    {(isUser || isDirect) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Online"></span>
                    )}
                  </div>
                  <div className="text-[#666] text-xs truncate">
                    {getMessagePreview()}
                  </div>
                </div>

                {/* Unread badge (only for rooms) */}
                {!isUser && item.unread > 0 && (
                  <div className="bg-red-600 text-white rounded-full px-2 py-0.5 text-[11px] font-semibold min-w-[20px] text-center ml-2">
                    {item.unread > 99 ? '99+' : item.unread}
                  </div>
                )}

                {/* Message icon for users */}
                {isUser && (
                  <svg className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
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