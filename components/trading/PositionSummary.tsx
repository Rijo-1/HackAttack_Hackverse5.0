import React from 'react';
import type { Position } from '../../utils/trading/position';

interface PositionSummaryProps {
  position: Position;
}

export const PositionSummary: React.FC<PositionSummaryProps> = ({ position }) => {
  return (
    <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-bold mb-4">Position Summary</h3>
      
      <div className="space-y-4">
        <div className="bg-black/20 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Initial Margin:</span>
            <span className="font-semibold">${position.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Leverage:</span>
            <span className="font-semibold">{position.leverage}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Position Size:</span>
            <span className="font-semibold">${position.positionSize.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining Balance:</span>
            <span className="font-semibold">${position.updatedBalance.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400">
            <p>• Initial margin of ${position.amount.toFixed(2)} is required</p>
            <p>• Position is leveraged {position.leverage}x</p>
            <p>• Total position value is ${position.positionSize.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};