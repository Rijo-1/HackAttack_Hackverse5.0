export interface Position {
  type: 'long' | 'short';
  entryPrice: number;
  amount: number;
  leverage: number;
  timestamp: number;
  margin: number;
}

export interface Trade extends Position {
  closePrice?: number;
  pnl?: number;
  closedAt?: number;
}

export interface TeamMember {
  email: string;
  name: string;
  role: string;
  isCreator?: boolean;
  balance: number;
  pnl: number;
  positions: Position[];
  trades: Trade[];
}

export interface Team {
  teamCode: string;
  teamName: string;
  members: TeamMember[];
}

export interface GameState {
  started: boolean;
  ended: boolean;
  timeLeft: number;
}