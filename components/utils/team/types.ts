export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: number;
  lastActive: number;
  balance: number;
  positions: Position[];
  trades: Trade[];
  pnl: number;
}

export interface Position {
  id: string;
  type: 'long' | 'short';
  symbol: string;
  entryPrice: number;
  amount: number;
  leverage: number;
  timestamp: number;
  status: 'open' | 'closed';
}

export interface Trade {
  id: string;
  memberId: string;
  type: 'long' | 'short';
  symbol: string;
  amount: number;
  price: number;
  leverage: number;
  timestamp: number;
  pnl?: number;
  closePrice?: number;
}

export interface TeamActivity {
  id: string;
  memberId: string;
  type: 'join' | 'trade' | 'message' | 'strategy';
  timestamp: number;
  data: Record<string, any>;
}

export interface Team {
  id: string;
  code: string;
  name: string;
  createdAt: number;
  members: TeamMember[];
  activities: TeamActivity[];
  tradingBalance: number;
  maxLeverage: number;
  allowedSymbols: string[];
  activeTrades: Trade[];
  tradingHistory: Trade[];
  teamPnL: number;
}

export interface JoinTeamResponse {
  success: boolean;
  message: string;
  team?: Team;
  member?: TeamMember;
}

export interface TeamTradingUpdate {
  type: 'trade' | 'position' | 'balance';
  memberId: string;
  data: Trade | Position | number;
  timestamp: number;
}