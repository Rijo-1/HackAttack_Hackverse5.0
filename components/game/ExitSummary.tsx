import React, { useState } from 'react';
import { Trophy, DollarSign, Receipt, Calculator, ArrowLeft, Award, Download } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { Team, GamePlayer, TeamScore } from '../../types/trading';
import { calculateTotalTaxLiability } from '../../utils/trading/tax';
import { supabase } from '../../utils/supabase';

interface ExitSummaryProps {
  team: Team;
  teamScore: TeamScore;
  players: GamePlayer[];
  onClose: () => void;
}

export const ExitSummary: React.FC<ExitSummaryProps> = ({
  team,
  teamScore,
  players,
  onClose,
}) => {
  const [nftCollected, setNftCollected] = useState(false);

  const calculateTaxes = (player: GamePlayer) => {
    const totalPnL = player.pnl;
    const tradingVolume = player.trades.reduce((sum, trade) => sum + trade.amount, 0);
    
    const taxes = calculateTotalTaxLiability(tradingVolume, totalPnL);
    
    return {
      tradingFees: taxes.tradingFees,
      transactionTax: taxes.transactionTax,
      tds: taxes.tds,
      total: taxes.total
    };
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString();

  // Sort players by PnL to find the winner
  const sortedPlayers = [...players].sort((a, b) => b.pnl - a.pnl);
  const winner = sortedPlayers[0];
  const isWinner = (player: GamePlayer) => player.name === winner.name;

  const handleClaimNFT = async (playerName: string, playerEmail: string) => {
    const apiKey = "sk_staging_5jzSoFuMxJsg3fknVJAH8NecdauV3thHD8wkitfgcZCL2RetR23PJqXw3hGubsCyZu7RCQzCGAqx2D5BTWAKao7Rvd48oHytJghmVZtd7FLELgCTC89M8R16dvk2B6wnZuxTnuYGeF9QgPVsFQ3DA1yAaJrUTaKZkYraXXBcLo4JBYTeLptsN1zRcqNgbw7mTEoofyRow1WghPfp24C1ckxk";
    const chain = "polygon-amoy"; // or "polygon-amoy", "ethereum-sepolia", ...
    const env = "staging"; // or "www"
    const recipientAddress = `email:${playerEmail}:${chain}`;

    const url = `http://localhost:5000/api/mint-nft`; // Use your proxy server URL

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: recipientAddress,
          metadata: {
            name: "Green Champion NFT",
            image: "https://picsum.photos/400",
            description: "NFT for maintaining the green environment by trading carbon friendly.",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log(json); // Log the full response from Crossmint

      // Store the user email, created at, and action_id in Supabase
      const { data, error } = await supabase
        .from('green_nft_data')
        .insert([
          { email: playerEmail, created_at: new Date().toISOString(), action_id: json.id }
        ]);

      if (error) {
        console.error("Error storing data in Supabase:", error);
      } else {
        console.log("Action ID:", json.id); // Log the action ID
        setNftCollected(true);
        toast.success(`Congratulations! Green NFT Trophy claimed by ${playerName} and sent to ${playerEmail}`);
      }
    } catch (err) {
      console.error("Error minting NFT:", err);
      toast.error("Failed to claim NFT. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <ToastContainer />
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Trading Session Summary
            </h2>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Return to ज्ञानDCX
            </button>
          </div>

          {/* Winner Announcement */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-green-400 w-8 h-8" />
                  <h3 className="text-xl font-bold text-white">Trading Champion</h3>
                </div>
                <p className="text-green-400">{winner.name}</p>
                <p className="text-gray-400">Total PnL: {formatCurrency(winner.pnl)}</p>
              </div>
              <button
                onClick={() => handleClaimNFT(winner.name, winner.email)}
                className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 ${nftCollected ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={nftCollected}
              >
                <Download className="w-5 h-5" />
                {nftCollected ? 'NFT Collected' : 'Claim Green NFT Trophy'}
              </button>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{team.teamName}</h3>
                <p className="text-gray-400">Team Performance</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {teamScore.score} points
                </div>
                <div className={`text-lg ${
                  teamScore.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatCurrency(teamScore.totalPnl)}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {players.map(player => {
              const taxes = calculateTaxes(player);
              
              return (
                <div key={player.name} className="space-y-6">
                  {/* Player Card */}
                  <div className={`bg-purple-900/20 rounded-xl p-6 border ${
                    isWinner(player) ? 'border-green-500/50' : 'border-purple-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-bold text-white">{player.name}</h3>
                      {isWinner(player) && (
                        <Award className="text-green-400 w-6 h-6" />
                      )}
                    </div>
                    
                    {/* Performance Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Final Balance</div>
                        <div className="text-lg font-bold">{formatCurrency(player.balance)}</div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Total P&L</div>
                        <div className={`text-lg font-bold ${
                          player.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatCurrency(player.pnl)}
                        </div>
                      </div>
                    </div>

                    {/* Tax Report */}
                    <div className="bg-black/20 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Calculator className="text-purple-400" />
                        <h4 className="font-semibold text-white">Tax Summary</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trading Fees (0.075%)</span>
                          <span>{formatCurrency(taxes.tradingFees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transaction Tax (30% on profit)</span>
                          <span>{formatCurrency(taxes.transactionTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">TDS (1%)</span>
                          <span>{formatCurrency(taxes.tds)}</span>
                        </div>
                        <div className="border-t border-purple-500/20 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Tax Liability</span>
                            <span>{formatCurrency(taxes.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade History */}
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Receipt className="text-purple-400" />
                        <h4 className="font-semibold text-white">Trade History</h4>
                      </div>
                      <div className="space-y-2">
                        {player.trades.map((trade, index) => (
                          <div
                            key={index}
                            className="text-sm border-b border-purple-500/10 last:border-0 pb-2"
                          >
                            <div className="flex justify-between mb-1">
                              <span className={`font-medium ${
                                trade.type === 'long' ? 'text-green-500' : 
                                trade.type === 'short' ? 'text-red-500' : 'text-purple-400'
                              }`}>
                                {trade.type.toUpperCase()}
                              </span>
                              <span className="text-gray-400">
                                {formatDate(trade.timestamp)}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>{formatCurrency(trade.amount)} USDT</span>
                              {trade.pnl !== undefined && (
                                <span className={trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  {formatCurrency(trade.pnl)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};