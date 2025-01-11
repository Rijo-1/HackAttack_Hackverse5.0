import React from 'react';
import { Brain } from 'lucide-react';

interface LearnCTAProps {
  onClick: () => void;
}

export const LearnCTA: React.FC<LearnCTAProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-8 right-8 z-40 animate-bounce">
      <div className="relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-pulse"
            >
              <path
                d="M12 4L12 20M12 20L18 14M12 20L6 14"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <button
          onClick={onClick}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
        >
          <Brain className="w-5 h-5" />
          Start Learning with AI
        </button>
      </div>
    </div>
  );
};