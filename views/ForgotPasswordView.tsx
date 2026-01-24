
import React, { useState } from 'react';
import { Icons } from '../constants';
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
    <div className="w-full h-full bg-white px-6 pt-8 pb-safe-offset overflow-y-auto flex flex-col">
       <div className="flex-none mb-6">
        <button 
            onClick={() => onNavigate(AppMode.LOGIN)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
        >
            <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Forgot Password?</h1>
        
        {!isSent ? (
            <>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                    Enter your email or phone number. We will send you a code to reset your password.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="relative">
                        <div className="absolute top-0 bottom-0 left-4 flex items-center pointer-events-none">
                            <Icons.Mail className="w-6 h-6 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Email or Phone Number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full h-16 pl-14 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-[#00E341] outline-none text-gray-900"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSendReset}
                    disabled={isLoading || !identifier}
                    className="w-full h-16 bg-black text-white rounded-full font-bold text-xl shadow-xl active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 disabled:shadow-none"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
            </>
        ) : (
            <div className="text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <Icons.Check className="w-12 h-12 text-[#00E341]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-gray-500 text-lg mb-8">
                    We sent a reset link to <br/>
                    <span className="font-bold text-gray-900">{identifier}</span>
                </p>
                <button 
                    onClick={() => onNavigate(AppMode.LOGIN)}
                    className="w-full h-16 bg-[#00E341] text-black rounded-full font-bold text-xl shadow-[0_4px_20px_rgba(0,227,65,0.3)] active:scale-95 transition-transform flex items-center justify-center"
                >
                    Back to Login
                </button>
                <button 
                    onClick={() => setIsSent(false)}
                    className="mt-6 text-gray-500 font-bold"
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
