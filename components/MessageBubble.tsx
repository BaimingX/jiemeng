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
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1 w-20 h-12">
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (message.type === MessageType.IMAGE && message.imageUrl) {
    return (
      <div className={`flex w-full mb-4 ${isUser ? 'justify-end pr-4' : 'justify-start pl-4'}`}>
        <div className="max-w-[80%] md:max-w-[65%]">
          <div className="bg-[#131926] border border-white/10 rounded-2xl rounded-tl-none shadow-md overflow-hidden">
            <img
              src={message.imageUrl}
              alt="Dream Card"
              className="w-full h-auto rounded-t-2xl"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            {message.text && (
              <div className="px-4 py-3 text-[14px] text-slate-300 bg-white/5">
                {message.text.split(/\*\*(.*?)\*\*/g).map((part, index) =>
                  index % 2 === 1 ? (
                    <strong key={index} className="font-bold text-indigo-300">{part}</strong>
                  ) : (
                    <span key={index}>{part}</span>
                  )
                )}
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
            px-5 py-3.5 text-[15px] leading-relaxed shadow-sm relative break-words whitespace-pre-wrap border
            ${isUser
              ? 'bg-indigo-600 border-indigo-500 text-white rounded-2xl rounded-tr-none shadow-indigo-900/20'
              : 'bg-[#1E293B]/80 border-white/10 text-slate-200 rounded-2xl rounded-tl-none backdrop-blur-sm'
            }
          `}
        >
          {message.text.split(/\*\*(.*?)\*\*/g).map((part, index) =>
            index % 2 === 1 ? (
              <strong key={index} className="font-bold text-indigo-300">{part}</strong>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;