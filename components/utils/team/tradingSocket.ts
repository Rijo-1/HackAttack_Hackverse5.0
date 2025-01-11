import { io, Socket } from 'socket.io-client';
import type { Team, TeamMember, Trade, Position, TeamTradingUpdate } from './types';

export class TeamTradingSocket {
  private socket: Socket;
  private team: Team;
  private member: TeamMember;

  constructor(team: Team, member: TeamMember) {
    this.socket = io(import.meta.env.VITE_TRADING_SOCKET_URL);
    this.team = team;
    this.member = member;
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket.on('connect', () => {
      this.socket.emit('join_team', {
        teamId: this.team.id,
        memberId: this.member.id
      });
    });

    this.socket.on('trade_update', (update: TeamTradingUpdate) => {
      // Handle trade updates
    });

    this.socket.on('position_update', (update: TeamTradingUpdate) => {
      // Handle position updates
    });

    this.socket.on('balance_update', (update: TeamTradingUpdate) => {
      // Handle balance updates
    });
  }

  public placeTrade(trade: Omit<Trade, 'id' | 'timestamp'>) {
    this.socket.emit('place_trade', {
      teamId: this.team.id,
      memberId: this.member.id,
      trade
    });
  }

  public closePosition(positionId: string, closePrice: number) {
    this.socket.emit('close_position', {
      teamId: this.team.id,
      memberId: this.member.id,
      positionId,
      closePrice
    });
  }

  public disconnect() {
    this.socket.disconnect();
  }
} 