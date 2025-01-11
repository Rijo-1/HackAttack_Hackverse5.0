import React, { useState, useEffect } from 'react';
import { Timer, TrendingUp, Trophy, AlertTriangle, Activity } from 'lucide-react';
import type { Team, GamePlayer, TeamScore } from '../../types/trading';
import { GameLeaderboard } from './GameLeaderboard';
import { TradingInterface } from './TradingInterface';
import { MarketData } from './MarketData';
import { ExitSummary } from './ExitSummary';
import useSWR from 'swr';
import { useTeam } from '../../contexts/TeamContext';
import { supabase } from '../../utils/supabaseClient';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TradingGameProps {
  team: Team;
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const TradingGame: React.FC<TradingGameProps> = ({ team, onClose }) => {
  console.log('TradingGame mounted with team:', team);

  if (!team.members || team.members.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4">Error</h3>
          <p className="text-gray-400 mb-4">No team members found. Please try again.</p>
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showExitSummary, setShowExitSummary] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    // Initialize with the first member's name, fallback to email if name is not available
    const firstMember = team.members[0];
    return firstMember?.name || firstMember?.email?.split('@')[0] || '';
  });

  const [players, setPlayers] = useState<GamePlayer[]>(() => 
    team.members.map(member => ({
      ...member,
      balance: 1000,
      pnl: 0,
      positions: [],
      trades: [],
    }))
  );

  const { data: priceData } = useSWR(
    gameStarted && !gameEnded ? 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' : null,
    fetcher,
    { refreshInterval: 1000 }
  );

  const { socket } = useTeam();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameEnded && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameEnded(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, timeLeft]);

  useEffect(() => {
    if (socket) {
      // Listen for team updates
      socket.on('teamUpdate', (update) => {
        setPlayers(update.members);
      });

      // Listen for trade updates
      socket.on('tradeUpdate', (update) => {
        setPlayers(prev => prev.map(player => 
          player.email === update.email
            ? {
                ...player,
                positions: update.positions,
                balance: update.balance
              }
            : player
        ));
      });

      // Listen for trade close updates
      socket.on('tradeClose', (update) => {
        setPlayers(prev => prev.map(player => 
          player.email === update.email
            ? {
                ...player,
                positions: update.positions,
                trades: update.trades,
                balance: update.balance,
                pnl: update.pnl
              }
            : player
        ));
      });

      // Listen for game state sync
      socket.on('gameStateSync', ({ gameState }) => {
        setGameStarted(gameState.started);
        setGameEnded(gameState.ended);
        setTimeLeft(gameState.timeLeft);
      });

      return () => {
        socket.off('teamUpdate');
        socket.off('tradeUpdate');
        socket.off('tradeClose');
        socket.off('gameStateSync');
      };
    }
  }, [socket]);

  const handleExit = () => {
    if (gameStarted && !gameEnded) {
      if (window.confirm('Are you sure you want to end the game early?')) {
        setGameEnded(true);
        setShowExitSummary(true);
      }
    } else {
      onClose();
    }
  };

  const calculatePositionPnL = (position: Position, currentPrice: number): number => {
    const priceDiff = position.type === 'long'
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    const leveragedPnL = (priceDiff / position.entryPrice) * position.amount * position.leverage;
    return Number.isFinite(leveragedPnL) ? leveragedPnL : 0;
  };

  const handleTrade = (playerName: string, tradeData: any) => {
    if (socket) {
      const player = players.find(p => p.name === playerName);
      if (!player) return;

      socket.emit('placeTrade', {
        teamCode: team.teamCode,
        email: player.email,
        trade: tradeData
      });

      // Add database storage
      try {
        const saveTradeDetails = async () => {
          const { data, error } = await supabase
            .from('game_details')
            .insert([{
              player_email: player.email,
              final_balance: player.balance - tradeData.margin,
              total_pnl: player.pnl,
              trade_details: JSON.stringify(tradeData),
              created_at: new Date().toISOString()
            }]);

          if (error) {
            console.error('Error saving trade details:', error);
          } else {
            console.log('Trade details saved:', data);
          }
        };

        saveTradeDetails();
      } catch (error) {
        console.error('Unexpected error saving trade details:', error);
      }
    }
  };

  const handleClosePosition = (playerName: string, positionIndex: number) => {
    if (socket && priceData?.price) {
      socket.emit('closeTrade', {
        teamCode: team.teamCode,
        email: players.find(p => p.name === playerName)?.email,
        tradeIndex: positionIndex,
        closePrice: parseFloat(priceData.price)
      });
    }
  };

  const teamScore = {
    teamName: team.teamName,
    totalPnl: players.reduce((sum, player) => sum + player.pnl, 0),
    score: Math.floor(players.reduce((sum, player) => sum + player.pnl, 0) * 100),
  };

  // Handle cleanup when closing game
  const handleClose = () => {
    if (socket) {
      socket.emit('exitGame', { teamCode: team.teamCode });
    }
    onClose();
  };

  if (showExitSummary) {
    return (
      <ExitSummary
        team={team}
        teamScore={teamScore}
        players={players}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
              <div className="flex-shrink-0">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  War Room: Trading Tournament
                </h2>
                <p className="text-gray-400">Test your trading skills in real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-purple-900/10 border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-purple-900/30 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Timer className={`${timeLeft <= 300 ? 'text-red-400' : 'text-purple-400'}`} />
                  <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
                </div>
                {priceData?.price && (
                  <div className="bg-purple-900/30 px-4 py-2 rounded-lg flex items-center gap-2">
                    <TrendingUp className="text-purple-400" />
                    <span className="font-mono text-xl">
                      ${parseFloat(priceData.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleExit}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg transition-colors"
              >
                {gameStarted && !gameEnded ? 'End Game' : 'Exit Room'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          {!gameStarted ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Start?</h3>
              <button
                onClick={() => setGameStarted(true)}
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Begin Trading Tournament
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-3">
                <MarketData />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <TradingInterface
                  player={players.find(p => p.name === currentPlayer)!}
                  onTrade={handleTrade}
                  onClosePosition={handleClosePosition}
                  gameEnded={gameEnded}
                  currentPrice={priceData?.price ? parseFloat(priceData.price) : undefined}
                />
              </div>
              <div className="col-span-12 lg:col-span-3">
                <GameLeaderboard
                  teamScore={teamScore}
                  players={players}
                  currentPlayer={currentPlayer}
                  onPlayerChange={setCurrentPlayer}
                  gameEnded={gameEnded}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};