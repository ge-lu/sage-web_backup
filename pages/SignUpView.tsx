
import React, { useState } from 'react';
import { Icons } from '../constants';
import { AppMode } from '../types';

interface SignUpViewProps {
  onLoginSuccess: () => void;
  onNavigate: (mode: AppMode) => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onLoginSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = () => {
    if (!name || !identifier || !password) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-500 text-lg mb-8">Join Aura to protect and assist.</p>

        {/* Inputs */}
        <div className="space-y-4 mb-8">
            <div className="relative">
                <div className="absolute top-0 bottom-0 left-4 flex items-center pointer-events-none">
                    <Icons.User className="w-6 h-6 text-gray-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-[#00E341] outline-none text-gray-900"
                />
            </div>

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
            
            <div className="relative">
                <div className="absolute top-0 bottom-0 left-4 flex items-center pointer-events-none">
                    <Icons.Lock className="w-6 h-6 text-gray-400" />
                </div>
                <input 
                    type="password" 
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-[#00E341] outline-none text-gray-900"
                />
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleSignUp}
            disabled={isLoading || !name || !identifier || !password}
            className="w-full h-16 bg-[#00E341] rounded-full text-black font-bold text-xl shadow-[0_4px_20px_rgba(0,227,65,0.3)] active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 disabled:shadow-none mb-6"
        >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

         {/* Social Login */}
        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => onLoginSuccess()} 
                className="h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
            >
                <Icons.Google className="w-6 h-6" />
                <span className="font-bold text-gray-700">Google</span>
            </button>
            <button 
                onClick={() => onLoginSuccess()}
                className="h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
            >
                <Icons.Apple className="w-6 h-6" />
                <span className="font-bold text-gray-700">Apple</span>
            </button>
        </div>

        <div className="text-center mt-auto">
          <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <button 
                  onClick={() => onNavigate(AppMode.LOGIN)}
                  className="text-[#00E341] font-bold ml-1 text-lg"
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
