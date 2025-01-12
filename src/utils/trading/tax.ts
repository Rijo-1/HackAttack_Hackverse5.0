import { Position, Trade } from '../../types/trading';

export interface TaxBreakdown {
  tradingFees: number;
  transactionTax: number;
  tds: number;
  total: number;
  finalAmount: number;
  netPnL: number;
}

export interface TradeResult {
  grossPnL: number;
  taxes: TaxBreakdown;
  netPnL: number;
  finalBalance: number;
  roi: number;  // Return on Investment percentage
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
  profit: number = 0,
  initialAmount: number = positionSize
): TaxBreakdown => {
  const tradingFees = calculateTradingFees(positionSize);
  const transactionTax = calculateTransactionTax(profit);
  const tds = calculateTDS(positionSize);
  const totalTaxes = tradingFees + transactionTax + tds;

  const netPnL = profit - totalTaxes;

  const finalAmount = initialAmount + netPnL;

  return {
    tradingFees,
    transactionTax,
    tds,
    total: totalTaxes,
    finalAmount,
    netPnL
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

export const calculateRequiredPriceMovement = (
  position: Position,
  targetProfit: number
): number => {
  const taxes = calculateTotalTaxLiability(position.amount, targetProfit);
  const requiredGrossProfit = targetProfit + taxes.total;
  
  const movement = (requiredGrossProfit / position.amount) / position.leverage;
  
  if (position.type === 'long') {
    return position.entryPrice * (1 + movement);
  } else {
    return position.entryPrice * (1 - movement);
  }
};

export const calculatePotentialProfit = (
  position: Position,
  exitPrice: number
): {
  grossPnL: number;
  netPnL: number;
  taxes: TaxBreakdown;
} => {
  const priceDiff = position.type === 'long'
    ? exitPrice - position.entryPrice
    : position.entryPrice - exitPrice;

  const grossPnL = (priceDiff / position.entryPrice) * position.amount * position.leverage;
  const taxes = calculateTotalTaxLiability(position.amount, grossPnL, position.amount);

  return {
    grossPnL,
    netPnL: taxes.netPnL,
    taxes
  };
};

export const calculateTradeResult = (
  position: Position,
  exitPrice: number,
  currentBalance: number
): TradeResult => {
  const priceDiff = position.type === 'long'
    ? exitPrice - position.entryPrice
    : position.entryPrice - exitPrice;

  const grossPnL = (priceDiff / position.entryPrice) * position.amount * position.leverage;

  const taxes = calculateTotalTaxLiability(position.amount, grossPnL, position.amount);

  const finalBalance = currentBalance + taxes.netPnL;

  const roi = (taxes.netPnL / position.amount) * 100;

  return {
    grossPnL,
    taxes,
    netPnL: taxes.netPnL,
    finalBalance,
    roi
  };
};

export const calculateMarginWithTaxes = (
  entryPrice: number,
  amount: number,
  leverage: number
): {
  requiredMargin: number;
  estimatedTaxes: number;
  totalRequired: number;
} => {
  const positionSize = amount * entryPrice;
  const requiredMargin = positionSize / leverage;
  const estimatedTaxes = calculateTradingFees(positionSize) + calculateTDS(positionSize);
  
  return {
    requiredMargin,
    estimatedTaxes,
    totalRequired: requiredMargin + estimatedTaxes
  };
};

export const isBalanceSufficient = (
  balance: number,
  position: Position
): {
  isValid: boolean;
  requiredAmount: number;
  shortfall: number;
} => {
  const { totalRequired } = calculateMarginWithTaxes(
    position.entryPrice,
    position.amount,
    position.leverage
  );

  return {
    isValid: balance >= totalRequired,
    requiredAmount: totalRequired,
    shortfall: totalRequired - balance
  };
};

export const calculateMaxPositionSize = (
  balance: number,
  entryPrice: number,
  leverage: number
): {
  maxAmount: number;
  maxPositionSize: number;
  estimatedTaxes: number;
} => {
  const taxRate = 0.01075; // Combined trading fee and TDS
  const effectiveBalance = balance / (1 + taxRate);
  
  const maxPositionSize = effectiveBalance * leverage;
  const maxAmount = maxPositionSize / entryPrice;
  const estimatedTaxes = balance - effectiveBalance;

  return {
    maxAmount,
    maxPositionSize,
    estimatedTaxes
  };
};