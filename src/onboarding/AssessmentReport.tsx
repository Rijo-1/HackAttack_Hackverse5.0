import React from 'react';
import { Brain, Target, TrendingUp, Shield, BookOpen } from 'lucide-react';

interface AssessmentReportProps {
  results: Record<string, number>;
  onComplete: () => void;
}

export const AssessmentReport: React.FC<AssessmentReportProps> = ({
  results,
  onComplete,
}) => {
  const getExperienceLevel = (score: number) => {
    if (score <= 1) return "Beginner";
    if (score <= 2) return "Intermediate";
    return "Advanced";
  };

  const calculateRecommendations = () => {
    const recommendations = [];
    
    if (results[1] <= 1) {
      recommendations.push("Focus on basic trading concepts and terminology");
    }
    if (results[3] <= 1) {
      recommendations.push("Practice technical analysis fundamentals");
    }
    if (results[2] <= 1) {
      recommendations.push("Study risk management principles");
    }
    if (results[7] <= 1) {
      recommendations.push("Develop trading psychology awareness");
    }

    return recommendations;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="text-purple-400 w-8 h-8" />
          <h2 className="text-2xl font-bold text-white">Your Trading Profile</h2>
        </div>

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-purple-400 w-5 h-5" />
                <h3 className="font-semibold text-white">Experience Level</h3>
              </div>
              <p className="text-gray-300">{getExperienceLevel(results[1])}</p>
            </div>
            
            <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-purple-400 w-5 h-5" />
                <h3 className="font-semibold text-white">Analysis Skills</h3>
              </div>
              <p className="text-gray-300">{getExperienceLevel(results[4])}</p>
            </div>
          </div>

          <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-purple-400 w-5 h-5" />
              <h3 className="font-semibold text-white">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {calculateRecommendations().map((rec, index) => (
                <li key={index} className="text-gray-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          Begin Learning Journey
        </button>
      </div>
    </div>
  );
};