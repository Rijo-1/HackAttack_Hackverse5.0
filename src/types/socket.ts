import type { Socket } from 'socket.io-client';
import type { Position, Trade, TeamMember, GameState } from './trading';

export interface TradeUpdate {
  email: string;
  positions: Position[];
  balance: number;
  trade: Trade;
}

export interface TradeCloseUpdate {
  email: string;
  positions: Position[];
  trades: Trade[];
  balance: number;
  pnl: number;
}

export interface TeamSocket extends Socket {
  emit(event: 'placeTrade', data: { teamCode: string; email: string; trade: Omit<Trade, 'timestamp'> }): boolean;
  emit(event: 'closeTrade', data: { teamCode: string; email: string; tradeIndex: number; closePrice: number }): boolean;
  on(event: 'tradeUpdate', callback: (update: TradeUpdate) => void): this;
  on(event: 'tradeClose', callback: (update: TradeCloseUpdate) => void): this;
  on(event: 'gameStateSync', callback: (data: { gameState: GameState }) => void): this;
} 