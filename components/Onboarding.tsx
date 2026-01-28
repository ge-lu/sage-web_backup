import { Bot, Ear, Eye, HandHeart, Heart, Image as ImageIcon, MessageCircle, Pill, ShieldCheck, Sparkles, Users } from 'lucide-react';
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      // Step 1: Eye/Ear/Robot - Help see, hear, answer questions
      title: "Your Eyes & Ears",
      description: "I can help you read, listen, and answer any questions to make your daily life easier.",
      icon: (
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
          <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-600 border-4 border-blue-50">
            <Bot className="w-16 h-16" />
          </div>
          <div className="absolute -right-2 top-0 bg-blue-500 text-white p-3 rounded-full shadow-lg animate-bounce delay-700">
            <Eye className="w-6 h-6" />
          </div>
          <div className="absolute -left-2 top-0 bg-indigo-500 text-white p-3 rounded-full shadow-lg animate-bounce delay-100">
            <Ear className="w-6 h-6" />
          </div>
        </div>
      ),
      bg: "bg-slate-50",
      accent: "text-blue-600"
    },
    {
      // Step 2: Companionship - Chat
      title: "Always Here For You",
      description: "A companion to chat with, listen to your stories, and keep you company anytime.",
      icon: (
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-100 rounded-full animate-pulse opacity-50"></div>
          <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center text-pink-500 border-4 border-pink-50">
            <Heart className="w-16 h-16 fill-pink-500" />
          </div>
          <div className="absolute -right-4 bottom-4 bg-white text-pink-500 p-2 rounded-xl shadow-md border border-pink-100 animate-[bounce_3s_infinite]">
            <MessageCircle className="w-8 h-8" />
          </div>
        </div>
      ),
      bg: "bg-pink-50",
      accent: "text-pink-600"
    },
    {
      // Step 3: Health & Safety - Meds & Scam
      title: "Health & Safety",
      description: "I'll remind you to take your meds on time and block scam calls to keep you safe.",
      icon: (
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse opacity-50"></div>
          <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center text-green-600 border-4 border-green-50">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <div className="absolute -left-4 bottom-6 bg-white text-emerald-600 p-3 rounded-full shadow-lg border border-green-100">
            <Pill className="w-8 h-8" />
          </div>
        </div>
      ),
      bg: "bg-green-50",
      accent: "text-emerald-700"
    },
    {
      // Step 4: Memories & Circle - Photos & Social
      title: "Memories & Friends",
      description: "Restore old photos with one tap and share your favorite moments with your circle.",
      icon: (
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-pulse opacity-50"></div>
          <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center text-purple-600 border-4 border-purple-50">
            <Users className="w-16 h-16" />
          </div>

          <div className="absolute -right-2 top-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-2 rounded-lg shadow-lg rotate-12">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 top-0 text-yellow-400 animate-spin-slow">
            <Sparkles className="w-8 h-8 fill-yellow-400" />
          </div>
        </div>
      ),
      bg: "bg-purple-50",
      accent: "text-purple-700"
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
    <div className={`fixed inset-0 z-[60] flex flex-col ${step.bg} transition-colors duration-700`}>
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both" key={currentStep}>

        {/* Dynamic Icon Composition */}
        <div className="mb-12 scale-110 transition-transform duration-500">
          {step.icon}
        </div>

        <h2 className={`text-3xl font-bold mb-6 ${step.accent}`}>
          {step.title}
        </h2>

        <p className="text-xl leading-relaxed max-w-xs text-gray-600 font-medium">
          {step.description}
        </p>
      </div>

      {/* Footer / Controls */}
      <div className="p-8 w-full  flex flex-col items-center gap-8">
        {/* Indicators */}
        <div className="flex gap-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-500 ${idx === currentStep ? `w-10 ${step.accent.replace('text-', 'bg-')}` : 'w-2.5 bg-gray-300'}`}
            ></div>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full h-16 bg-[#00E341] rounded-2xl text-black font-bold text-xl shadow-[0_8px_30px_rgba(0,227,65,0.3)] active:scale-95 transition-transform flex items-center justify-center relative overflow-hidden group"
        >
          <span className="relative z-10">{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;