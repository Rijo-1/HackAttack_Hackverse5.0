import React, { useState } from 'react';
import { TeamCreationModal } from './TeamCreationModal';
import { JoinTeamForm } from './JoinTeamForm';
import { TeamDashboard } from './TeamDashboard';
import { useTeam } from '../../contexts/TeamContext';
import { createTeamSocket } from '../../utils/team/socket';
import { Users } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const { setTeamDetails, teamCode, teamName, userEmail } = useTeam();

  const handleCreateTeam = async (data: { teamName: string; teamCode: string; email: string }) => {
    try {
      const socket = createTeamSocket('http://localhost:3001');
      
      // Wait for socket connection before setting team details
      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => {
          socket.createTeam(data.teamCode, data.email);
          resolve();
        });
        socket.on('error', (err) => reject(err));
        socket.connect();
      });

      setTeamDetails({
        teamCode: data.teamCode,
        teamName: data.teamName,
        email: data.email,
        socket
      });
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create team:', err);
      setError('Failed to create team. Please try again.');
    }
  };

  const handleJoinTeam = async (data: { teamCode: string; email: string }) => {
    setIsLoading(true);
    try {
      const socket = createTeamSocket('http://localhost:3001');
      setTeamDetails({
        teamCode: data.teamCode,
        teamName: '', // This will be updated from server
        email: data.email,
        socket
      });
    } catch (err) {
      setError('Failed to join team');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // If we have an active team, show the dashboard
  if (teamCode && teamName && userEmail) {
    const teamData = {
      teamCode,
      teamName,
      members: [{
        email: userEmail,
        name: userEmail.split('@')[0],
        role: 'Team Leader',
        isCreator: true
      }]
    };

    return (
      <TeamDashboard
        team={teamData}
        onClose={() => {
          // Clear team details when closing dashboard
          setTeamDetails({
            teamCode: '',
            teamName: '',
            email: '',
            socket: null as any
          });
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-md w-full">
        <div className="space-y-6">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Create New Team
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">or join existing</span>
            </div>
          </div>

          <JoinTeamForm
            onSubmit={handleJoinTeam}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {isCreating && (
        <TeamCreationModal
          onClose={() => setIsCreating(false)}
          onCreateTeam={handleCreateTeam}
        />
      )}
    </div>
  );
}; 