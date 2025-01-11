import React, { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

// Add JSX namespace to fix the linter errors
declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  }
}

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="crypto-ticker"]',
    title: 'Real-Time Market Data',
    content: 'Track live cryptocurrency prices and 24-hour changes at a glance',
    position: 'bottom'
  },
  {
    target: '[data-tour="live-chart"]',
    title: 'Interactive Charts',
    content: 'Analyze price movements with our advanced charting tools',
    position: 'right'
  },
  {
    target: '[data-tour="market-overview"]',
    title: 'Market Overview',
    content: 'Get a comprehensive view of market statistics and trends',
    position: 'left'
  },
  {
    target: '[data-tour="ai-chat"]',
    title: 'AI Trading Assistant',
    content: 'Learn and get instant answers to your trading questions',
    position: 'left'
  }
];

interface TourGuideProps {
  onComplete: () => void;
}

export function TourGuide({ onComplete }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
    opacity: 0,
    transform: 'translate(0, 20px)'
  });

  useEffect(() => {
    if (!isVisible) return;

    const updateTooltipPosition = () => {
      const step = tourSteps[currentStep];
      if (!step) return;

      const element = document.querySelector(step.target);
      if (!element) return;

      // Scroll the element into view smoothly
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Add a small delay to let the scroll complete before positioning the tooltip
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 280;
        const tooltipHeight = 120;
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top - tooltipHeight - 10;
            left = rect.left + (rect.width - tooltipWidth) / 2;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + (rect.width - tooltipWidth) / 2;
            break;
          case 'left':
            top = rect.top + (rect.height - tooltipHeight) / 2;
            left = rect.left - tooltipWidth - 10;
            break;
          case 'right':
            top = rect.top + (rect.height - tooltipHeight) / 2;
            left = rect.right + 10;
            break;
        }

        setTooltipStyle({
          top,
          left,
          opacity: 1,
          transform: 'translate(0, 0)'
        });

        // Highlight current element
        element.classList.add('tour-highlight');
      }, 500); // 500ms delay to allow smooth scroll to complete

      return () => element.classList.remove('tour-highlight');
    };

    updateTooltipPosition();
    
    // Debounce the resize and scroll event handlers
    let timeoutId: NodeJS.Timeout;
    const handleResizeScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateTooltipPosition, 100);
    };

    window.addEventListener('resize', handleResizeScroll);
    window.addEventListener('scroll', handleResizeScroll);

    return () => {
      window.removeEventListener('resize', handleResizeScroll);
      window.removeEventListener('scroll', handleResizeScroll);
      clearTimeout(timeoutId);
    };
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-40" />
      
      <div
        className="fixed z-50 bg-purple-900/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-purple-500/20 w-[280px] transition-all duration-300"
        style={tooltipStyle}
      >
        <button
          onClick={handleSkip}
          className="absolute -top-2 -right-2 bg-purple-800 rounded-full p-1 hover:bg-purple-700 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-purple-400" size={20} />
          <h3 className="font-semibold">{tourSteps[currentStep].title}</h3>
        </div>
        
        <p className="text-sm text-gray-300 mb-4">
          {tourSteps[currentStep].content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-purple-400' : 'bg-purple-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-lg text-sm transition-colors"
          >
            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}