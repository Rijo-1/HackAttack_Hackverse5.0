import React from 'react';
import { Check, Users, Shield, MessageSquare, TrendingUp } from 'lucide-react';
import type { Team, TeamMember } from '../../utils/team/types';

interface JoinConfirmationProps {
  team: Team;
  member: TeamMember;
  onContinue: () => void;
}

export const JoinConfirmation: React.FC<JoinConfirmationProps> = ({
  team,
  member,
  onContinue
}) => {
  const privileges = [
    {
      icon: Users,
      title: 'Team Access',
      description: 'View and interact with team members'
    },
    {
      icon: TrendingUp,
      title: 'Trading Activities',
      description: 'Track real-time trading performance'
    },
    {
      icon: MessageSquare,
      title: 'Team Discussions',
      description: 'Participate in strategy discussions'
    },
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'End-to-end encrypted communications'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-4">
          <Check size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to {team.name}!</h2>
        <p className="text-gray-400">
          You've successfully joined the team. Here's what you can do:
        </p>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {privileges.map((privilege, index) => (
          <div
            key={index}
            className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 flex items-start gap-3"
          >
            <privilege.icon className="text-purple-400 mt-1" size={20} />
            <div>
              <h3 className="font-semibold mb-1">{privilege.title}</h3>
              <p className="text-sm text-gray-400">{privilege.description}</p>
            </div>
          </div>
        ))}
      </div> */}

      <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Team Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Respect team members and maintain professional communication</li>
          <li>• Share trading insights and strategies responsibly</li>
          <li>• Keep team information and discussions confidential</li>
          <li>• Stay active and contribute to team objectives</li>
        </ul>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
      >
        Continue to Team Dashboard
      </button>
    </div>
  );
};