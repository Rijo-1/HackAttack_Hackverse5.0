import { TaxBreakdown } from './tax';

export interface PositionConfig {
  inputAmount: number;
  leverage: number;
  entryPrice: number;
  type: 'long' | 'short';
}

export interface PositionMetrics {
  positionSize: number;
  collateralRequired: number;
  updatedBalance: number;
  roe: number;
  breakeven: number;
}

export function calculatePositionMetrics(
  config: PositionConfig,
  currentBalance: number,
  taxes: TaxBreakdown
): PositionMetrics {
  // Position size is the leveraged amount (for calculating potential profit/loss)
  const positionSize = config.inputAmount * config.leverage;
  
  // Collateral required is just the input amount (not leveraged)
  const collateralRequired = config.inputAmount;
  
  // Updated balance is current balance minus the collateral (input amount)
  const updatedBalance = currentBalance - config.inputAmount;

  // Calculate ROE (Return on Equity)
  // ROE = (Profit or Loss / Initial Margin) × 100
  const roe = 0; // Initial ROE is 0 at entry

  // Calculate breakeven including tax impact
  const totalTaxImpact = taxes.total;
  const breakeven = config.type === 'long'
    ? config.entryPrice + (totalTaxImpact / positionSize)
    : config.entryPrice - (totalTaxImpact / positionSize);

  return {
    positionSize,
    collateralRequired,
    updatedBalance,
    roe,
    breakeven
  };
}

export function calculateCurrentROE(
  position: PositionConfig,
  currentPrice: number,
  initialMargin: number
): number {
  const priceDiff = position.type === 'long'
    ? currentPrice - position.entryPrice
    : position.entryPrice - currentPrice;
  
  const profitLoss = priceDiff * (position.inputAmount * position.leverage);
  return (profitLoss / initialMargin) * 100;
}