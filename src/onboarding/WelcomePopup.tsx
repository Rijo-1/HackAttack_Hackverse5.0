import React from 'react';
import { Brain } from 'lucide-react';

interface WelcomePopupProps {
  onClose: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-purple-400 w-8 h-8" />
          <h2 className="text-2xl font-bold text-white">Welcome to ज्ञानDCX</h2>
        </div>
        <p className="text-gray-300 mb-2">
          Your gateway to mastering crypto futures trading through AI-powered learning and real-time market insights.
        </p>
        <p className="text-gray-300 mb-6">
          Let's begin by understanding your trading experience and customizing your learning journey.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};