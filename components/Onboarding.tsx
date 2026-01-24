import React, { useState } from 'react';
import { Icons } from '../constants';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Meet Aura",
      description: "Your voice-activated assistant. Just tap the microphone or say 'Help' to manage your daily life.",
      icon: <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-800 to-black shadow-[0_0_30px_rgba(0,227,65,0.3)] flex items-center justify-center border-4 border-white/10"><div className="w-4 h-4 rounded-full bg-[#00E341] animate-ping"></div></div>,
      color: "bg-gray-900"
    },
    {
      title: "Guardian Shield",
      description: "Aura actively monitors for scam calls and dangerous messages to keep you safe automatically.",
      icon: <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-[pulse_2s_infinite]"><Icons.Shield className="w-12 h-12" /></div>,
      color: "bg-white"
    },
    {
      title: "Omnibus Vision",
      description: "Use the camera to read bills, identify medication, or analyze prices instantly.",
      icon: <div className="w-24 h-24 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]"><Icons.Camera className="w-12 h-12" /></div>,
      color: "bg-white"
    },
    {
      title: "My Plan",
      description: "Track orders, view history, and manage health reminders all in one simple timeline.",
      icon: <div className="w-24 h-24 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]"><Icons.History className="w-12 h-12" /></div>,
      color: "bg-white"
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
    <div className={`fixed inset-0 z-[60] flex flex-col ${step.color} transition-colors duration-500`}>
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={onComplete}
          className="text-sm font-bold text-gray-400 hover:text-gray-600 px-4 py-2"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
        <div className="mb-10 scale-110 transition-transform duration-500">
            {step.icon}
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 ${step.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>
          {step.title}
        </h2>
        
        <p className={`text-lg leading-relaxed max-w-xs ${step.color === 'bg-gray-900' ? 'text-gray-400' : 'text-gray-500'}`}>
          {step.description}
        </p>
      </div>

      {/* Footer / Controls */}
      <div className="p-8 w-full flex flex-col items-center gap-6">
        {/* Indicators */}
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-[#00E341]' : 'w-2 bg-gray-300'}`}
            ></div>
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full h-14 bg-[#00E341] rounded-2xl text-black font-bold text-lg shadow-[0_4px_20px_rgba(0,227,65,0.3)] active:scale-95 transition-transform flex items-center justify-center"
        >
          {currentStep === steps.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;