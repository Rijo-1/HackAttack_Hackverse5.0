import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { assessmentQuestions, Question } from './AssessmentQuestions';
import { supabase } from '../../utils/supabaseClient';

interface AssessmentProps {
  userId: string;
  onComplete: (results: Record<string, string>) => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ userId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = async (questionId: number, answerIndex: number) => {
    const selectedOption = assessmentQuestions[currentQuestion].options[answerIndex];
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));

    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const { data, error } = await supabase
        .from('assessment_reports')
        .insert([{ user_id: userId, results: answers }]);

      if (error) {
        console.error('Error saving assessment report:', error);
      } else {
        onComplete(answers);
      }
    }
  };

  const question = assessmentQuestions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Trading Assessment</h3>
            <span className="text-purple-400">
              {currentQuestion + 1} / {assessmentQuestions.length}
            </span>
          </div>
          <div className="w-full bg-purple-900/20 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / assessmentQuestions.length) * 100}%`
              }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(question.id, index)}
              className="w-full text-left p-4 rounded-xl bg-purple-900/10 hover:bg-purple-900/20 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300 group-hover:text-white">
                  {option}
                </span>
                <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {currentQuestion > 0 && (
          <button
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="mt-6 text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous question
          </button>
        )}
      </div>
    </div>
  );
};