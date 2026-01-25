import React from 'react';
import { Sender, Message, MessageType } from '../types';
import { Eye } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onViewCard?: (imageUrl: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onViewCard }) => {
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

  if (message.type === MessageType.CARD_GENERATING) {
    return (
      <div className="flex w-full mb-4 pl-4">
        <div className="bg-[#1E293B]/90 border border-white/10 p-5 rounded-2xl rounded-tl-none shadow-lg max-w-[85%] md:max-w-[320px]">
          <div className="text-slate-300 mb-3 text-sm font-medium">{message.text}</div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 h-full rounded-full w-[40%] animate-[shimmer_2s_infinite]"></div>
            {/* Note: if 'shimmer' isn't defined, we use a simpler animation style inline or standard classes */}
            <style>{`
                @keyframes progress-loading {
                  0% { width: 10%; transform: translateX(-10%); }
                  50% { width: 60%; transform: translateX(50%); }
                  100% { width: 10%; transform: translateX(200%); }
                }
              `}</style>
            <div
              className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full"
              style={{ animation: 'progress-loading 2s infinite linear' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === MessageType.CARD_READY) {
    return (
      <div className="flex w-full mb-4 pl-4">
        <div className="bg-[#131926] border border-white/10 p-5 rounded-2xl rounded-tl-none shadow-lg max-w-[85%] md:max-w-[320px]">
          <div className="text-slate-200 mb-4 text-sm leading-relaxed">{message.text}</div>
          <button
            onClick={() => onViewCard?.(message.imageUrl || '')}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">View Dream Card</span>
          </button>
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