import React, { createContext, useContext, useState } from 'react';
import { TeamSocket } from '../utils/team/socket';

interface TeamContextType {
  teamCode: string | null;
  teamName: string | null;
  userEmail: string | null;
  socket: TeamSocket | null;
  setTeamDetails: (details: { 
    teamCode: string; 
    teamName: string; 
    email: string;
    socket: TeamSocket;
  }) => void;
  clearTeam: () => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [socket, setSocket] = useState<TeamSocket | null>(null);

  const setTeamDetails = ({ teamCode, teamName, email, socket }: {
    teamCode: string;
    teamName: string;
    email: string;
    socket: TeamSocket;
  }) => {
    setTeamCode(teamCode);
    setTeamName(teamName);
    setUserEmail(email);
    setSocket(socket);
  };

  const clearTeam = () => {
    socket?.disconnect();
    setTeamCode(null);
    setTeamName(null);
    setUserEmail(null);
    setSocket(null);
  };

  return (
    <TeamContext.Provider value={{
      teamCode,
      teamName,
      userEmail,
      socket,
      setTeamDetails,
      clearTeam
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}; 