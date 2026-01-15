
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  // Filter out internal tags from display
  const displayContent = message.content
    .replace(/\[VISUAL_PROMPT\]:?[\s\S]*/gi, '')
    .replace(/\[SCENE_SUMMARY\]:?/gi, '')
    .trim();

  if (!displayContent && (!message.images || message.images.length === 0)) return null;

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} w-full mb-4`}>
      <div className={`max-w-[85%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div 
          className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isAssistant 
              ? 'bg-white text-stone-800 border border-stone-100 rounded-tl-none' 
              : 'bg-rose-500 text-white rounded-tr-none'
            }`}
        >
          {displayContent}
        </div>
        
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt="Upload" 
                className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-md hover:scale-105 transition-transform"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
