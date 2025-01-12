import { Position, Trade } from '../../types/trading';

export const calculateWinRate = (trades: Trade[]): number => {
  const closedTrades = trades.filter(trade => trade.pnl !== undefined);
  if (closedTrades.length === 0) return 0;
  
  const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
  return (winningTrades.length / closedTrades.length) * 100;
};

export const calculateAverageProfitSize = (trades: Trade[]): number => {
  const profitableTrades = trades.filter(trade => (trade.pnl || 0) > 0);
  if (profitableTrades.length === 0) return 0;
  
  const totalProfit = profitableTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  return totalProfit / profitableTrades.length;
};

export const calculateAverageLossSize = (trades: Trade[]): number => {
  const lossTrades = trades.filter(trade => (trade.pnl || 0) < 0);
  if (lossTrades.length === 0) return 0;
  
  const totalLoss = Math.abs(lossTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
  return totalLoss / lossTrades.length;
};

export const calculateRiskRewardRatio = (trades: Trade[]): number => {
  const avgProfit = calculateAverageProfitSize(trades);
  const avgLoss = calculateAverageLossSize(trades);
  
  return avgLoss === 0 ? 0 : avgProfit / avgLoss;
};