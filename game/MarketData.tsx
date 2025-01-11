import React, { useState, useEffect } from 'react';
import { LineChart, CandlestickChart, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const MarketData: React.FC = () => {
  const [orderBook, setOrderBook] = useState({
    bids: [] as [number, number][],
    asks: [] as [number, number][],
  });

  const { data: marketData } = useSWR(
    'https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTCUSDT',
    fetcher,
    { refreshInterval: 1000 }
  );

  useEffect(() => {
    // Simulate L2 order book data
    const generateOrderBook = () => {
      const basePrice = marketData?.bidPrice ? parseFloat(marketData.bidPrice) : 40000;
      const bids: [number, number][] = [];
      const asks: [number, number][] = [];

      for (let i = 0; i < 10; i++) {
        bids.push([
          basePrice - i * 10 - Math.random() * 5,
          Math.random() * 2 + 0.1,
        ]);
        asks.push([
          basePrice + i * 10 + Math.random() * 5,
          Math.random() * 2 + 0.1,
        ]);
      }

      setOrderBook({ bids, asks });
    };

    const interval = setInterval(generateOrderBook, 1000);
    return () => clearInterval(interval);
  }, [marketData]);

  return (
    <div className="space-y-4">
      {/* Price Overview */}
      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <LineChart className="text-purple-400" size={20} />
            BTC/USDT
          </h3>
          <span className="text-sm text-gray-400">Perpetual</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="text-green-500" size={16} />
              <span className="text-sm text-gray-400">Best Bid</span>
            </div>
            <span className="text-lg font-semibold text-white">
              ${parseFloat(marketData?.bidPrice || "0").toLocaleString()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <ArrowDownRight className="text-red-500" size={16} />
              <span className="text-sm text-gray-400">Best Ask</span>
            </div>
            <span className="text-lg font-semibold text-white">
              ${parseFloat(marketData?.askPrice || "0").toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Order Book */}
      <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <CandlestickChart className="text-purple-400" size={20} />
            Order Book
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <Activity className="text-purple-400 animate-pulse" size={16} />
            <span className="text-gray-400">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Bids */}
          <div className="space-y-1">
            {orderBook.bids.map(([price, size], i) => (
              <div
                key={`bid-${i}`}
                className="flex justify-between text-sm"
                style={{
                  background: `linear-gradient(to left, rgba(34, 197, 94, 0.1) ${
                    size * 50
                  }%, transparent 0)`,
                }}
              >
                <span className="text-green-500">{price.toFixed(1)}</span>
                <span className="text-gray-400">{size.toFixed(3)}</span>
              </div>
            ))}
          </div>

          {/* Asks */}
          <div className="space-y-1">
            {orderBook.asks.map(([price, size], i) => (
              <div
                key={`ask-${i}`}
                className="flex justify-between text-sm"
                style={{
                  background: `linear-gradient(to right, rgba(239, 68, 68, 0.1) ${
                    size * 50
                  }%, transparent 0)`,
                }}
              >
                <span className="text-red-500">{price.toFixed(1)}</span>
                <span className="text-gray-400">{size.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};