import React from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import type { GamePlayer } from '../../types/trading';

interface GameLeaderboardProps {
  players: GamePlayer[];
  currentPlayer: string;
}

export const GameLeaderboard: React.FC<GameLeaderboardProps> = ({ players, currentPlayer }) => {
  // Sort players by PnL in descending order
  const sortedPlayers = [...players].sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Trophy className="text-yellow-500" size={18} />
        Leaderboard
      </h3>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const isCurrentPlayer = player.name === currentPlayer;
          
          return (
            <div
              key={player.email}
              className={`bg-black/20 p-3 rounded-lg ${
                isCurrentPlayer ? 'border border-purple-500/40' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                      index === 1 ? 'bg-gray-400/20 text-gray-400' :
                      index === 2 ? 'bg-amber-600/20 text-amber-600' :
                      'bg-purple-500/20 text-purple-500'}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {player.name}
                      {isCurrentPlayer && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Balance: ${player.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${
                    player.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {player.pnl >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    ${Math.abs(player.pnl).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {player.positions.length} Position{player.positions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};