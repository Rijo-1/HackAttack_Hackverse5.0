import React from 'react';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Activity, Percent, Users, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const MarketSentiment: React.FC = () => {
  const { data: fundingData } = useSWR(
    'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: openInterest } = useSWR(
    'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: lsrData } = useSWR(
    'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
    fetcher,
    { refreshInterval: 30000 }
  );

  if (!fundingData || !openInterest || !lsrData) return <div>Loading...</div>;

  // Simulated values for demo
  const simulatedData = {
    lsr: 1.25,
    longPercentage: 55.5,
    fundingRate: 0.01,
    nextFunding: new Date(Date.now() + 3600000 * 8),
    openInterest: parseFloat(openInterest.volume) * parseFloat(openInterest.lastPrice) * 0.1
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">Long/Short Ratio</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{simulatedData.lsr.toFixed(2)}</span>
            <span className={`text-sm ${simulatedData.lsr > 1 ? 'text-green-500' : 'text-red-500'}`}>
              {simulatedData.longPercentage.toFixed(1)}% Long
            </span>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">Funding Rate</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xl font-bold ${simulatedData.fundingRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(simulatedData.fundingRate * 100).toFixed(4)}%
            </span>
            <span className="text-sm text-gray-400">8h</span>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">Open Interest</span>
          </div>
          <span className="text-xl font-bold">
            ${simulatedData.openInterest.toLocaleString()}
          </span>
        </div>

        <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">Next Funding</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              {simulatedData.nextFunding.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-all">
        <h3 className="text-lg font-semibold mb-3">Tournament Insights</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Current market sentiment is bullish with {simulatedData.longPercentage.toFixed(1)}% traders long</p>
          <p>• Funding rate indicates {simulatedData.fundingRate >= 0 ? 'positive' : 'negative'} momentum</p>
          <p>• High trading activity with significant open interest</p>
        </div>
      </div>
    </div>
  );
};