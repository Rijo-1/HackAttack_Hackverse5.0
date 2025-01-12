import React from 'react';
import { Trophy, DollarSign, Receipt, Calculator, ArrowLeft, Leaf } from 'lucide-react';
import type { Team, GamePlayer, TeamScore } from '../../types/trading';
import { calculateTotalTaxLiability } from '../../utils/trading/tax';
import { calculateCarbonFootprint, calculateGreennessScore, calculateFinalPoints } from '../../utils/trading/carbonFootprint';

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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
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
                <div className={`text-lg ${teamScore.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
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

              const totalCarbonFootprint = player.trades.reduce((sum, trade) =>
                sum + calculateCarbonFootprint(trade.amount, trade.leverage), 0
              );

              const averageGreennessScore = calculateGreennessScore(totalCarbonFootprint);
              const finalPoints = calculateFinalPoints(player.pnl, totalCarbonFootprint);

              return (
                <div key={player.name} className="space-y-6">
                  {/* Player Card */}
                  <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">{player.name}</h3>

                    {/* Performance Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Final Balance</div>
                        <div className="text-lg font-bold">{formatCurrency(player.balance)}</div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Total P&L</div>
                        <div className={`text-lg font-bold ${player.pnl >= 0 ? 'text-green-500' : 'text-red-500'
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

                    {/* Environmental Impact */}
                    <div className="bg-black/20 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Leaf className="text-green-400" />
                        <h4 className="font-semibold text-white">Environmental Impact</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Carbon Footprint</span>
                          <span>{totalCarbonFootprint.toFixed(2)}g CO2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Greenness Score</span>
                          <span className={`${averageGreennessScore > 70 ? 'text-green-500' :
                              averageGreennessScore > 40 ? 'text-yellow-500' :
                                'text-red-500'
                            }`}>
                            {averageGreennessScore}%
                          </span>
                        </div>
                        <div className="border-t border-purple-500/20 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Final Points</span>
                            <span className="text-purple-400">{finalPoints}</span>
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
                              <span className={`font-medium ${trade.type === 'long' ? 'text-green-500' :
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