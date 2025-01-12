import { Position } from '../../types/trading';

export const validateLeverage = (leverage: number): boolean => {
  return leverage >= 1 && leverage <= 100 && Number.isInteger(leverage);
};

export const validateMargin = (
  margin: number,
  availableBalance: number
): boolean => {
  return margin > 0 && margin <= availableBalance;
};

export const validatePosition = (
  position: Position,
  currentPrice: number
): boolean => {
  return (
    position.margin > 0 &&
    position.leverage >= 1 &&
    position.entryPrice > 0 &&
    position.amount > 0 &&
    ['long', 'short'].includes(position.type)
  );
};