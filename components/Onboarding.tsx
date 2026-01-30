import { Bot, Heart, ShieldCheck, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Icons } from '../constants';
import GuardianButton from './GuardianButton';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Your Eyes & Ears",
      description: "I can help you read, listen, and answer any questions to make your daily life easier.",
      icon: <Bot className="w-20 h-20 text-guardian-blue" />,
    },
    {
      title: "Always Here For You",
      description: "A companion to chat with, listen to your stories, and keep you company anytime.",
      icon: <Heart className="w-20 h-20 text-guardian-blue" />,
    },
    {
      title: "Health & Safety",
      description: "I'll remind you to take your meds on time and block scam calls to keep you safe.",
      icon: <ShieldCheck className="w-20 h-20 text-guardian-blue" />,
    },
    {
      title: "Memories & Friends",
      description: "Restore old photos with one tap and share your favorite moments with your circle.",
      icon: <Users className="w-20 h-20 text-guardian-blue" />,
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#F5F7F9] transition-colors duration-700 font-sans">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onComplete}
          className="text-sm font-bold text-gray-400 hover:text-gray-600 px-4 py-2 font-heading"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both" key={currentStep}>

        {/* Standardized Icon Container */}
        <div className="mb-12 scale-110 transition-transform duration-500">
          <div className="w-40 h-40 bg-[#F5F9FF] rounded-full flex items-center justify-center shadow-sm border border-blue-50">
            {step.icon}
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-gray-900 font-heading">
          {step.title}
        </h2>

        <p className="text-xl leading-relaxed max-w-xs text-gray-600 font-medium font-sans">
          {step.description}
        </p>
      </div>

      {/* Footer / Controls */}
      <div className="p-8 w-full flex flex-col items-center gap-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {/* Indicators */}
        <div className="flex gap-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-10 bg-guardian-blue' : 'w-2.5 bg-gray-200'}`}
            ></div>
          ))}
        </div>

        <GuardianButton onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Get Started" : "Next"}
        </GuardianButton>
      </div>
    </div>
  );
};

export default Onboarding;