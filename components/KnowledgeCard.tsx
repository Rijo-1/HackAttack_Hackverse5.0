import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface KnowledgeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-br from-purple-900/20 to-black backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 text-left w-full hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="text-purple-400 group-hover:scale-110 transition-transform" size={24} />
        <h3 className="text-lg font-semibold text-purple-400 group-hover:text-purple-300">
          {title}
        </h3>
      </div>
      <p className="text-sm text-zinc-400 group-hover:text-zinc-300 mb-4">
        {description}
      </p>
      <div className="flex items-center gap-1 text-xs text-purple-400/70 group-hover:text-purple-400">
        <span>Learn more</span>
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};