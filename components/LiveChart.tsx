import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

interface LiveChartProps {
  symbol: string;
}

export const LiveChart: React.FC<LiveChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(139, 92, 246, 0.1)' },
        horzLines: { color: 'rgba(139, 92, 246, 0.1)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(139, 92, 246, 0.3)',
          labelBackgroundColor: 'rgba(139, 92, 246, 0.3)',
        },
        horzLine: {
          color: 'rgba(139, 92, 246, 0.3)',
          labelBackgroundColor: 'rgba(139, 92, 246, 0.3)',
        },
      },
      timeScale: {
        borderColor: 'rgba(139, 92, 246, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(139, 92, 246, 0.2)',
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;

    const resizeChart = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const fetchAndUpdateData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        const candleData = data.map((d: any[]) => ({
          time: Math.floor(d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        if (chartRef.current) {
          candlestickSeries.setData(candleData);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        // Add fallback data if needed
        const fallbackData = Array.from({ length: 100 }, (_, i) => ({
          time: Math.floor(Date.now() / 1000) - (100 - i) * 60,
          open: 40000,
          high: 40100,
          low: 39900,
          close: 40050,
        }));
        if (chartRef.current) {
          candlestickSeries.setData(fallbackData);
        }
      }
    };

    window.addEventListener('resize', resizeChart);
    resizeChart();
    fetchAndUpdateData();

    const intervalId = setInterval(fetchAndUpdateData, 10000);

    return () => {
      window.removeEventListener('resize', resizeChart);
      clearInterval(intervalId);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
};