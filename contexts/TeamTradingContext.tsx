import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Team, TeamMember, Trade, Position } from '../utils/team/types';
import { TeamTradingSocket } from '../utils/team/tradingSocket';

interface TeamTradingContextType {
  team: Team | null;
  member: TeamMember | null;
  activeTrades: Trade[];
  positions: Position[];
  balance: number;
  placeTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
  closePosition: (positionId: string, closePrice: number) => void;
}

const TeamTradingContext = createContext<TeamTradingContextType | null>(null);

export function TeamTradingProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<TeamTradingSocket | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState(0);

  // Initialize socket and handle updates
  useEffect(() => {
    if (team && member) {
      const newSocket = new TeamTradingSocket(team, member);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [team, member]);

  const value = {
    team,
    member,
    activeTrades,
    positions,
    balance,
    placeTrade: (trade) => socket?.placeTrade(trade),
    closePosition: (positionId, closePrice) => socket?.closePosition(positionId, closePrice)
  };

  return (
    <TeamTradingContext.Provider value={value}>
      {children}
    </TeamTradingContext.Provider>
  );
}

export const useTeamTrading = () => {
  const context = useContext(TeamTradingContext);
  if (!context) {
    throw new Error('useTeamTrading must be used within a TeamTradingProvider');
  }
  return context;
}; 