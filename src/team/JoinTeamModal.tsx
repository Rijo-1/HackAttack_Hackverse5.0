import React, { useState } from 'react';
import { X } from 'lucide-react';
import { JoinTeamForm } from './JoinTeamForm';
import { JoinConfirmation } from './JoinConfirmation';
import type { Team, TeamMember, JoinTeamResponse } from '../../utils/team/types';
import { TeamTradingSocket } from '../../utils/team/tradingSocket';

interface JoinTeamModalProps {
  onClose: () => void;
  onJoinSuccess: (team: Team, member: TeamMember) => void;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  onClose,
  onJoinSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [joinedTeam, setJoinedTeam] = useState<Team>();
  const [joinedMember, setJoinedMember] = useState<TeamMember>();

  const handleJoinTeam = async (data: {
    teamID: string;
    teamCode: string;
    teamName: string;
    id: string;
    name: string;
    email: string;

  }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Simulate API call
      const response: JoinTeamResponse = {
        success: true,
        message: 'Successfully joined team',
        team: {
          id: data.teamID,
          code: data.teamCode,
          name: data.teamName,
          createdAt: Date.now(),
          members: [],
          activities: []
        },
        member: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: 'member',
          joinedAt: Date.now(),
          lastActive: Date.now()
        }
      };

      if (response.success && response.team && response.member) {
        setJoinedTeam(response.team);
        setJoinedMember(response.member);
      } else {
        throw new Error(response.message || 'Failed to join team');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (joinedTeam && joinedMember) {
      onJoinSuccess(joinedTeam, joinedMember);
    }
  };

  const handleJoinSuccess = (team: Team, member: TeamMember) => {
    // Initialize trading socket
    const tradingSocket = new TeamTradingSocket(team, member);
    
    // Store socket instance in global state or context
    // You might want to create a TradingContext to manage this
    
    onJoinSuccess({ team, member, tradingSocket });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Join Trading Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {joinedTeam && joinedMember ? (
          <JoinConfirmation
            team={joinedTeam}
            member={joinedMember}
            onContinue={handleContinue}
          />
        ) : (
          <JoinTeamForm
            onSubmit={handleJoinTeam}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};