import React from 'react';
import { Trophy, Crown, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface Player {
  name: string;
  balance: number;
  pnl: number;
  trades: any[];
  email: string;
}

interface TeamScore {
  teamName: string;
  totalPnl: number;
  score: number;
}

interface GameLeaderboardProps {
  teamScore: TeamScore;
  players: Player[];
  currentPlayer: string;
  onPlayerChange: (playerName: string) => void;
  gameEnded: boolean;
}

export const GameLeaderboard: React.FC<GameLeaderboardProps> = ({
  teamScore,
  players,
  currentPlayer,
  onPlayerChange,
  gameEnded,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="space-y-4">
      {/* Team Score Card */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-purple-400" />
            <h3 className="font-semibold text-white">{teamScore.teamName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            <span className="text-xl font-bold">{teamScore.score}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Team PnL</span>
          <span className={`font-semibold ${teamScore.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
            ${teamScore.totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Player Rankings */}
      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Crown className="text-yellow-500" />
            Player Rankings
          </h3>
          {gameEnded && (
            <span className="text-sm text-purple-400">Game Over!</span>
          )}
        </div>

        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <button
              key={player.email}
              onClick={() => !gameEnded && onPlayerChange(player.name)}
              disabled={gameEnded}
              className={`w-full p-3 rounded-lg transition-all ${
                player.name === currentPlayer
                  ? 'bg-purple-600/30 border border-purple-500'
                  : 'bg-black/20 border border-purple-500/20 hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="text-yellow-500" size={16} />}
                  <span className="font-semibold text-white">{player.name}</span>
                </div>
                <span className={`text-sm ${player.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  ${player.pnl.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-white">${player.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Trades:</span>
                  <span className="text-white">{player.trades.length}</span>
                </div>
              </div>

              {player.trades.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <span>Last trade:</span>
                  {player.trades[player.trades.length - 1].type === 'long' ? (
                    <TrendingUp className="text-green-500" size={12} />
                  ) : (
                    <TrendingDown className="text-red-500" size={12} />
                  )}
                  <span>
                    {player.trades[player.trades.length - 1].amount.toFixed(2)} USDT
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};