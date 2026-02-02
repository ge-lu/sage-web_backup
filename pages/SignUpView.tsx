import React, { useState } from 'react';
import { User, Mail, Lock, ChevronLeft, Chrome, Apple, ArrowRight } from 'lucide-react';
import { AppMode } from '../types';
import { register } from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';

interface SignUpViewProps {
  onLoginSuccess: () => void;
  onNavigate: (mode: AppMode) => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onLoginSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginAction = useAuthStore((state) => state.login);

  const handleSignUp = async () => {
    if (!name || !identifier || !password) return;
    setIsLoading(true);
    
    try {
        // Assume identifier is email for now, or handle phone registration logic if needed
        const response = await register({ name, email: identifier, password });
        
        loginAction(response);
        onLoginSuccess();
    } catch (error) {
        console.error("Registration failed", error);
        // Fallback for demo if API fails or if using phone number that is not email
        alert("Registration endpoint expects email. For demo, we are mocking success.");
        
        // Mock success for demo continuity if API fails (e.g. invalid email format)
        // In real app, show error message
        onLoginSuccess(); 
    } finally {
        setIsLoading(false);
    }
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
        <h1 className="text-4xl font-bold font-heading text-gray-900 mb-3 tracking-tight">Create Account</h1>
        <p className="text-gray-500 text-lg font-medium mb-10">Join Aura to protect and assist.</p>

        {/* Inputs */}
        <div className="space-y-4 mb-10">
            <div className="relative group">
                <div className="absolute top-0 bottom-0 left-5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-guardian-blue transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                />
            </div>

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
            
            <div className="relative group">
                <div className="absolute top-0 bottom-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-guardian-blue transition-colors" />
                </div>
                <input 
                    type="password" 
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleSignUp}
            disabled={isLoading || !name || !identifier || !password}
            className="w-full h-16 bg-guardian-blue rounded-2xl text-white font-bold font-heading text-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none mb-8 gap-2"
        >
            {isLoading ? 'Creating Account...' : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-5 h-5 opacity-80" strokeWidth={3} />
              </>
            )}
        </button>

         {/* Social Login */}
        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F5F7F9] text-gray-400 font-bold font-heading uppercase tracking-wider text-xs">Or sign up with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => onLoginSuccess()} 
                className="h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
                <Chrome className="w-5 h-5 text-gray-700" />
                <span className="font-bold font-heading text-gray-700">Google</span>
            </button>
            <button 
                onClick={() => onLoginSuccess()}
                className="h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
                <Apple className="w-5 h-5 text-gray-700" />
                <span className="font-bold font-heading text-gray-700">Apple</span>
            </button>
        </div>

        <div className="text-center mt-auto pb-6">
          <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <button 
                  onClick={() => onNavigate(AppMode.LOGIN)}
                  className="text-guardian-blue font-bold font-heading ml-1 text-lg hover:underline decoration-2 underline-offset-4"
              >
                  Sign In
              </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpView;
