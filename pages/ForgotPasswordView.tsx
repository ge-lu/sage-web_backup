import React, { useState } from 'react';
import { Mail, ChevronLeft, Check, ArrowRight } from 'lucide-react';
import { AppMode } from '../types';

interface ForgotPasswordViewProps {
  onNavigate: (mode: AppMode) => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = () => {
    if (!identifier) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        setIsSent(true);
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#F5F7F9] px-6 pt-8 pb-safe-offset overflow-y-auto flex flex-col font-sans">
       <div className="flex-none mb-6">
        <button 
            onClick={() => onNavigate(AppMode.LOGIN)}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shadow-sm -ml-2"
        >
            <ChevronLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-4">Forgot Password?</h1>
        
        {!isSent ? (
            <>
                <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">
                    Enter your email or phone number. We will send you a code to reset your password.
                </p>

                <div className="space-y-4 mb-10">
                    <div className="relative group">
                        <div className="absolute top-0 bottom-0 left-5 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-guardian-blue transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Email or Phone Number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSendReset}
                    disabled={isLoading || !identifier}
                    className="w-full h-16 bg-guardian-blue text-white rounded-2xl font-bold font-heading text-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 disabled:shadow-none gap-2"
                >
                    {isLoading ? 'Sending...' : (
                        <>
                            <span>Send Reset Code</span>
                            <ArrowRight className="w-5 h-5 opacity-80" strokeWidth={3} />
                        </>
                    )}
                </button>
            </>
        ) : (
            <div className="text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-md border border-gray-100">
                    <Check className="w-12 h-12 text-guardian-blue" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">
                    We sent a reset link to <br/>
                    <span className="font-bold text-gray-900 font-heading">{identifier}</span>
                </p>
                <button 
                    onClick={() => onNavigate(AppMode.LOGIN)}
                    className="w-full h-16 bg-guardian-blue text-white rounded-2xl font-bold font-heading text-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center"
                >
                    Back to Login
                </button>
                <button 
                    onClick={() => setIsSent(false)}
                    className="mt-8 text-gray-500 font-bold font-heading hover:text-guardian-blue transition-colors"
                >
                    Try another email
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordView;
