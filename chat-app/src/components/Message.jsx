import React from 'react';

const Message = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };






  return (
    <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] p-3 rounded-[18px] break-words relative
          ${isOwn 
            ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-br-sm'
            : 'bg-white text-[#333] border border-[#e1e5e9] rounded-bl-sm shadow-sm'
          }
        `}
      >
        <div className="flex justify-between items-center mb-1">
          <span className={`font-semibold text-[13px] mr-2 ${isOwn ? 'text-white/90' : 'text-[#667eea]'}`}>
            {message.u?.name || message.u?.username || 'Unknown User'}
          </span>
          <span className="text-[11px] opacity-70">{formatTime(message.ts)}</span>
        </div>

        <div className="text-[14px] leading-[1.4] whitespace-pre-wrap">
          {message.msg}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2">
            {message.attachments.map((attachment, index) => (
              <div
                key={index}
                className={`
                  mt-2 p-2 rounded-md border
                  ${isOwn ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}
                `}
              >
                {attachment.image_url && (
                  <img
                    src={attachment.image_url}
                    alt="Attachment"
                    className="max-w-full rounded-sm mb-1"
                  />
                )}
                {attachment.title && (
                  <div className="font-semibold text-[13px] mb-0.5">
                    {attachment.title}
                  </div>
                )}
                {attachment.description && (
                  <div className="text-[12px] opacity-80">
                    {attachment.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
