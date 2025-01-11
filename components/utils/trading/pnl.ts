import { Position, Trade, PnLSnapshot } from '../../types/trading';
import { calculateUnrealizedPnL } from './position';

export const calculateRealizedPnL = (trades: Trade[]): number => {
  return trades
    .filter(trade => trade.pnl !== undefined)
    .reduce((total, trade) => total + (trade.pnl || 0), 0);
};

export const calculateTotalPnL = (
  positions: Position[],
  trades: Trade[],
  currentPrice: number
): number => {
  const unrealizedPnL = positions.reduce(
    (total, position) => total + calculateUnrealizedPnL(position, currentPrice),
    0
  );
  const realizedPnL = calculateRealizedPnL(trades);
  
  return unrealizedPnL + realizedPnL;
};

export const createPnLSnapshot = (
  positions: Position[],
  trades: Trade[],
  currentPrice: number
): PnLSnapshot => {
  return {
    timestamp: Date.now(),
    unrealizedPnL: positions.reduce(
      (total, position) => total + calculateUnrealizedPnL(position, currentPrice),
      0
    ),
    realizedPnL: calculateRealizedPnL(trades),
    totalValue: positions.reduce(
      (total, position) => total + position.margin,
      0
    ),
    positions: [...positions]
  };
};