import React from 'react';

export interface Question {
  id: number;
  text: string;
  options: string[];
  category: string;
}

export const assessmentQuestions: Question[] = [
  {
    id: 1,
    text: "How would you describe your trading experience?",
    options: [
      "New to trading",
      "Some spot trading experience",
      "Experienced with futures",
      "Professional trader"
    ],
    category: "Experience"
  },
  {
    id: 2,
    text: "How familiar are you with derivatives trading concepts?",
    options: [
      "Basic understanding",
      "Familiar with futures",
      "Experienced with options",
      "Expert in derivatives"
    ],
    category: "Derivatives"
  },
  {
    id: 3,
    text: "What's your approach to risk management?",
    options: [
      "Learning the basics",
      "Use stop losses",
      "Position sizing expert",
      "Advanced risk modeling"
    ],
    category: "Risk"
  },
  {
    id: 4,
    text: "How do you analyze market movements?",
    options: [
      "Basic price action",
      "Technical indicators",
      "Multiple timeframes",
      "Advanced algorithms"
    ],
    category: "Analysis"
  },
  {
    id: 5,
    text: "Which leverage level are you comfortable with?",
    options: [
      "1-2x leverage",
      "Up to 5x leverage",
      "Up to 10x leverage",
      "20x or higher"
    ],
    category: "Risk"
  },
  {
    id: 6,
    text: "How do you handle losing trades?",
    options: [
      "Often emotional",
      "Sometimes affected",
      "Usually calm",
      "Completely neutral"
    ],
    category: "Psychology"
  },
  {
    id: 7,
    text: "What's your preferred trading timeframe?",
    options: [
      "Day trading",
      "Swing trading",
      "Position trading",
      "Mixed approach"
    ],
    category: "Strategy"
  },
  {
    id: 8,
    text: "How do you manage your trading capital?",
    options: [
      "No specific plan",
      "Basic budgeting",
      "Strict position sizing",
      "Advanced portfolio management"
    ],
    category: "Capital"
  },
  {
    id: 9,
    text: "What's your approach to market research?",
    options: [
      "Social media/news",
      "Technical analysis",
      "Fundamental analysis",
      "Multi-factor research"
    ],
    category: "Research"
  },
  {
    id: 10,
    text: "How do you handle volatile market conditions?",
    options: [
      "Avoid trading",
      "Reduce position size",
      "Adjust strategies",
      "Thrive in volatility"
    ],
    category: "Risk"
  }
];