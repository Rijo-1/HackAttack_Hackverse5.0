import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { calculatePosition, validatePosition } from '../../utils/trading/position';

interface PositionCalculatorProps {
  currentBalance: number;
  onPositionCreate?: (position: ReturnType<typeof calculatePosition>) => void;
}

export const PositionCalculator: React.FC<PositionCalculatorProps> = ({
  currentBalance,
  onPositionCreate
}) => {
  const [amount, setAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<string>('5');
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<ReturnType<typeof calculatePosition> | null>(null);

  useEffect(() => {
    if (!amount) {
      setError(null);
      setPosition(null);
      return;
    }

    const inputAmount = parseFloat(amount);
    const validationError = validatePosition(inputAmount, currentBalance);

    if (validationError) {
      setError(validationError);
      setPosition(null);
      return;
    }

    const newPosition = calculatePosition(
      inputAmount,
      parseFloat(leverage),
      currentBalance
    );

    setPosition(newPosition);
    setError(null);
  }, [amount, leverage, currentBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (position && !error && onPositionCreate) {
      onPositionCreate(position);
      setAmount('');
    }
  };

  return (
    <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-bold mb-4">Calculate Position</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Amount (USDT)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Leverage
          </label>
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

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {position && !error && (
          <div className="bg-black/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Position Size:</span>
              <span className="font-semibold">
                ${position.positionSize.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Required Margin:</span>
              <span className="font-semibold">
                ${position.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Updated Balance:</span>
              <span className="font-semibold">
                ${position.updatedBalance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!position || !!error}
          className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create Position
        </button>
      </form>
    </div>
  );
};