import React, { useState, useEffect, useRef } from 'react';

interface TourStep {
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to OdooGit 🚀',
    description: 'A professional, high-performance Git GUI customized specifically for Odoo developers. Let’s take a quick tour to get you up to speed.',
    position: 'center',
  },
  {
    title: 'Multi-Repository Switcher 🗂️',
    description: 'Keep your workspace organized. Toggle between Odoo Community, Enterprise, and custom project repositories seamlessly in the top rail.',
    targetSelector: '.tour-repo-rail',
    position: 'bottom',
  },
  {
    title: 'Git Workbench 🛠️',
    description: 'Standard Git actions at your fingertips. View diffs, stage files, compose commits, cherry-pick, manage stashes, and push or pull changes here.',
    targetSelector: '.tour-nav-sidebar',
    position: 'right',
  },
  {
    title: 'Odoo Control Center ⚡',
    description: 'Run, upgrade, or test your Odoo instances instantly. Manage Python virtual environments, configure servers, and drop/duplicate databases with ease.',
    targetSelector: '.tour-odoo-db',
    position: 'left',
  },
  {
    title: 'Settings & Authentication ⚙️',
    description: 'Set up your developer initials (trigram), configure repository root folders, and save your GitHub credentials for smooth authentication.',
    targetSelector: '.tour-settings',
    position: 'left',
  },
  {
    title: 'You are all set! 🎉',
    description: 'You’re ready to speed up your Odoo R&D workflow. If you ever need to see this guide again, you can restart it from the Settings panel.',
    position: 'center',
  },
];

interface AppTourProps {
  onClose: () => void;
}

export function AppTour({ onClose }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  const step = TOUR_STEPS[currentStep];

  // Update spotlight bounding rect when step or window changes
  useEffect(() => {
    const updatePosition = () => {
      if (!step.targetSelector) {
        setSpotlightRect(null);
        setCardStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
        });
        return;
      }

      const target = document.querySelector(step.targetSelector);
      if (target) {
        // Scroll target into view if needed
        target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const rect = target.getBoundingClientRect();
        setSpotlightRect(rect);

        // Position the card relative to the target
        const offset = 16;
        let top = 0;
        let left = 0;
        let transform = '';

        if (step.position === 'bottom') {
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2;
          transform = 'translateX(-50%)';
        } else if (step.position === 'top') {
          top = rect.top - offset - (cardRef.current?.offsetHeight || 180);
          left = rect.left + rect.width / 2;
          transform = 'translateX(-50%)';
        } else if (step.position === 'right') {
          top = rect.top + rect.height / 2;
          left = rect.right + offset;
          transform = 'translateY(-50%)';
        } else if (step.position === 'left') {
          top = rect.top + rect.height / 2;
          left = rect.left - offset - (cardRef.current?.offsetWidth || 340);
          transform = 'translateY(-50%)';
        }

        // Screen boundary safety checks
        const cardWidth = cardRef.current?.offsetWidth || 340;
        const cardHeight = cardRef.current?.offsetHeight || 180;
        if (left < 10) left = 10;
        if (left + cardWidth > window.innerWidth - 10) {
          left = window.innerWidth - cardWidth - 10;
          transform = '';
        }
        if (top < 10) top = 10;
        if (top + cardHeight > window.innerHeight - 10) {
          top = window.innerHeight - cardHeight - 10;
          transform = '';
        }

        setCardStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          transform,
          zIndex: 10001,
        });
      } else {
        // Fallback to center if element not found
        setSpotlightRect(null);
        setCardStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
        });
      }
    };

    // Delay slightly to allow DOM switches or mounts
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('odoogit_hasSeenTour', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none select-none">
      {/* Darkened overlay with SVG mask for spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 10000 }}>
        <defs>
          <mask id="spotlight-mask">
            {/* White color draws the mask (fully opaque) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black color subtracts from mask (spotlight hole) */}
            {spotlightRect && (
              <rect
                x={spotlightRect.left - 6}
                y={spotlightRect.top - 6}
                width={spotlightRect.width + 12}
                height={spotlightRect.height + 12}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* The overlay layer itself */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(5, 5, 10, 0.75)"
          mask="url(#spotlight-mask)"
          className="transition-all duration-300"
        />
      </svg>

      {/* Pulsing Spotlight Border */}
      {spotlightRect && (
        <div
          className="fixed pointer-events-none transition-all duration-200 border-2 border-accent rounded-lg animate-pulse"
          style={{
            top: spotlightRect.top - 7,
            left: spotlightRect.left - 7,
            width: spotlightRect.width + 14,
            height: spotlightRect.height + 14,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 10px rgba(139, 92, 246, 0.3)',
            zIndex: 10001,
          }}
        />
      )}

      {/* Tour Step Card */}
      <div
        ref={cardRef}
        style={cardStyle}
        className="w-[340px] bg-[#161B22]/95 border border-border/80 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] p-5 pointer-events-auto flex flex-col gap-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Step Indicator & Skip Button */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </span>
          {currentStep < TOUR_STEPS.length - 1 && (
            <button
              onClick={handleFinish}
              className="text-[11px] text-muted hover:text-primary transition-colors font-medium cursor-pointer"
            >
              Skip Tour
            </button>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h4 className="text-[15px] font-bold text-white tracking-wide">{step.title}</h4>
          <p className="text-[12px] text-muted leading-relaxed select-text">{step.description}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 mt-1">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-4 bg-accent' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-1">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-3 py-1.5 border border-border/60 hover:bg-border/30 rounded text-[11px] text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-accent hover:bg-accent/80 text-white rounded text-[11px] font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
