export interface Position {
  amount: number;
  leverage: number;
  positionSize: number;
  updatedBalance: number;
}

export function calculatePosition(
  amount: number,
  leverage: number,
  currentBalance: number
): Position {
  // Position size is the leveraged amount (for calculating potential profit/loss)
  const positionSize = amount * leverage;
  
  // Updated balance is current balance minus the input amount (not leveraged)
  const updatedBalance = currentBalance - amount;

  return {
    amount,
    leverage,
    positionSize,
    updatedBalance
  };
}

export function validatePosition(
  amount: number,
  currentBalance: number
): string | null {
  if (amount <= 0) {
    return "Amount must be greater than 0";
  }
  if (amount > currentBalance) {
    return "Insufficient balance";
  }
  return null;
}

export function calculateUnrealizedPnL(
  position: Position,
  currentPrice: number
): number {
  const priceDiff = position.type === 'long'
    ? currentPrice - position.entryPrice
    : position.entryPrice - currentPrice;
  
  return priceDiff * position.positionSize;
}