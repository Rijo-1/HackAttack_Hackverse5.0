import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, AlertCircle } from 'lucide-react';
import { validateTeamCode } from '../../utils/team/validation';
import { createTeamSocket } from '../../utils/team/socket';
import { useTeam } from '../../contexts/TeamContext';
import { TradingGame } from '../game/TradingGame';

const joinTeamSchema = z.object({
  teamCode: z.string()
    .refine(code => validateTeamCode(code), {
      message: 'Invalid team code format'
    }),
  email: z.string()
    .email('Invalid email address')
});

type JoinTeamFormData = z.infer<typeof joinTeamSchema>;

export const JoinTeamForm: React.FC = () => {
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);
  const { setTeamDetails } = useTeam();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<JoinTeamFormData>({
    resolver: zodResolver(joinTeamSchema)
  });

  const handleJoinTeam = async (data: JoinTeamFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Check if team exists
      const checkResponse = await fetch(`http://localhost:3001/api/teams/${data.teamCode}`);
      const checkResult = await checkResponse.json();

      if (!checkResult.exists) {
        setError('Team not found');
        return;
      }

      // Connect socket
      const socket = createTeamSocket('http://localhost:3001');
      
      socket.on('connect', () => {
        socket.emit('joinTeam', { teamCode: data.teamCode, email: data.email });
      });

      socket.on('error', (err) => {
        setError(err.message);
        socket.disconnect();
      });

      socket.on('teamUpdate', (update) => {
        console.log('Team update received:', update);
        setTeamData({
          teamCode: data.teamCode,
          teamName: checkResult.team?.name || 'Trading Team',
          members: update.members
        });
        setTeamDetails({
          teamCode: data.teamCode,
          teamName: checkResult.team?.name || 'Trading Team',
          email: data.email,
          socket
        });
        setShowGame(true);
      });

      socket.connect();
    } catch (err) {
      console.error('Join team error:', err);
      setError('Failed to join team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showGame && teamData) {
    return (
      <TradingGame
        team={teamData}
        onClose={() => setShowGame(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(handleJoinTeam)} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Team Code
        </label>
        <input
          {...register('teamCode')}
          className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          placeholder="Enter team code"
        />
        {errors.teamCode && (
          <p className="text-red-400 text-sm">{errors.teamCode.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Your Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2 text-red-400">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Users size={20} />
        {isLoading ? 'Joining Team...' : 'Join Team'}
      </button>
    </form>
  );
};