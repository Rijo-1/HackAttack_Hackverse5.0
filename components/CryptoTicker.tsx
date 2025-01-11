import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const CryptoTicker: React.FC = () => {
  const { data: binanceData } = useSWR(
    'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","ADAUSDT","DOTUSDT","AVAXUSDT","LINKUSDT","MATICUSDT","UNIUSDT"]',
    fetcher,
    { refreshInterval: 10000 }
  );

  if (!binanceData) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex overflow-hidden py-4">
      <div className="animate-ticker flex gap-8">
        {binanceData.map((ticker: any) => (
          <div key={ticker.symbol} className="flex items-center gap-2 px-4">
            <span className="font-semibold">{ticker.symbol.replace('USDT', '')}</span>
            <span className="text-gray-400">${parseFloat(ticker.lastPrice).toLocaleString()}</span>
            <span className={`${
              parseFloat(ticker.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {parseFloat(ticker.priceChangePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};