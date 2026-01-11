import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Plus } from 'lucide-react';
import { Language } from '../types';

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled: boolean;
  language: Language;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, language }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = language === 'en' ? "Record your dream..." : "记录你的梦境...";

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="bg-[#F2F2F7] border-t border-[#C6C6C8] px-3 py-2 pb-6 md:pb-3 w-full backdrop-blur-xl bg-opacity-90 sticky bottom-0 z-30">
      <div className="flex items-end space-x-3 max-w-4xl mx-auto">
        {/* Plus Button (WeChat Style for attachments) */}
        <button className="mb-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
          <Plus size={24} />
        </button>

        {/* Text Input */}
        <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full bg-transparent resize-none outline-none text-base max-h-32 py-1"
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Right Actions */}
        {text.length > 0 ? (
          <button 
            onClick={handleSend}
            disabled={disabled}
            className="mb-2 p-2 bg-blue-500 rounded-full text-white shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        ) : (
          <button className="mb-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
            <Mic size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InputArea;