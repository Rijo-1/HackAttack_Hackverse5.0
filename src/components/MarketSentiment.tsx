import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Newspaper } from 'lucide-react';
import { analyzeSentiment } from '../utils/trading/sentiment';

export const MarketSentiment: React.FC = () => {
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  const fetchNewsAndAnalyze = async () => {
    setLoading(true);
    try {
      // Direct fetch instead of using NewsAPI package
      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=bitcoin` +
        `&apiKey=${import.meta.env.VITE_NEWS_API_KEY}` +  // Updated to use Vite env variable
        `&language=en` +
        `&sortBy=publishedAt` +
        `&pageSize=10`
      );

      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
        // Analyze sentiment
        const analysis = analyzeSentiment(data.articles);
        setSentiment(analysis);
      }
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsAndAnalyze();
    const interval = setInterval(fetchNewsAndAnalyze, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-500';
    if (score < -0.3) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <TrendingUp className="text-green-500" />;
    if (score < -0.3) return <TrendingDown className="text-red-500" />;
    return <AlertTriangle className="text-yellow-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Market Sentiment Analysis</h3>
        <button
          onClick={fetchNewsAndAnalyze}
          className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {sentiment && (
        <div className="space-y-3 w-full">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="text-sm text-gray-400">Sentiment Score</div>
              <div className={`text-xl font-bold ${getSentimentColor(sentiment.score)}`}>
                {(sentiment.score * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="text-sm text-gray-400">Confidence</div>
              <div className="text-xl font-bold text-purple-400">
                {(sentiment.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="text-sm text-gray-400">Market Direction</div>
              <div className="flex items-center gap-2">
                {getSentimentIcon(sentiment.score)}
                <span className={`font-bold ${getSentimentColor(sentiment.score)}`}>
                  {sentiment.score > 0.3 ? 'Bullish' : sentiment.score < -0.3 ? 'Bearish' : 'Neutral'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-1">Key Indicators</div>
              <div className="flex flex-wrap gap-2">
                {sentiment.keywords.slice(0, 6).map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-purple-500/20 rounded-md text-xs text-purple-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-1">Market Summary</div>
              <p className="text-sm text-white line-clamp-2">{sentiment.summary}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Recent News</h4>
        <div className="grid gap-2">
          {articles.slice(0, 4).map((article: any, index: number) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-purple-900/20 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all flex gap-3 p-2"
            >
              {article.urlToImage ? (
                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 rounded-md bg-purple-500/10 flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-purple-500/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h3>
                  <div className="text-[10px] text-purple-400 whitespace-nowrap flex-shrink-0">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">{article.source.name}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};