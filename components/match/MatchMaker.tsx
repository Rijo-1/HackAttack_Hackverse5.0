import React, { useState } from 'react';
import { createMatchSocket } from '../../utils/match/socket';
import { RoomCreationModal } from '../room/RoomCreationModal';
import { JoinRoomForm } from '../room/JoinRoomForm';
import { TradeRoom } from '../trade/TradeRoom';

interface MatchMakerProps {
  onClose: () => void;
}

export const MatchMaker: React.FC<MatchMakerProps> = ({ onClose }) => {
  const [playerId] = useState(() => crypto.randomUUID());
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string>();
  const [socket, setSocket] = useState<ReturnType<typeof createMatchSocket>>();

  const handleCreateRoom = async ({ roomName, creatorName }: { roomName: string; creatorName: string }) => {
    try {
      const newRoomId = crypto.randomUUID().slice(0, 8).toUpperCase();
      
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: newRoomId,
          creatorId: playerId,
          creatorName,
          roomName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      setPlayerName(creatorName);
      setRoomId(newRoomId);
      const newSocket = createMatchSocket('http://localhost:3001');
      setSocket(newSocket);
      setIsJoining(true);
      setIsCreating(false);
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
    }
  };

  const handleJoinRoom = async ({ roomId, userName }: { roomId: string; userName: string }) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomId}`);
      const data = await response.json();

      if (!data.exists) {
        setError('Room not found');
        return;
      }

      setPlayerName(userName);
      setRoomId(roomId);
      const newSocket = createMatchSocket('http://localhost:3001');
      setSocket(newSocket);
      setIsJoining(true);
    } catch (err) {
      setError('Failed to join room');
      console.error(err);
    }
  };

  const handleExit = () => {
    socket?.disconnect();
    setSocket(undefined);
    setIsJoining(false);
    onClose();
  };

  if (isCreating) {
    return (
      <RoomCreationModal
        onClose={() => setIsCreating(false)}
        onCreateRoom={handleCreateRoom}
      />
    );
  }

  if (isJoining && socket) {
    return (
      <TradeRoom
        socket={socket}
        playerId={playerId}
        playerName={playerName}
        roomId={roomId}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-md w-full">
        <div className="space-y-6">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
          >
            Create New Room
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">or join existing</span>
            </div>
          </div>

          <JoinRoomForm onJoin={handleJoinRoom} error={error} />
        </div>
      </div>
    </div>
  );
};