import React from 'react';

const RoomList = ({ rooms, currentRoom, onRoomSelect }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-[#e1e5e9] bg-gray-100">
        <h3 className="m-0 text-[#333] text-base font-semibold">Channels</h3>
        <span className="bg-[#667eea] text-white px-2 py-1 rounded-full text-[12px] font-semibold">
          {rooms.length}
        </span>
      </div>

      {/* Room list */}
      <div
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1',
        }}
      >
        {rooms.length === 0 ? (
          <div className="flex justify-center items-center h-52 text-[#666] text-sm">
            <p>No rooms available</p>
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = currentRoom?._id === room._id;
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
                <div className="w-8 h-8 rounded-md bg-[#667eea] text-white flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0">
                  {room.t === 'c' ? '#' : room.t === 'd' ? '@' : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#333] text-sm mb-0.5 truncate">
                    {room.name || room.fname || 'Unnamed Room'}
                  </div>
                  <div className="text-[#666] text-xs truncate">
                    {room.topic || room.lastMessage?.msg || 'No recent messages'}
                  </div>
                </div>
                {room.unread > 0 && (
                  <div className="bg-red-600 text-white rounded-full px-1.5 py-0.5 text-[11px] font-semibold min-w-[18px] text-center ml-2">
                    {room.unread}
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

export default RoomList;
