import React, { useState } from 'react';
import { Phone, Lock, Info, X, Chrome, Apple, ChevronRight, Fingerprint } from 'lucide-react';
import { AppMode } from '../types';
import { login } from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onNavigate: (mode: AppMode) => void;
  loginMessage?: string;
  onClose?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigate, loginMessage, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('15738805764');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!phoneNumber || !password) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await login({ phone: phoneNumber, password });
      
      // Update global auth state (Store handles localStorage)
      loginAction(response);

      onLoginSuccess();
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    <div className="w-full h-full bg-[#F5F7F9] px-6 pt-12 pb-safe-offset overflow-y-auto flex flex-col relative font-sans">
      
      {/* Close Button */}
      {onClose && (
        <div className="absolute top-4 right-4 z-20">
             <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-white hover:bg-gray-100 active:scale-95 transition-all text-gray-500 shadow-sm border border-gray-100"
             >
                 <X className="w-6 h-6" />
             </button>
        </div>
      )}

      {/* Optional Reason Banner */}
      {loginMessage && (
          <div className="absolute top-0 left-0 right-0 bg-blue-50 p-4 pr-16 border-b border-blue-100 flex items-start gap-3 animate-in slide-in-from-top duration-500 z-10">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-blue-900 text-sm font-bold font-heading leading-relaxed">
                  {loginMessage}
              </p>
          </div>
      )}

      <div className={`flex-1 flex flex-col justify-center ${loginMessage ? 'mt-12' : ''}`}>
        {/* Logo / Header */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-24 h-24 bg-guardian-blue rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
                 <Fingerprint className="w-12 h-12 text-white opacity-90" strokeWidth={1.5} />
             </div>
             <h1 className="text-4xl font-bold font-heading text-gray-900 mb-3 tracking-tight">Welcome Back</h1>
             <p className="text-gray-500 text-lg font-medium">{loginMessage || "Sign in to continue"}</p>
        </div>

        {/* Error Message */}
        {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-red-900 text-sm font-medium leading-relaxed">
                    {error}
                </p>
            </div>
        )}

        {/* Inputs */}
        <div className="space-y-4 mb-8">
            <div className="relative group">
                <div className="absolute top-0 bottom-0 left-5 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-guardian-blue transition-colors" />
                </div>
                <input 
                    type="tel" 
                    placeholder="手机号码"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                />
            </div>
            
            <div className="relative group">
                <div className="absolute top-0 bottom-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-guardian-blue transition-colors" />
                </div>
                <input 
                    type="password" 
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                />
            </div>
            
            <div className="flex justify-end">
                <button 
                    onClick={() => onNavigate(AppMode.FORGOT_PASSWORD)}
                    className="text-gray-500 hover:text-guardian-blue font-bold font-heading text-sm py-2 transition-colors"
                >
                    Forgot Password?
                </button>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleLogin}
            disabled={isLoading || !phoneNumber || !password}
            className="w-full h-16 bg-guardian-blue rounded-2xl text-white font-bold font-heading text-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none mb-10 gap-2"
        >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ChevronRight className="w-5 h-5 opacity-80" strokeWidth={3} />
              </>
            )}
        </button>

        {/* Social Login */}
        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F5F7F9] text-gray-400 font-bold font-heading uppercase tracking-wider text-xs">Or continue with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => handleSocialLogin('Google')}
                className="h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
                <Chrome className="w-5 h-5 text-gray-700" />
                <span className="font-bold font-heading text-gray-700">Google</span>
            </button>
            <button 
                onClick={() => handleSocialLogin('Apple')}
                className="h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
                <Apple className="w-5 h-5 text-gray-700" />
                <span className="font-bold font-heading text-gray-700">Apple</span>
            </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6">
          <p className="text-gray-500 font-medium">
              Don't have an account?{' '}
              <button 
                  onClick={() => onNavigate(AppMode.SIGNUP)}
                  className="text-guardian-blue font-bold font-heading ml-1 text-lg hover:underline decoration-2 underline-offset-4"
              >
                  Sign Up
              </button>
          </p>
      </div>
    </div>
  );
};

export default LoginView;
