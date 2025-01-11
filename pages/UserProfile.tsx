import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  LineChart, 
  Leaf, 
  History, 
  Trophy,
  Medal,
  Users,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ExitSummary } from '../components/game/ExitSummary';

// Mock data for demonstration
const mockTrades = [
  {
    type: 'long',
    amount: 1000,
    price: 45000,
    timestamp: Date.now() - (2 * 60 * 1000), // 2 minutes ago
    closePrice: 46000,
    pnl: 100,
    id: 'trade1'
  },
  {
    type: 'short',
    amount: 1500,
    price: 47000,
    timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    closePrice: 46500,
    pnl: 75,
    id: 'trade2'
  },
  {
    type: 'long',
    amount: 2000,
    price: 44000,
    timestamp: Date.now() - (15 * 24 * 60 * 60 * 1000), // 15 days ago
    closePrice: 44800,
    pnl: 160,
    id: 'trade3'
  },
  {
    type: 'short',
    amount: 1200,
    price: 48000,
    timestamp: Date.now() - (45 * 24 * 60 * 60 * 1000), // 45 days ago
    closePrice: 47200,
    pnl: 96,
    id: 'trade4'
  },
  {
    type: 'long',
    amount: 1800,
    price: 43000,
    timestamp: Date.now() - (60 * 24 * 60 * 60 * 1000), // 2 months ago
    closePrice: 43900,
    pnl: 162,
    id: 'trade5'
  }
];

const mockLeaderboard = [
  { 
    name: 'Alex', 
    score: 4250, 
    rank: 1,
    tradingPoints: 2800,
    greenPoints: 1450
  },
  { 
    name: 'Sarah', 
    score: 3980, 
    rank: 2,
    tradingPoints: 2500,
    greenPoints: 1480
  },
  { 
    name: 'John', 
    score: 3750, 
    rank: 3,
    tradingPoints: 2200,
    greenPoints: 1550
  },
  { 
    name: 'Emma', 
    score: 3600, 
    rank: 4,
    tradingPoints: 2100,
    greenPoints: 1500
  },
  { 
    name: 'Mike', 
    score: 3400, 
    rank: 5,
    tradingPoints: 2000,
    greenPoints: 1400
  },
];

// Helper function to format time ago
const formatTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};

// Add these types for the tooltips
interface PointsCalculation {
  label: string;
  value: number;
  points: number;
  multiplier: number;
}

export function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<typeof mockTrades[0] | null>(null);

  // Mock data for the current user's team
  const mockTeam = {
    teamName: "Trading Champions",
    teamCode: "TC123",
    members: [{ name: user?.email || 'User', email: user?.email || '', role: 'Trader' }]
  };

  // Calculate user's points
  const userPoints = {
    tradingPoints: 2650, // Based on 127 trades and 68% win rate
    greenPoints: 1520,   // Based on 85 carbon-neutral trades and 320 credits
    get total() {
      return this.tradingPoints + this.greenPoints;
    }
  };

  // Add calculations for tooltips
  const tradingCalculations: PointsCalculation[] = [
    {
      label: 'Total Trades',
      value: 127,
      points: 1270,
      multiplier: 10
    },
    {
      label: 'Win Rate Bonus',
      value: 68,
      points: 1380,
      multiplier: 20
    }
  ];

  const greenCalculations: PointsCalculation[] = [
    {
      label: 'Carbon-Neutral Trades',
      value: 85,
      points: 850,
      multiplier: 10
    },
    {
      label: 'Carbon Credits',
      value: 320,
      points: 670,
      multiplier: 2.1
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8"
        >
          <ArrowLeft size={20} />
          Back to ज्ञानDCX
        </button>

        {/* Updated Profile Header */}
        <div className="bg-purple-900/10 rounded-xl p-8 backdrop-blur-sm border border-purple-500/20 mb-8 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-medium border-4 border-purple-400">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{user?.email}</h1>
                <p className="text-gray-400">Member since {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">
                {userPoints.total}
                <span className="text-gray-400 text-lg"> / 5000</span>
              </div>
              <div className="text-sm text-gray-400">Total Points</div>
              <div className="mt-2 flex gap-3 text-sm">
                <div className="group relative">
                  <div className="flex items-center gap-1 cursor-help">
                    <span className="text-purple-400">Trading: {userPoints.tradingPoints}</span>
                    <Info size={14} className="text-purple-400/60" />
                  </div>
                  
                  {/* Trading Points Tooltip - Updated positioning */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 hidden group-hover:block z-50">
                    <div className="bg-black/90 rounded-lg p-4 shadow-xl border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Trading Points Calculation</h4>
                      <div className="space-y-2">
                        {tradingCalculations.map((calc, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between text-gray-400">
                              <span>{calc.label}</span>
                              <span>{calc.value}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>× {calc.multiplier} points</span>
                              <span>= {calc.points}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-purple-500/20 pt-2 mt-2">
                          <div className="flex justify-between text-purple-400 font-semibold">
                            <span>Total Trading Points</span>
                            <span>{userPoints.tradingPoints}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-black/90 border-r border-b border-purple-500/20 transform rotate-45"></div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="flex items-center gap-1 cursor-help">
                    <span className="text-green-400">Green: {userPoints.greenPoints}</span>
                    <Info size={14} className="text-green-400/60" />
                  </div>

                  {/* Green Points Tooltip - Updated positioning */}
                  <div className="absolute bottom-full right-0 mb-2 w-64 hidden group-hover:block z-50">
                    <div className="bg-black/90 rounded-lg p-4 shadow-xl border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Green Points Calculation</h4>
                      <div className="space-y-2">
                        {greenCalculations.map((calc, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between text-gray-400">
                              <span>{calc.label}</span>
                              <span>{calc.value}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>× {calc.multiplier} points</span>
                              <span>= {calc.points}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-green-500/20 pt-2 mt-2">
                          <div className="flex justify-between text-green-400 font-semibold">
                            <span>Total Green Points</span>
                            <span>{userPoints.greenPoints}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-6 -bottom-2 w-3 h-3 bg-black/90 border-r border-b border-green-500/20 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trading Statistics */}
          <div className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <LineChart className="text-purple-400" />
              <h2 className="text-xl font-semibold">Trading Statistics</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-1">Total Trades</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-green-500">68%</p>
              </div>
            </div>
          </div>

          {/* Green Trading Impact */}
          <div className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="text-green-400" />
              <h2 className="text-xl font-semibold">Green Trading Impact</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-1">Carbon-Neutral Trades</p>
                <p className="text-2xl font-bold text-green-400">85</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Carbon Credits Earned</p>
                <p className="text-2xl font-bold text-green-400">320</p>
              </div>
            </div>
          </div>

          {/* Latest Achievement */}
          <div className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Medal className="text-yellow-400" />
              <h2 className="text-xl font-semibold">Latest NFT Reward</h2>
            </div>
            <div className="bg-purple-800/30 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {/* NFT Image */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 p-0.5">
                  <div className="w-full h-full bg-purple-900 rounded-lg flex items-center justify-center">
                    <Trophy className="text-yellow-400 w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-400">Top Trader NFT #142</h3>
                  <p className="text-sm text-gray-400">Ranked #1 on Global Leaderboard</p>
                  <p className="text-xs text-gray-500 mt-1">Minted 2 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div 
            className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <History className="text-purple-400" />
              <h2 className="text-xl font-semibold">Recent Trades</h2>
            </div>
            <div className="space-y-3">
              {mockTrades.map((trade, index) => (
                <div 
                  key={trade.id}
                  onClick={() => {
                    setSelectedTrade(trade);
                    setShowTradeHistory(true);
                  }}
                  className="flex justify-between items-center text-sm border-b border-purple-500/10 pb-2 hover:bg-purple-900/20 p-2 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={trade.type === 'long' ? 'text-green-400' : 'text-red-400'}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="text-gray-400">{formatTimeAgo(trade.timestamp)}</span>
                  </div>
                  <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${trade.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Updated Leaderboard */}
          <div className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-400" />
              <h2 className="text-xl font-semibold">Global Leaderboard</h2>
            </div>
            <div className="space-y-3">
              {mockLeaderboard.map((player, index) => (
                <div key={index} className="flex justify-between items-center bg-purple-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-700' :
                      'text-purple-400'
                    }`}>#{player.rank}</span>
                    <span>{player.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2 text-sm">
                      <span className="text-purple-400">{player.tradingPoints}</span>
                      <span className="text-green-400">{player.greenPoints}</span>
                    </div>
                    <span className="font-bold text-purple-400 min-w-[80px] text-right">
                      {player.score} / 5000
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade History Modal */}
      {showTradeHistory && selectedTrade && (
        <ExitSummary
          team={mockTeam}
          teamScore={{ 
            teamName: mockTeam.teamName, 
            totalPnl: selectedTrade.pnl, 
            score: Math.floor(selectedTrade.pnl * 0.8) 
          }}
          players={[{
            ...mockTeam.members[0],
            balance: 10000 + selectedTrade.pnl,
            pnl: selectedTrade.pnl,
            trades: [selectedTrade]
          }]}
          onClose={() => {
            setShowTradeHistory(false);
            setSelectedTrade(null);
          }}
        />
      )}
    </div>
  );
} 