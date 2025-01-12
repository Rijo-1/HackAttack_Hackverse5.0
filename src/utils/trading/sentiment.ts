import Sentiment from 'sentiment';

interface NewsArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
  publishedAt: string;
  url: string;
}

interface SentimentAnalysis {
  score: number;  // -1 to 1 (bearish to bullish)
  confidence: number;  // 0 to 1
  keywords: string[];
  summary: string;
}

// Custom crypto-specific vocabulary
const cryptoVocab = {
  // Bullish terms
  'hodl': 2,
  'moon': 2,
  'bullish': 4,
  'surge': 3,
  'rally': 3,
  'breakthrough': 3,
  'adoption': 2,
  'institutional': 2,
  'mainstream': 2,
  'partnership': 2,
  'upgrade': 2,
  'innovation': 2,
  'accumulation': 2,
  'support': 1,
  
  // Bearish terms
  'dump': -3,
  'crash': -4,
  'bearish': -4,
  'plunge': -3,
  'hack': -4,
  'scam': -4,
  'fraud': -4,
  'ban': -3,
  'restriction': -2,
  'crackdown': -3,
  'correction': -2,
  'sell-off': -3,
  'risk': -1,
  'volatile': -1
};

const sentiment = new Sentiment();
sentiment.registerLanguage('en', {
  labels: {
    ...sentiment.labels,
    ...cryptoVocab
  }
});

export const analyzeSentiment = (articles: NewsArticle[]): SentimentAnalysis => {
  const results = articles.map(article => {
    const text = `${article.title}. ${article.description}`;
    return sentiment.analyze(text);
  });

  // Calculate aggregate sentiment
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const maxPossibleScore = articles.length * 5; // Assuming max score of 5 per article
  
  // Normalize score to -1 to 1 range
  const normalizedScore = totalScore / (maxPossibleScore || 1);

  // Collect all words that contributed to sentiment
  const keywords = new Set<string>();
  results.forEach(result => {
    result.positive.forEach(word => keywords.add(word));
    result.negative.forEach(word => keywords.add(word));
  });

  // Calculate confidence based on the number of sentiment-bearing words
  const totalWords = results.reduce((sum, result) => 
    sum + result.positive.length + result.negative.length, 0);
  const confidence = Math.min(totalWords / (articles.length * 5), 1); // Assume 5 sentiment words per article is max

  // Generate summary
  let summary = '';
  if (Math.abs(normalizedScore) < 0.2) {
    summary = 'Market sentiment appears neutral with mixed signals.';
  } else if (normalizedScore > 0) {
    const positiveWords = results.reduce((sum, result) => sum + result.positive.length, 0);
    const negativeWords = results.reduce((sum, result) => sum + result.negative.length, 0);
    summary = `Bullish sentiment dominates with ${positiveWords} positive indicators versus ${negativeWords} negative signals.`;
  } else {
    const positiveWords = results.reduce((sum, result) => sum + result.positive.length, 0);
    const negativeWords = results.reduce((sum, result) => sum + result.negative.length, 0);
    summary = `Bearish sentiment prevails with ${negativeWords} negative indicators versus ${positiveWords} positive signals.`;
  }

  return {
    score: normalizedScore,
    confidence,
    keywords: Array.from(keywords),
    summary
  };
};

// Helper function to get sentiment color based on score
export const getSentimentColor = (score: number): string => {
  if (score > 0.3) return 'text-green-500';
  if (score < -0.3) return 'text-red-500';
  return 'text-yellow-500';
};

// Helper function to get market direction text
export const getMarketDirection = (score: number): string => {
  if (score > 0.3) return 'Bullish';
  if (score < -0.3) return 'Bearish';
  return 'Neutral';
}; 