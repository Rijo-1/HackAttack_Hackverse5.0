import React from 'react';
import useSWR from 'swr';
import { Activity } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const TradingVolume: React.FC = () => {
  const { data: volumeData } = useSWR(
    'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT"]',
    fetcher,
    { refreshInterval: 10000 }
  );

  if (!volumeData) return <div>Loading...</div>;

  return (
    <div className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
      <h2 className="text-2xl font-bold mb-4">Trading Volume</h2>
      
      <div className="space-y-4">
        {volumeData.map((ticker: any) => (
          <div key={ticker.symbol} className="bg-black/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="text-purple-400" size={16} />
                <span className="font-semibold">{ticker.symbol}</span>
              </div>
              <span className="text-sm text-gray-400">24h Volume</span>
            </div>
            <span className="text-lg font-bold">
              ${(parseFloat(ticker.volume) * parseFloat(ticker.lastPrice)).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};