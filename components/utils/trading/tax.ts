import { Position, Trade } from '../../types/trading';

export interface TaxBreakdown {
  tradingFees: number;
  transactionTax: number;
  tds: number;
  total: number;
}

export const calculateTradingFees = (positionSize: number): number => {
  return positionSize * 0.00075; // 0.075% trading fee
};

export const calculateTransactionTax = (profit: number): number => {
  return profit > 0 ? profit * 0.30 : 0; // 30% on profit
};

export const calculateTDS = (positionSize: number): number => {
  return positionSize * 0.01; // 1% TDS
};

export const calculateTotalTaxLiability = (
  positionSize: number,
  profit: number = 0
): TaxBreakdown => {
  const tradingFees = calculateTradingFees(positionSize);
  const transactionTax = calculateTransactionTax(profit);
  const tds = calculateTDS(positionSize);

  return {
    tradingFees,
    transactionTax,
    tds,
    total: tradingFees + transactionTax + tds
  };
};

export const calculateBreakevenPrice = (position: Position): number => {
  const totalFees = calculateTradingFees(position.amount) + calculateTDS(position.amount);
  const feeAdjustment = (totalFees / position.amount) * position.entryPrice;
  
  if (position.type === 'long') {
    return position.entryPrice + feeAdjustment;
  } else {
    return position.entryPrice - feeAdjustment;
  }
};