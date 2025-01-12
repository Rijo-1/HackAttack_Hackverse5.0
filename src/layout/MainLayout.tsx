import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  LineChart,
  Rocket,
  Users,
  LogIn,
  LogOut,
  Newspaper,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AIChat } from '../AIChat';
import { CryptoTicker } from '../CryptoTicker';
import { MarketOverview } from '../MarketOverview';
import { TradingVolume } from '../TradingVolume';
import { LiveChart } from '../LiveChart';
import { MarketSentiment } from '../MarketSentiment';
import { WelcomePopup } from '../onboarding/WelcomePopup';
import { Assessment } from '../onboarding/Assessment';
import { AssessmentReport } from '../onboarding/AssessmentReport';
import { TourGuide } from '../TourGuide';
import { TeamCreationModal } from '../team/TeamCreationModal';
import { JoinTeamModal } from '../team/JoinTeamModal';
import { TeamDashboard } from '../team/TeamDashboard';
import { AuthModal } from '../auth/AuthModal';
import { TeamProvider } from '../../contexts/TeamContext';
import type { Team } from '../../types/team';
import { supabase } from '../../utils/supabaseClient';

interface NewsArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
  publishedAt: string;
  url: string;
  urlToImage?: string;
}

export function MainLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [showAIChat, setShowAIChat] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showTourGuide, setShowTourGuide] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<
    Record<string, number>
  >({});

  // Team-related states
  const [showTeamCreation, setShowTeamCreation] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTeamDashboard, setShowTeamDashboard] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [showTeamMenu, setShowTeamMenu] = useState(false);

  // Auth-related states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectAction, setAuthRedirectAction] = useState<
    'ai-chat' | 'trading' | null
  >(null);

  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [newsLoading, setNewsLoading] = useState(false);

  const newsKeywords = [
    'all',
    'bitcoin',
    'ethereum',
    'crypto',
    'blockchain',
    'defi',
    'nft',
    'trading',
    'market'
  ];

  const fetchNews = async (keyword: string = 'all') => {
    setNewsLoading(true);
    try {
      const query = keyword === 'all'
        ? 'cryptocurrency OR bitcoin OR blockchain'
        : keyword;

      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=${query}` +
        `&apiKey=${import.meta.env.VITE_NEWS_API_KEY}` +
        `&language=en` +
        `&sortBy=publishedAt` +
        `&pageSize=12`
      );

      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedKeyword);
  }, [selectedKeyword]);

  const NewsSection = () => (
    <div className="mb-12">
      <div className="bg-purple-900/10 rounded-xl p-3 backdrop-blur-sm border border-purple-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="text-purple-400" />
            Crypto News
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="text-purple-400" />
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className="bg-black/20 border border-purple-500/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            >
              {newsKeywords.map(keyword => (
                <option key={keyword} value={keyword}>
                  {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {newsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
            <div className="grid grid-cols-1 gap-4">
              {articles.map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-black/20 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all flex gap-4"
                >
                  {article.urlToImage && (
                    <div className="w-32 h-24 flex-shrink-0">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors text-sm">
                        {article.title}
                      </h3>
                      <div className="text-xs text-purple-400 whitespace-nowrap">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{article.source.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (user) { // Check if user is not null
        const { data, error } = await supabase
          .from('assessment_reports')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setAssessmentCompleted(true);
        }
      }
    };

    checkAssessmentStatus();
  }, [user]);

  useEffect(() => {
    if (!assessmentCompleted) {
      // Show welcome and tour guide if assessment is not completed
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
      if (!hasSeenTour) {
        setShowTourGuide(true);
      }
    } else {
      // Reset states when user has completed the assessment
      setShowWelcome(false);
      setShowTourGuide(false);
    }
  }, [assessmentCompleted, hasSeenWelcome, hasSeenTour]);

  const handleAssessmentComplete = (results: Record<string, number>) => {
    setAssessmentResults(results);
    setShowAssessment(false);
    setShowReport(true);
  };

  const handleReportComplete = () => {
    setShowReport(false);
  };

  const handleCreateTeam = (teamData: Team) => {
    setCurrentTeam(teamData);
    setShowTeamCreation(false);
    setShowTeamDashboard(true);
    setShowTeamMenu(false);
  };

  const handleJoinTeam = (data: {
    teamCode: string;
    name: string;
    email: string;
  }) => {
    const simulatedTeam: Team = {
      teamName: 'Trading Team',
      teamCode: data.teamCode,
      members: [{ name: data.name, email: data.email, role: 'Trader' }],
    };
    setCurrentTeam(simulatedTeam);
    setShowJoinTeam(false);
    setShowTeamDashboard(true);
    setShowTeamMenu(false);
  };

  const handleAIChatClick = () => {
    if (user) {
      setShowAIChat(true);
    } else {
      setAuthRedirectAction('ai-chat');
      setShowAuthModal(true);
    }
  };

  const handleTeamMenuClick = () => {
    if (user) {
      setShowTeamMenu(!showTeamMenu);
    } else {
      setAuthRedirectAction('trading');
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (authRedirectAction === 'ai-chat') {
      setShowAIChat(true);
    } else if (authRedirectAction === 'trading') {
      setShowTeamMenu(true);
    }
    setAuthRedirectAction(null);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setShowAssessment(true);
    localStorage.setItem('welcomePopupSeen', 'true');
  };

  const handleTourGuideComplete = () => {
    setShowTourGuide(false);
    localStorage.setItem('tourGuideSeen', 'true');
  };

  if (showAIChat) {
    return <AIChat onBack={() => setShowAIChat(false)} />;
  }

  return (
    <TeamProvider>
      <div className="bg-black min-h-screen text-white">
        {user && !loading && showTourGuide && (
          <TourGuide onComplete={handleTourGuideComplete} />
        )}

        {user && !loading && showWelcome && (
          <WelcomePopup onClose={handleWelcomeClose} />
        )}

        {user && showAssessment && (
          <Assessment userId={user.id} onComplete={handleAssessmentComplete} />
        )}
        {user && showReport && (
          <AssessmentReport
            results={assessmentResults}
            onComplete={handleReportComplete}
          />
        )}
        {showTeamCreation && (
          <TeamCreationModal
            onClose={() => setShowTeamCreation(false)}
            onCreateTeam={handleCreateTeam}
          />
        )}
        {showJoinTeam && (
          <JoinTeamModal
            onClose={() => setShowJoinTeam(false)}
            onJoinTeam={handleJoinTeam}
          />
        )}
        {showTeamDashboard && currentTeam && (
          <TeamDashboard
            team={currentTeam}
            onClose={() => setShowTeamDashboard(false)}
          />
        )}

        <header className="sticky top-0 z-40 backdrop-blur-lg bg-black/50 border-b border-purple-900/20">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-purple-500" />
                <span className="font-bold text-xl">ज्ञानDCX</span>
              </div>
              <div className="flex items-center gap-6">
                {!newsLoading && (
                  <>
                    {user ? (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 px-4 py-2 rounded-lg transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                        <button
                          onClick={() => navigate('/profile')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium border-2 border-purple-400 hover:border-purple-300 transition-colors">
                            {user.email ? user.email[0].toUpperCase() : 'U'}
                          </div>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <LogIn size={18} />
                        <span>Login</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </nav>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div
            className="mb-12 overflow-hidden bg-purple-900/10 rounded-xl backdrop-blur-sm border border-purple-500/20"
            data-tour="crypto-ticker"
          >
            <CryptoTicker />
          </div>

          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Master Crypto Futures with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                {' '}
                ज्ञानDCX
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Advanced analytics and AI-powered insights for professional traders
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={handleAIChatClick}
                data-tour="ai-chat"
                className="group bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] relative overflow-hidden"
              >
                <span className="relative z-10">Learn with ज्ञान-AI</span>
                <Brain className="group-hover:rotate-12 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <div className="relative">
                <button
                  onClick={handleTeamMenuClick}
                  className="group bg-amber-600 hover:bg-amber-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] relative overflow-hidden"
                >
                  <span className="relative z-10">Start Trading Now</span>
                  <Rocket className="group-hover:rotate-12 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                {showTeamMenu && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <div className="bg-black/90 rounded-lg shadow-lg border border-amber-500/20 overflow-hidden">
                      <button
                        onClick={() => {
                          setShowTeamCreation(true);
                          setShowTeamMenu(false);
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <Users size={16} />
                        Create Team
                      </button>
                      <button
                        onClick={() => {
                          setShowJoinTeam(true);
                          setShowTeamMenu(false);
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <Rocket size={16} />
                        Join Team
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            <div
              className="bg-purple-900/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all"
              data-tour="live-chart"
            >
              <h2 className="text-2xl font-bold mb-4">BTC/USD Live Chart</h2>
              <div className="h-[600px]">
                <LiveChart symbol="BTCUSDT" />
              </div>
            </div>
            <div data-tour="market-overview">
              <MarketOverview />
              <TradingVolume />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-3">
              <div className="grid gap-6">
                <div className="bg-purple-900/10 rounded-xl p-4 backdrop-blur-sm border border-purple-500/20">
                  <h2 className="text-xl font-bold mb-3">Market Sentiment</h2>
                  <MarketSentiment />
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </TeamProvider>
  );
}
