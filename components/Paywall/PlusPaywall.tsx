import React, { useState, useEffect } from 'react';
import { Shield, Lock, ShieldCheck, X } from 'lucide-react';
import { PlanType, PlanConfig, FAQItem } from './types';
import { BenefitItem } from './BenefitItem';
import { PlanCard } from './PlanCard';
import { FAQSection } from './FAQSection';

// --- Configuration Data ---
const PLANS: Record<PlanType, PlanConfig> = {
  yearly: {
    id: 'yearly',
    title: 'Yearly',
    currency: '$',
    amount: '199',
    subDescription: 'Save $40.88',
    marketingTag: 'SAVE $40.88',
    footerText: '$16.58 / mo',
    isBestValue: true,
  },
  monthly: {
    id: 'monthly',
    title: 'Monthly',
    currency: '$',
    amount: '19.99',
    subDescription: 'Flexible',
    footerText: '/ mo',
    isBestValue: false,
  }
};

const BENEFITS = [
  "360 hours real-time voice chat",
  "Family App (Care Dashboard)",
  "5x Daily Bill/Mail Analysis",
  "Scam Block + Emergency Alerts",
  "Long-term Memory (AI preferences)",
  "300 Photo Restorations / mo"
];

const FAQS: FAQItem[] = [
  { question: "Can I cancel anytime?", answer: "Yes, you can cancel anytime during your trial or subscription via 'Subscription Management' in settings. No hidden fees." },
  { question: "How does the 7-day trial work?", answer: "You get full access to all Aura Plus features for the first 7 days. If you cancel before the trial ends, you won't be charged." },
  { question: "Can I get a refund?", answer: "We follow standard app store refund policies. If you have issues after purchase, please contact our support team." }
];

interface PlusPaywallProps {
    onClose: () => void;
}

const PlusPaywall: React.FC<PlusPaywallProps> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    const productId = selectedPlan === 'yearly' ? 'com.aura.app.plus.yearly' : 'com.aura.app.plus.monthly';
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    alert(`Subscription initiated for: ${productId}`);
    onClose();
  };

  const handleRestore = () => {
    alert("Restore purchases requested");
  };

  const handleBasic = () => {
    console.log("User chose to downgrade to Basic");
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] min-h-screen bg-gray-50 flex flex-col font-sans transition-opacity duration-500 overflow-y-auto ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Navbar / Close Area */}
      {/* pt-safe and sticky ensures it respects notches and stays accessible */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 pt-[env(safe-area-inset-top)] px-4">
        <div className="h-14 flex items-center justify-between">
          <button 
            onClick={handleRestore}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 px-2 py-1"
          >
            Restore
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Close paywall"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 pb-[env(safe-area-inset-bottom)]">
        
        {/* Header & Value Prop */}
        <div className="pt-4 pb-6 flex flex-col items-center justify-center text-center bg-white border-b border-gray-100 px-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md mb-4 ring-4 ring-indigo-50">
            <Shield className="text-white w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            Unlock Aura <span className="text-indigo-600">Plus</span>
          </h1>
          <div className="space-y-1">
            <p className="text-gray-900 text-lg font-bold">Best protection for your family</p>
            <p className="text-gray-500 text-base">24/7 smart companionship & safety.</p>
          </div>
        </div>

        <div className="px-5 py-6 space-y-8">
          
          {/* Benefits List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Member Benefits</h2>
            </div>
            <div className="bg-white rounded-2xl p-1 border border-transparent"> 
              {/* Optional: Add background white here if gray background is used for page */}
              {BENEFITS.map((benefit, index) => (
                <BenefitItem key={index} text={benefit} />
              ))}
            </div>
          </div>
          
          {/* Plan Selection */}
          <div 
            role="radiogroup" 
            aria-label="Subscription plans" 
            className="space-y-4"
          >
            <PlanCard 
              plan={PLANS.yearly} 
              isSelected={selectedPlan === 'yearly'} 
              onSelect={setSelectedPlan} 
            />
            <PlanCard 
              plan={PLANS.monthly} 
              isSelected={selectedPlan === 'monthly'} 
              onSelect={setSelectedPlan} 
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-2">
            <button 
              onClick={handleSubscribe}
              disabled={isProcessing}
              aria-label={`Subscribe to ${selectedPlan} plan`}
              className={`w-full bg-indigo-600 text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-offset-2 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                selectedPlan === 'yearly' ? 'Start 7-Day Free Trial' : 'Subscribe Now'
              )}
            </button>
            
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-500 font-medium">
                Recurring billing. Cancel anytime.
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <button className="hover:text-gray-600 underline">Terms</button>
                <button className="hover:text-gray-600 underline">Privacy</button>
              </div>
            </div>

            <button 
              onClick={handleBasic}
              className="w-full py-4 text-base font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              No thanks, keep using Basic Plan
            </button>
          </div>
          
          <FAQSection items={FAQS} />

          {/* Trust Footer */}
          <div className="flex flex-col items-center justify-center gap-3 pb-8 pt-4 opacity-75">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-semibold tracking-wide">AES-256</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-semibold tracking-wide">Secure Privacy</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlusPaywall;
