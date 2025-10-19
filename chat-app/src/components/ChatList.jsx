import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';

const ChatList = ({ 
  rooms, 
  currentRoom, 
  onRoomSelect,
  onUserSelect,
  activeTab, 
  onTabChange,
  channelCount,
  teamCount,
  directCount,
  userCount,
  currentUserId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'unread'
  const [showFilters, setShowFilters] = useState(false);
  
  const totalCount = channelCount + teamCount + directCount;
  const isUsersTab = activeTab === 'users';
  const user = useSelector((state) => state.auth.user);

  const filteredAndSortedRooms = useMemo(() => {
    let filtered = [...rooms];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const isUser = !item.t && item.username;
        
        if (isUser) {
          const userName = (item.name || item.username || '').toLowerCase();
          const username = (item.username || '').toLowerCase();
          return userName.includes(query) || username.includes(query);
        } else {
          const isDirect = item.t === 'd';
          const displayName = isDirect 
            ? (item.usernames?.find(name => name !== user.name) || '').toLowerCase()
            : (item.name || item.fname || '').toLowerCase();
          
          const message = (item.lastMessage?.msg || '').toLowerCase();
          const topic = (item.topic || '').toLowerCase();
          
          return displayName.includes(query) || message.includes(query) || topic.includes(query);
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const isUserA = !a.t && a.username;
        const isUserB = !b.t && b.username;
        
        const nameA = isUserA 
          ? (a.name || a.username || '').toLowerCase()
          : (a.name || a.fname || '').toLowerCase();
        const nameB = isUserB 
          ? (b.name || b.username || '').toLowerCase()
          : (b.name || b.fname || '').toLowerCase();
        
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'unread') {
        return (b.unread || 0) - (a.unread || 0);
      } else {
        // Sort by recent (default)
        const dateA = a.lastMessage?.ts?.$date || a._updatedAt?.$date || 0;
        const dateB = b.lastMessage?.ts?.$date || b._updatedAt?.$date || 0;
        return dateB - dateA;
      }
    });

    return filtered;
  }, [rooms, searchQuery, sortBy, user]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="m-0 text-gray-800 text-base font-semibold">
            {isUsersTab ? 'Users' : 'Chats'}
          </h3>
          <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {isUsersTab ? userCount : filteredAndSortedRooms.length}
          </span>
        </div>

        <div className="mb-3 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${isUsersTab ? 'users' : 'chats'}...`}
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Sort
          </button>

          {showFilters && (
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  sortBy === 'recent' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  sortBy === 'name' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Name
              </button>
              {!isUsersTab && (
                <button
                  onClick={() => setSortBy('unread')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    sortBy === 'unread' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Unread
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation - Updated with Teams */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => onTabChange('all')}
            className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => onTabChange('channels')}
            className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'channels'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Channels ({channelCount})
          </button>
          <button
            onClick={() => onTabChange('teams')}
            className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'teams'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Teams ({teamCount})
          </button>
          <button
            onClick={() => onTabChange('direct')}
            className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'direct'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Direct ({directCount})
          </button>
          <button
            onClick={() => onTabChange('users')}
            className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Users ({userCount})
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="px-5 py-2 bg-indigo-50 border-b border-indigo-100">
          <p className="text-xs text-indigo-700">
            Found {filteredAndSortedRooms.length} result{filteredAndSortedRooms.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        </div>
      )}

      {/* List */}
      <div
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1',
        }}
      >
        {filteredAndSortedRooms.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-52 text-gray-500 text-sm text-center px-4">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {searchQuery ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              )}
            </svg>
            <p className="font-medium mb-1">
              {searchQuery 
                ? 'No results found' 
                : activeTab === 'channels' 
                  ? 'No channels' 
                  : activeTab === 'teams'
                    ? 'No teams'
                    : activeTab === 'direct' 
                      ? 'No direct messages' 
                      : activeTab === 'users' 
                        ? 'No users found' 
                        : 'No chats'}
            </p>
            <p className="text-xs text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : activeTab === 'users' 
                  ? 'No other users available' 
                  : activeTab === 'teams'
                    ? 'Create a team to get started!'
                    : 'Start a conversation to get chatting!'}
            </p>
          </div>
        ) : (
          filteredAndSortedRooms.map((item) => {
            const isUser = !item.t && item.username;
            const isActive = !isUser && currentRoom?._id === item._id;
            const isDirect = !isUser && item.t === 'd';
            const isTeam = !isUser && item.t === 'p';
            
            let displayName, avatarContent, bgColor;
            
            if (isUser) {
              displayName = item.name || item.username;
              avatarContent = displayName.charAt(0).toUpperCase();
              bgColor = 'bg-gradient-to-br from-purple-400 to-pink-400';
            } else {
              displayName = isDirect 
                ? (item.usernames?.find(name => name !== currentUserId) || item.fname || item.name || user?.name || 'Unknown User')
                : (item.name || item.fname || 'Unnamed Room');
              
              if (isDirect) {
                avatarContent = displayName.charAt(0).toUpperCase();
                bgColor = 'bg-gradient-to-br from-purple-400 to-pink-400';
              } else if (isTeam) {
                avatarContent = '👥';
                bgColor = 'bg-gradient-to-br from-orange-400 to-red-400';
              } else {
                avatarContent = '#';
                bgColor = 'bg-indigo-600';
              }
            }

            const getMessagePreview = () => {
              if (isUser) {
                return `@${item.username}`;
              }
              
              if (item.lastMessage?.msg) {
                return item.lastMessage.msg;
              }
              
              if (item.topic) {
                return item.topic;
              }
              
              if (isTeam) {
                return 'Private team';
              }
              
              return 'No messages yet';
            };

            return (
              <div
                key={item._id}
                onClick={() => isUser ? onUserSelect(item) : onRoomSelect(item)}
                className={`
                  flex items-center px-5 py-3 cursor-pointer border-l-3 transition-all
                  ${isActive ? 'bg-indigo-50 border-l-indigo-600' : 'border-l-transparent hover:bg-gray-50'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0 text-white shadow-sm
                  ${bgColor}
                `}>
                  {avatarContent}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 text-sm truncate">
                      {displayName}
                    </span>
                    {(isUser || isDirect) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 shadow-sm" title="Online"></span>
                    )}
                    {isTeam && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Team</span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs truncate">
                    {getMessagePreview()}
                  </div>
                </div>

                {!isUser && item.unread > 0 && (
                  <div className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold min-w-[20px] text-center ml-2 shadow-sm">
                    {item.unread > 99 ? '99+' : item.unread}
                  </div>
                )}

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