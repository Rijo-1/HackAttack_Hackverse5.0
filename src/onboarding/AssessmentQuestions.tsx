import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface AssessmentQuestionsProps {
  onComplete: () => void;
}

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

export const AssessmentQuestions: React.FC<AssessmentQuestionsProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingAssessment, setHasExistingAssessment] = useState(false);

  useEffect(() => {
    const checkExistingAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('assessment_reports')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error checking existing assessment:', error);
          return;
        }

        if (data && data.length > 0) {
          setHasExistingAssessment(true);
          // Skip assessment if already completed
          onComplete();
        }
      } catch (error) {
        console.error('Error in checkExistingAssessment:', error);
      }
    };

    checkExistingAssessment();
  }, [onComplete]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Check again before submitting to prevent duplicates
      const { data: existingAssessment } = await supabase
        .from('assessment_reports')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingAssessment && existingAssessment.length > 0) {
        console.log('Assessment already exists, skipping submission');
        onComplete();
        return;
      }

      const { error } = await supabase
        .from('assessment_reports')
        .insert([
          {
            user_id: user.id,
            results: answers,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error submitting assessment:', error);
        return;
      }

      onComplete();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [assessmentQuestions[currentQuestionIndex].id]: answer
    }));

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  if (hasExistingAssessment) {
    return null;
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
        </h2>
        <p className="text-lg text-gray-300">{currentQuestion.text}</p>
      </div>

      <div className="grid gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={isSubmitting}
            className="p-4 text-left rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors border border-purple-500/20 text-white disabled:opacity-50"
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>Category: {currentQuestion.category}</span>
        <span>{currentQuestionIndex + 1} / {assessmentQuestions.length}</span>
      </div>
    </div>
  );
};