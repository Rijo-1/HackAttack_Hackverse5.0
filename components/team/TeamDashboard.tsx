import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, AlertCircle, Swords } from 'lucide-react';
import type { Team } from '../../types/trading';
import { TradingGame } from '../game/TradingGame';
import { useTeam } from '../../contexts/TeamContext';

interface TeamDashboardProps {
  team: Team;
  onClose: () => void;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, onClose }) => {
  const [showGame, setShowGame] = useState(false);
  const { socket } = useTeam();
  const [members, setMembers] = useState(team.members || []);

  useEffect(() => {
    if (socket) {
      socket.on('teamUpdate', (update) => {
        console.log('Team update received:', update);
        if (update.members) {
          setMembers(update.members);
        }
      });

      socket.on('gameStateUpdate', (update) => {
        console.log('Game state update received:', update);
        setShowGame(!!update.inGame);
      });

      return () => {
        socket.off('teamUpdate');
        socket.off('gameStateUpdate');
      };
    }
  }, [socket]);

  const handleEnterGame = () => {
    console.log('Attempting to enter game...');
    if (members.length > 0 && socket) {
      try {
        socket.emit('enterGame', { teamCode: team.teamCode });
        console.log('enterGame event emitted');
        setShowGame(true);
      } catch (error) {
        console.error('Error entering game:', error);
      }
    } else {
      console.log('Cannot enter game:', { 
        membersLength: members.length, 
        hasSocket: !!socket 
      });
    }
  };

  if (showGame) {
    console.log('Rendering TradingGame with team:', team);
    const gameTeam = {
      ...team,
      members: members.map(member => ({
        ...member,
        name: member.name || member.email.split('@')[0],
        role: member.role || (member.isCreator ? 'Team Leader' : 'Member')
      }))
    };

    return (
      <TradingGame
        team={gameTeam}
        onClose={() => {
          console.log('Closing game...');
          if (socket) {
            socket.emit('exitGame', { teamCode: team.teamCode });
          }
          setShowGame(false);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold">{team.teamName}</h2>
              <p className="text-gray-400">Team Code: {team.teamCode}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleEnterGame}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Swords className="text-purple-300" />
              Enter War Room
            </button>
            <button
              onClick={onClose}
              className="border border-purple-500/20 hover:bg-purple-900/20 px-4 py-2 rounded-lg transition-colors"
            >
              Exit Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-400" />
              <h3 className="font-semibold">Active Trades</h3>
            </div>
            <p className="text-2xl font-bold">12</p>
          </div>

          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-purple-400" />
              <h3 className="font-semibold">Trading Time</h3>
            </div>
            <p className="text-2xl font-bold">48h</p>
          </div>

          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-purple-400" />
              <h3 className="font-semibold">Risk Level</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">Low</p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <h3 className="text-xl font-bold">Team Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member, index) => (
              <div
                key={member.email}
                className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl">
                  {member.name?.charAt(0) || member.email.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{member.name || member.email.split('@')[0]}</h4>
                  <p className="text-gray-400 text-sm">{member.role || (member.isCreator ? 'Team Leader' : 'Member')}</p>
                  <p className="text-purple-400 text-sm">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-gray-400 text-center">No recent trading activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};