import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Activity, X } from 'lucide-react';
import { LiveChart } from '../LiveChart';
import useSWR from 'swr';
import { calculateTotalTaxLiability, calculateBreakevenPrice } from '../../utils/trading/tax';
import type { GamePlayer, Position } from '../../types/trading';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TradingInterfaceProps {
  player: GamePlayer;
  onTrade: (playerName: string, tradeData: any) => void;
  onClosePosition: (playerId: string, positionIndex: number) => void;
  gameEnded: boolean;
  currentPrice?: number;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({
  player,
  onTrade,
  onClosePosition,
  gameEnded,
  currentPrice = 0
}) => {
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [margin, setMargin] = useState(0);

  const { data: priceData } = useSWR(
    'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    fetcher,
    { refreshInterval: 1000 }
  );

  const livePrice = priceData?.price ? parseFloat(priceData.price) : currentPrice;

  useEffect(() => {
    const calculatedMargin = parseFloat(amount || '0') * parseFloat(leverage || '1');
    setMargin(calculatedMargin);
  }, [amount, leverage]);

  const calculatePositionPnL = (position: Position): number => {
    if (!livePrice || !position) return 0;
    
    const priceDiff = position.type === 'long'
      ? livePrice - position.entryPrice
      : position.entryPrice - livePrice;
    
    const leveragedPnL = (priceDiff / position.entryPrice) * position.margin;
    return Number.isFinite(leveragedPnL) ? leveragedPnL : 0;
  };

  const calculatePositionTaxes = (position: Position): JSX.Element => {
    const pnl = calculatePositionPnL(position);
    const taxes = calculateTotalTaxLiability(position.amount, pnl);
    const breakeven = calculateBreakevenPrice(position);

    return (
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Trading Fees (0.075%):</span>
          <span className="text-gray-300">${taxes.tradingFees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Transaction Tax (30%):</span>
          <span className="text-gray-300">${taxes.transactionTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">TDS (1%):</span>
          <span className="text-gray-300">${taxes.tds.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-gray-400">Total Tax:</span>
          <span className="text-gray-300">${taxes.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium pt-1 border-t border-purple-500/20">
          <span className="text-gray-400">Breakeven Price:</span>
          <span className="text-purple-400">${breakeven.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  const handleTrade = (type: 'long' | 'short') => {
    if (!amount || !leverage || gameEnded || !player) return;

    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) return;

    const tradeMargin = tradeAmount * parseFloat(leverage);
    if (tradeMargin > player.balance) return;

    onTrade(player.name, {
      type,
      amount: tradeAmount,
      leverage: parseInt(leverage),
      timestamp: Date.now(),
      entryPrice: livePrice,
      margin: tradeMargin
    });

    setAmount('');
  };

  const calculateMaxAmount = () => {
    return Math.max(0, (player?.balance || 0) * 0.95);
  };

  const totalPnL = player?.positions.reduce((sum, position) => {
    return sum + calculatePositionPnL(position);
  }, 0) || 0;

  const isMarginExceedingBalance = margin > (player?.balance || 0);

  if (!player) return null;

  return (
    <div className="space-y-4">
      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="h-[400px]">
          <LiveChart symbol="BTCUSDT" />
        </div>
      </div>

      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-purple-400 animate-pulse" />
            <span className="text-gray-400">Live Price</span>
          </div>
          <span className="text-xl font-bold">${livePrice?.toLocaleString()}</span>
        </div>
      </div>

      {player.positions.length > 0 && (
        <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Activity className="text-purple-400" size={18} />
            Open Positions
          </h3>
          <div className="space-y-2">
            {player.positions.map((position, index) => {
              const pnl = calculatePositionPnL(position);
              const marginChange = ((pnl / position.margin) * 100).toFixed(2);
              
              return (
                <div
                  key={index}
                  className="bg-black/20 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {position.type === 'long' ? (
                        <TrendingUp className="text-green-500" size={16} />
                      ) : (
                        <TrendingDown className="text-red-500" size={16} />
                      )}
                      <div>
                        <div className="text-sm font-semibold">
                          {position.type.toUpperCase()} ${position.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Entry: ${position.entryPrice.toFixed(2)} • {position.leverage}x
                        </div>
                        <div className="text-xs text-gray-400">
                          Margin: ${position.margin.toFixed(2)} ({marginChange}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="text-gray-400 mr-2">PnL:</span>
                        <span className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                          ${pnl.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => onClosePosition(player.name, index)}
                        disabled={gameEnded}
                        className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {calculatePositionTaxes(position)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (USDT)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={calculateMaxAmount()}
                step="0.1"
                className="w-full bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter amount"
                disabled={gameEnded}
              />
              <button
                type="button"
                onClick={() => setAmount(calculateMaxAmount().toString())}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300"
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              disabled={gameEnded}
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
              <option value="20">20x</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Required Margin</label>
            <div className={`w-full bg-black/20 border rounded-lg px-4 py-2 text-white ${
              isMarginExceedingBalance ? 'border-red-500' : 'border-purple-500/20'
            }`}>
              ${margin.toFixed(2)}
              {isMarginExceedingBalance && (
                <div className="text-xs text-red-400 mt-1">
                  Exceeds available balance
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleTrade('long')}
            disabled={!amount || gameEnded || isMarginExceedingBalance}
            className="flex-1 py-2 px-4 rounded-lg font-semibold bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={16} />
              Long
            </div>
          </button>
          <button
            onClick={() => handleTrade('short')}
            disabled={!amount || gameEnded || isMarginExceedingBalance}
            className="flex-1 py-2 px-4 rounded-lg font-semibold bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-1">
              <TrendingDown size={16} />
              Short
            </div>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-400">Balance</div>
              <div className="font-semibold">${player.balance.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total PnL</div>
              <div className={`font-semibold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalPnL.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-yellow-500/80">
            <AlertTriangle size={14} />
            <span>High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};