import React, { useState } from 'react';
import { Users, Copy, X } from 'lucide-react';
import { generateTeamCode } from '../../utils/team';
import { createTeamSocket } from '../../utils/team/socket';
import { TradingGame } from '../game/TradingGame';
import { useTeam } from '../../contexts/TeamContext';
import type { Team } from '../../types/trading';

interface TeamCreationModalProps {
  onClose: () => void;
  onCreateTeam: (team: Team) => void;
}

export const TeamCreationModal: React.FC<TeamCreationModalProps> = ({ onClose, onCreateTeam }) => {
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamCode] = useState(() => generateTeamCode());
  const [showGame, setShowGame] = useState(false);
  const { setTeamDetails } = useTeam();

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamCode,
          teamName: teamName.trim(),
          creatorEmail: email.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const data = await response.json();
      
      // Connect socket
      const socket = createTeamSocket('http://localhost:3001');
      
      socket.on('error', (err) => {
        setError(err.message);
        socket.disconnect();
      });

      socket.on('connect', () => {
        socket.emit('createTeam', { teamCode, email });
        const teamData: Team = {
          teamCode,
          teamName: teamName.trim(),
          members: [{
            email: email.trim(),
            name: email.split('@')[0],
            role: 'Team Leader',
            isCreator: true,
            balance: 1000,
            pnl: 0,
            positions: [],
            trades: []
          }]
        };
        
        setTeamDetails({
          teamCode,
          teamName: teamName.trim(),
          email: email.trim(),
          socket
        });
        
        onCreateTeam(teamData);
      });

      socket.connect();
    } catch (err) {
      setError('Failed to create team. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Team Name
            </label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Team Code
            </label>
            <div className="flex gap-2">
              <input
                value={teamCode}
                readOnly
                className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
              />
              <button
                type="button"
                onClick={copyTeamCode}
                className="bg-purple-600 hover:bg-purple-700 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-900/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};