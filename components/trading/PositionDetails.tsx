import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PositionConfig } from '../../utils/trading/position-calculator';
import { calculateTotalTaxLiability } from '../../utils/trading/tax';

interface PositionDetailsProps {
  position: PositionConfig & { metrics: any };
  currentPrice: number;
  onClose?: () => void;
}

export const PositionDetails: React.FC<PositionDetailsProps> = ({
  position,
  currentPrice,
  onClose
}) => {
  const taxes = calculateTotalTaxLiability(position.metrics.positionSize);

  return (
    <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {position.type === 'long' ? (
            <TrendingUp className="text-green-500" />
          ) : (
            <TrendingDown className="text-red-500" />
          )}
          <h3 className="text-xl font-bold">
            {position.type.toUpperCase()} ${position.metrics.positionSize.toFixed(2)}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"
          >
            Close Position
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-black/20 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Entry Price:</span>
            <span>${position.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Current Price:</span>
            <span>${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Leverage:</span>
            <span>{position.leverage}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ROE:</span>
            <span className={position.metrics.roe >= 0 ? 'text-green-500' : 'text-red-500'}>
              {position.metrics.roe.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold mb-2">Tax Breakdown</h4>
          <div className="flex justify-between">
            <span className="text-gray-400">Trading Fee (0.075%):</span>
            <span>${taxes.tradingFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Transaction Tax (30%):</span>
            <span>${taxes.transactionTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">TDS (1%):</span>
            <span>${taxes.tds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-purple-500/20 pt-2 mt-2">
            <span>Total Tax:</span>
            <span>${taxes.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Breakeven Price:</span>
            <span className="font-semibold">${position.metrics.breakeven.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};