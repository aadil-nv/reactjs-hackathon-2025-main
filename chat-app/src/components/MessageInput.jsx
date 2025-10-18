import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
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
      console.log("message ------>",message);
      
      const result = await sendMessage(roomId, message.trim(), authToken, userId);

      console.log("result is 000000000000",result);
      

      if (result.success) {
        const sentMessage = result.message || {
          _id: Date.now().toString(),
          msg: message.message.msg,
          u: { _id: userId, username: 'You' },
          ts: new Date(),
        };

        onNewMessage(sentMessage.message || sentMessage);
        setMessage('');
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError('Error sending message');
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
    <div className="p-4 md:p-6 bg-white border-t border-gray-200">
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 resize-none border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
          rows="1"
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className={`px-4 py-2 rounded-full text-white ${
            sending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
