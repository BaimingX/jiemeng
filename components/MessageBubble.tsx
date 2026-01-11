import React from 'react';
import { Sender, Message, MessageType } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  if (message.type === MessageType.LOADING) {
    return (
      <div className="flex w-full mb-4 pl-4">
        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1 w-20 h-12">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (message.type === MessageType.IMAGE && message.imageUrl) {
    return (
      <div className={`flex w-full mb-4 ${isUser ? 'justify-end pr-4' : 'justify-start pl-4'}`}>
        <div className="max-w-[80%] md:max-w-[65%]">
          <div className="bg-white rounded-2xl rounded-tl-none shadow-md overflow-hidden">
            <img
              src={message.imageUrl}
              alt="Dream Card"
              className="w-full h-auto rounded-t-2xl"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            {message.text && (
              <div className="px-4 py-3 text-[14px] text-gray-600 bg-gradient-to-b from-white to-gray-50">
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end pr-4' : 'justify-start pl-4'}`}>
      <div className={`max-w-[90%] md:max-w-[85%]`}>
        <div
          className={`
            px-4 py-3 text-[15px] leading-relaxed shadow-sm relative break-words whitespace-pre-wrap
            ${isUser
              ? 'bg-[#95EC69] text-black rounded-2xl rounded-tr-none' // WeChat Greenish style or iOS Blue
              : 'bg-white text-black rounded-2xl rounded-tl-none'
            }
          `}
          style={{
            // WeChat Green override: #95EC69 is the classic WeChat green, but let's stick to iOS Blue for better "iOS Style" request unless explicitly WeChat visual.
            // The prompt says "iOS style interface. WeChat chat way". I will use iOS colors (Blue/Gray) but WeChat layout structure.
            backgroundColor: isUser ? '#007AFF' : '#FFFFFF',
            color: isUser ? '#FFFFFF' : '#000000',
          }}
        >
          {message.text}
        </div>
        {/* Timestamp or Status placeholder could go here */}
      </div>
    </div>
  );
};

export default MessageBubble;