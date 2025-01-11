import React from 'react';
import { Check, Users } from 'lucide-react';

interface JoinTeamSuccessProps {
  teamName: string;
  memberCount: number;
  onContinue: () => void;
}

export const JoinTeamSuccess: React.FC<JoinTeamSuccessProps> = ({
  teamName,
  memberCount,
  onContinue
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-green-500/20 rounded-full p-4">
          <Check className="text-green-500" size={32} />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2">Successfully Joined Team!</h3>
        <p className="text-gray-400">
          You've joined {teamName} with {memberCount} other {memberCount === 1 ? 'member' : 'members'}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Users size={20} />
        Continue to Team
      </button>
    </div>
  );
}; 