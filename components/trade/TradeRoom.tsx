import React, { useEffect, useState } from 'react';
import { Users, Loader2, SignalHigh, SignalLow, Copy } from 'lucide-react';
import { MatchSocket, RoomUser } from '../../utils/match/socket';

interface TradeRoomProps {
  socket: MatchSocket;
  playerId: string;
  playerName: string;
  roomId: string;
  onExit: () => void;
}

export const TradeRoom: React.FC<TradeRoomProps> = ({
  socket,
  playerId,
  playerName,
  roomId,
  onExit
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(undefined);
      socket.joinRoom(roomId, playerId, playerName);
    };

    const handleRoomUpdate = (update: { users: RoomUser[] }) => {
      console.log('Room update:', update);
      setRoomUsers(update.users);
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

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold">Trading Room</h2>
              <div className="flex items-center gap-2">
                <p className="text-gray-400">Room ID: {roomId}</p>
                <button
                  onClick={copyRoomId}
                  className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                  title="Copy Room ID"
                >
                  <Copy size={14} className={copied ? "text-green-500" : "text-gray-400"} />
                </button>
              </div>
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

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Room Members ({roomUsers.length})</h3>
            <div className="space-y-2">
              {roomUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{user.name}</span>
                  {user.id === playerId && <span className="text-purple-400">(You)</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onExit}
            className="px-6 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-900/20 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}; 