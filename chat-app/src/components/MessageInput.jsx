import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage } from '../services/rocketchat';

const MessageInput = ({ roomId, onNewMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { authToken, userId } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const result = await sendMessage(roomId, message.trim(), authToken, userId);
      if (result.success) {
        onNewMessage(result.message);
        setMessage('');
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.log("err",err);
      
      setError('An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white border-t border-[#e1e5e9]">
      {error && (
        <div className="bg-red-100 text-red-700 p-2.5 rounded-md mb-3 border border-red-200 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-end bg-gray-100 border-2 border-[#e1e5e9] rounded-full px-3 py-2 focus-within:border-[#667eea] transition-colors">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 border-none bg-transparent resize-none outline-none text-[14px] leading-6 max-h-30 min-h-[20px] p-1 md:p-2 placeholder-gray-400 font-inherit"
            rows="1"
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className={`
              ml-2 flex-shrink-0 w-9 h-9 md:w-9 md:h-9 rounded-full bg-[#667eea] text-white flex items-center justify-center
              transition-transform duration-200 ease-in-out
              ${sending ? '' : 'hover:bg-[#5a6fd8] hover:scale-105'}
              ${!message.trim() || sending ? 'bg-gray-300 cursor-not-allowed scale-100 hover:scale-100' : ''}
            `}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
