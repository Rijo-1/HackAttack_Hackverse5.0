import React, { useEffect, useState } from 'react';
import { Users, Loader2, SignalHigh, SignalLow } from 'lucide-react';
import { MatchSocket } from '../../utils/match/socket';

interface MatchRoomProps {
  socket: MatchSocket;
  playerId: string;
  playerName: string;
  roomId: string;
  onExit: () => void;
}

export const MatchRoom: React.FC<MatchRoomProps> = ({
  socket,
  playerId,
  playerName,
  roomId,
  onExit
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [activeTradeCount, setActiveTradeCount] = useState(0);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(undefined);
      socket.joinRoom(roomId, playerId, playerName);
    };

    const handleRoomUpdate = (update: { users: RoomUser[], activeTradeCount: number }) => {
      console.log('Room update:', update);
      setRoomUsers(update.users);
      setActiveTradeCount(update.activeTradeCount);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('error', (err: { message: string }) => setError(err.message));
    socket.on('roomUpdate', handleRoomUpdate);

    socket.connect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
      socket.off('roomUpdate');
      socket.disconnect();
    };
  }, [socket, roomId, playerId, playerName]);

  const handleReady = () => {
    socket.setReady(true);
  };

  const currentPlayer = roomUsers.find(p => p.id === playerId);
  const opponent = roomUsers.find(p => p.id !== playerId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold">Match Room</h2>
              <p className="text-gray-400">Room ID: {roomId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <SignalHigh className="text-green-500" />
            ) : (
              <SignalLow className="text-red-500" />
            )}
            <span className={isConnected ? "text-green-500" : "text-red-500"}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Current Player */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">You</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{currentPlayer?.name || 'Loading...'}</span>
            </div>
            {currentPlayer?.isReady && (
              <span className="text-green-500 text-sm mt-2 block">Ready</span>
            )}
          </div>

          {/* Opponent */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Opponent</h3>
            {opponent ? (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  opponent.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{opponent.name}</span>
                {opponent.isReady && (
                  <span className="text-green-500">(Ready)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="animate-spin" size={16} />
                Waiting for opponent...
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onExit}
            className="px-6 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-900/20 transition-colors"
          >
            Leave Match
          </button>
          <button
            onClick={handleReady}
            disabled={currentPlayer?.isReady}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPlayer?.isReady ? 'Ready' : 'Mark as Ready'}
          </button>
        </div>
      </div>
    </div>
  );
};