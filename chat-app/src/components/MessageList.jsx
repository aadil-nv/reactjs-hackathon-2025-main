import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ messages, currentUserId }) => {
  console.log("Message list is calling ===>",messages,currentUserId);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2.5">
        <div className="flex justify-center items-center h-full text-[#666] text-base text-center">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#c1c1c1 #f1f1f1',
      }}
    >
      {messages.map((message, index) => (
        <Message
          key={message._id || index}
          message={message}
          isOwn={message.u?._id === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
