import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface TradingTipProps {
  tip: string;
}

export const TradingTip: React.FC<TradingTipProps> = ({ tip }) => {
  return (
    <div className="bg-indigo-900/30 backdrop-blur-sm p-4 rounded-xl border border-indigo-500/20 hover-scale">
      <div className="flex items-center gap-3">
        <AlertCircle className="text-indigo-400" size={20} />
        <p className="text-indigo-100 font-medium">{tip}</p>
      </div>
    </div>
  );
};