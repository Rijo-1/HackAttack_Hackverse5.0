import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, Brain, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { KnowledgeCard } from './KnowledgeCard';
import { generateAIResponse } from '../utils/ai/chat';
import type { ChatMessage as ChatMessageType } from '../utils/ai/chat';
import { supabase } from '../utils/supabaseClient';
import { generateSystemInstruction, generateInitialGreeting } from '../utils/ai/config';

const suggestedTopics = [
  { 
    title: "Trading Tournaments", 
    description: "Learn about our crypto futures trading competitions",
    icon: Trophy
  },
  { 
    title: "Risk Management", 
    description: "Master position sizing and stop losses",
    icon: TrendingUp
  },
  { 
    title: "Market Analysis", 
    description: "Professional technical and fundamental analysis",
    icon: Brain
  },
];

export const AIChat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatMessageType[]>([]);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        console.log('Fetching assessment data for user:', user.id); // Debug log

        const { data, error } = await supabase
          .from('assessment_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) // Get the most recent assessment
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching assessment data:', error);
          return;
        }

        if (data) {
          console.log('Assessment data found:', data); // Debug log
          const profile = processAssessmentResults(data.results);
          setUserProfile(profile);
          setConversation([{ 
            role: 'ai', 
            content: generateInitialGreeting(profile)
          }]);
        } else {
          console.log('No assessment data found for user'); // Debug log
        }
      } catch (error) {
        console.error('Error in fetchAssessmentData:', error);
      }
    };

    fetchAssessmentData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setHasInteracted(true);
    const userMessage = input.trim();
    setInput('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await generateAIResponse(userMessage, userProfile);
      setConversation(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setConversation(prev => [...prev, { 
        role: 'ai', 
        content: "I apologize, but I encountered an error. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const processAssessmentResults = (results: Record<string, string>) => {
    return {
      experience: results[1],
      derivatives: results[2],
      risk: results[3],
      analysis: results[4],
      strategy: results[7]
    };
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-purple-900/20 p-4 bg-gradient-to-r from-black to-purple-900/20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to ज्ञानDCX</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="text-purple-400 animate-pulse" size={24} />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
            </div>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">ज्ञान-AI</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scrollbar-custom bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.07)_0%,rgba(0,0,0,0)_100%)]">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {showApiKeyWarning && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-200">
              <h3 className="font-semibold mb-2">AI Chat Configuration Required</h3>
              <p>To enable AI chat functionality, please set up your VITE_GOOGLE_AI_KEY environment variable. Contact your administrator for assistance.</p>
            </div>
          )}

          {conversation.length === 0 && (
            <div className="space-y-8 py-12 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-purple-400 bg-purple-500/10 px-6 py-3 rounded-full">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="font-semibold">Your Trading Tournament Assistant</span>
                </div>
                <h2 className="text-3xl font-bold">Welcome to ज्ञान-AI</h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Get expert guidance on crypto futures trading tournaments, strategies, and market analysis
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {suggestedTopics.map((topic, index) => (
                  <KnowledgeCard 
                    key={index}
                    title={topic.title}
                    description={topic.description}
                    icon={topic.icon}
                    onClick={() => setInput(`Tell me about ${topic.title.toLowerCase()}`)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {conversation.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {!hasInteracted && conversation.length === 1 && (
            <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
              {suggestedTopics.map((topic, index) => (
                <KnowledgeCard 
                  key={index}
                  title={topic.title}
                  description={topic.description}
                  icon={topic.icon}
                  onClick={() => {
                    setInput(`Tell me about ${topic.title.toLowerCase()}`);
                    inputRef.current?.focus();
                  }}
                />
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex animate-message-slide-up">
              <div className="bg-zinc-900/90 rounded-2xl p-4 backdrop-blur-sm">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-purple-900/20 bg-gradient-to-b from-black to-purple-900/20">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          disabled={showApiKeyWarning}
          placeholder={showApiKeyWarning ? "AI chat is currently unavailable" : "Ask ज्ञान-AI about trading tournaments and strategies..."}
        />
      </div>
    </div>
  );
};
