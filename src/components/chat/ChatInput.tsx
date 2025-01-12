import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [value]);

  // Add global event listener for Enter key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not in another input/textarea
      if (
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA' &&
        e.key === 'Enter' && 
        !e.shiftKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow Shift+Enter for new line
        return;
      } else {
        e.preventDefault();
        if (value.trim() && !isLoading && !disabled) {
          onSubmit(e);
        }
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto p-4">
      <div className="flex gap-2 items-end bg-purple-900/10 rounded-2xl p-2 focus-within:ring-2 ring-purple-500/50 transition-all backdrop-blur-sm">
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white rounded-lg px-2 py-1 focus:outline-none resize-none max-h-32 scrollbar-custom placeholder:text-purple-500/50 disabled:opacity-50"
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          disabled={isLoading || disabled || !value.trim()}
          className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Send className="w-5 h-5 text-purple-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        </button>
      </div>
    </form>
  );
};
