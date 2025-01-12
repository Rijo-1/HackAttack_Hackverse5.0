import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { calculatePositionMetrics, type PositionConfig } from '../../utils/trading/position-calculator';
import { calculateTotalTaxLiability } from '../../utils/trading/tax';

interface PositionEntryProps {
  currentPrice: number;
  currentBalance: number;
  onPositionCreate: (position: PositionConfig & { metrics: ReturnType<typeof calculatePositionMetrics> }) => void;
}

export const PositionEntry: React.FC<PositionEntryProps> = ({
  currentPrice,
  currentBalance,
  onPositionCreate
}) => {
  const [inputAmount, setInputAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<string>('5');
  const [positionMetrics, setPositionMetrics] = useState<ReturnType<typeof calculatePositionMetrics> | null>(null);

  useEffect(() => {
    if (inputAmount && leverage && currentPrice) {
      const amount = parseFloat(inputAmount);
      const lev = parseFloat(leverage);
      
      if (amount > 0 && lev > 0) {
        const config: PositionConfig = {
          inputAmount: amount,
          leverage: lev,
          entryPrice: currentPrice,
          type: 'long'
        };

        const positionSize = amount * lev;
        const taxes = calculateTotalTaxLiability(positionSize);
        const metrics = calculatePositionMetrics(config, currentBalance, taxes);
        setPositionMetrics(metrics);
      }
    }
  }, [inputAmount, leverage, currentPrice, currentBalance]);

  const handleCreatePosition = (type: 'long' | 'short') => {
    if (!inputAmount || !leverage || !positionMetrics) return;

    const config: PositionConfig = {
      inputAmount: parseFloat(inputAmount),
      leverage: parseFloat(leverage),
      entryPrice: currentPrice,
      type
    };

    onPositionCreate({ ...config, metrics: positionMetrics });
    setInputAmount('');
  };

  const isValid = positionMetrics && positionMetrics.collateralRequired <= currentBalance;

  return (
    <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-bold mb-4">Create Position</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Amount (USDT)</label>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="w-full bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Leverage</label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
            <option value="20">20x</option>
          </select>
        </div>

        {positionMetrics && (
          <div className="bg-black/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Position Size:</span>
              <span className="font-semibold">${positionMetrics.positionSize.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Updated Balance:</span>
              <span className="font-semibold">${positionMetrics.updatedBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Breakeven Price:</span>
              <span className="font-semibold">${positionMetrics.breakeven.toFixed(2)}</span>
            </div>
          </div>
        )}

        {!isValid && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={16} />
            <span>Insufficient balance for this position</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleCreatePosition('long')}
            disabled={!isValid}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 disabled:opacity-50"
          >
            <TrendingUp size={20} />
            Long
          </button>
          <button
            onClick={() => handleCreatePosition('short')}
            disabled={!isValid}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 disabled:opacity-50"
          >
            <TrendingDown size={20} />
            Short
          </button>
        </div>
      </div>
    </div>
  );
};