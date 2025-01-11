import React, { useState } from 'react';
import { Users, Copy, X } from 'lucide-react';

interface RoomCreationModalProps {
  onClose: () => void;
  onCreateRoom: (data: { roomName: string; creatorName: string }) => void;
}

export const RoomCreationModal: React.FC<RoomCreationModalProps> = ({
  onClose,
  onCreateRoom,
}) => {
  const [roomName, setRoomName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    if (!creatorName.trim()) {
      setError('Please enter your name');
      return;
    }

    onCreateRoom({ roomName, creatorName });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-purple-400" />
            <h2 className="text-2xl font-bold">Create Trading Room</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Room Name
            </label>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter room name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Your Name
            </label>
            <input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter your name"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-900/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 