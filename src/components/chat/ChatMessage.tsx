import React from 'react';
import { Brain, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../utils/ai/chat';

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="flex animate-message-slide-up">
      <div
        className={`max-w-[85%] group transition-all duration-300 ${
          message.role === 'user'
            ? 'ml-auto bg-purple-500/10 hover:bg-purple-500/20'
            : 'bg-zinc-900/90 hover:bg-zinc-800/90'
        } rounded-2xl p-4 shadow-lg backdrop-blur-sm`}
      >
        <div className="flex items-center gap-2 mb-2 text-sm text-zinc-400">
          {message.role === 'user' ? (
            <MessageSquare size={16} />
          ) : (
            <Brain size={16} className="text-purple-400" />
          )}
          <span>{message.role === 'user' ? 'You' : 'ज्ञान-AI'}</span>
        </div>
        <ReactMarkdown 
          className="prose prose-invert max-w-none prose-headings:mb-4 prose-headings:mt-6 prose-p:mb-4 prose-p:leading-relaxed prose-pre:bg-zinc-800 prose-hr:my-4 prose-hr:border-purple-500/20 prose-ul:my-4 prose-ul:list-none prose-ul:pl-0 prose-li:my-2"
          components={{
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-purple-400 mt-6 mb-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-purple-300 mt-4 mb-3">{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 my-4">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>{children}</span>
              </li>
            ),
            hr: () => (
              <hr className="border-t border-purple-500/20 my-4" />
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="text-purple-300 font-semibold">{children}</strong>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};