import React, { useState } from 'react';
import { Users } from 'lucide-react';

interface JoinRoomFormProps {
  onJoin: (data: { roomId: string; userName: string }) => void;
  error?: string;
}

export const JoinRoomForm: React.FC<JoinRoomFormProps> = ({
  onJoin,
  error
}) => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      setFormError('Please enter a room ID');
      return;
    }
    if (!userName.trim()) {
      setFormError('Please enter your name');
      return;
    }

    onJoin({ roomId: roomId.trim(), userName: userName.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Room ID
        </label>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID"
          className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Your Name
        </label>
        <input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      {(error || formError) && (
        <p className="text-red-400 text-sm">{error || formError}</p>
      )}

      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Users size={20} />
        Join Room
      </button>
    </form>
  );
}; 