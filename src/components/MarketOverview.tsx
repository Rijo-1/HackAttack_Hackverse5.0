import React from 'react';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const MarketOverview: React.FC = () => {
  const { data: marketData } = useSWR(
    'https://api.coingecko.com/api/v3/global',
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: btcData } = useSWR(
    'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
    fetcher,
    { refreshInterval: 10000 }
  );

  if (!marketData || !btcData) return <div>Loading...</div>;

  return (
    <div className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
      <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">24h Volume</span>
          </div>
          <span className="text-xl font-bold">
            ${(parseFloat(btcData.volume) * parseFloat(btcData.lastPrice)).toLocaleString()}
          </span>
        </div>

        <div className="bg-black/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {parseFloat(btcData.priceChangePercent) >= 0 ? (
              <TrendingUp className="text-green-500" size={20} />
            ) : (
              <TrendingDown className="text-red-500" size={20} />
            )}
            <span className="text-sm text-gray-400">24h Change</span>
          </div>
          <span className={`text-xl font-bold ${
            parseFloat(btcData.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {btcData.priceChangePercent}%
          </span>
        </div>

        <div className="bg-black/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">Market Cap</span>
          </div>
          <span className="text-xl font-bold">
            ${marketData.data.total_market_cap.usd.toLocaleString()}
          </span>
        </div>

        <div className="bg-black/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">BTC Dominance</span>
          </div>
          <span className="text-xl font-bold">
            {marketData.data.market_cap_percentage.btc.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};