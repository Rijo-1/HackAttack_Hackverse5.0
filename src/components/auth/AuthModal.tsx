import React from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-8 max-w-md w-full mx-4 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center">
              <span className="text-2xl font-bold">ज्ञा</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Continue with ज्ञानDCX
          </h2>
          <p className="text-gray-400 text-sm">
            To use ज्ञानDCX you must log into an existing account or create one.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3 group"
          >
            <LogIn
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span>Login to Your Account</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/signup');
            }}
            className="w-full bg-black/40 border-2 border-purple-500/50 hover:border-purple-500 py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3 group text-purple-400 hover:text-purple-300"
          >
            <UserPlus
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span>Create New Account</span>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to ज्ञानDCX's Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
