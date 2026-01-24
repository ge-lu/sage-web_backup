
import React, { useState } from 'react';
import { Icons } from '../constants';
import { AppMode } from '../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onNavigate: (mode: AppMode) => void;
  loginMessage?: string;
  onClose?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigate, loginMessage, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!identifier || !password) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
      // Simulate Social Login
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess();
      }, 1000);
  };

  return (
    <div className="w-full h-full bg-white px-6 pt-12 pb-safe-offset overflow-y-auto flex flex-col relative">
      
      {/* Close Button */}
      {onClose && (
        <div className="absolute top-4 right-4 z-20">
             <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-500"
             >
                 <Icons.X className="w-6 h-6" />
             </button>
        </div>
      )}

      {/* Optional Reason Banner */}
      {loginMessage && (
          <div className="absolute top-0 left-0 right-0 bg-blue-50 p-4 pr-16 border-b border-blue-100 flex items-start gap-3 animate-in slide-in-from-top duration-500 z-10">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icons.Info className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-blue-900 text-sm font-bold leading-relaxed">
                  {loginMessage}
              </p>
          </div>
      )}

      <div className={`flex-1 flex flex-col justify-center ${loginMessage ? 'mt-12' : ''}`}>
        {/* Logo / Header */}
        <div className="mb-10 text-center">
             <div className="w-20 h-20 bg-black rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl border-4 border-[#00E341]">
                 <div className="w-12 h-12 bg-[#00E341] rounded-full animate-pulse"></div>
             </div>
             <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
             <p className="text-gray-500 text-lg">{loginMessage || "Sign in to Aura AI"}</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-[#00E341] outline-none text-gray-900"
                />
            </div>
            
            <div className="flex justify-end">
                <button 
                    onClick={() => onNavigate(AppMode.FORGOT_PASSWORD)}
                    className="text-[#064E3B] font-bold text-sm py-2"
                >
                    Forgot Password?
                </button>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleLogin}
            disabled={isLoading || !identifier || !password}
            className="w-full h-16 bg-[#00E341] rounded-full text-black font-bold text-xl shadow-[0_4px_20px_rgba(0,227,65,0.3)] active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 disabled:shadow-none mb-8"
        >
            {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Social Login */}
        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => handleSocialLogin('Google')}
                className="h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
            >
                <Icons.Google className="w-6 h-6" />
                <span className="font-bold text-gray-700">Google</span>
            </button>
            <button 
                onClick={() => handleSocialLogin('Apple')}
                className="h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
            >
                <Icons.Apple className="w-6 h-6" />
                <span className="font-bold text-gray-700">Apple</span>
            </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6">
          <p className="text-gray-500 font-medium">
              Don't have an account?{' '}
              <button 
                  onClick={() => onNavigate(AppMode.SIGNUP)}
                  className="text-[#00E341] font-bold ml-1 text-lg"
              >
                  Sign Up
              </button>
          </p>
      </div>
    </div>
  );
};

export default LoginView;
