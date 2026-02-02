import React, { useState, useEffect, useRef } from 'react';
import { Phone, X, Info, Fingerprint, ChevronRight } from 'lucide-react';
import { AppMode } from '../types';
import { sendVerificationCode, verifyPhoneCode } from '../services/api';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../services/firebase';

interface PhoneLoginViewProps {
  onLoginSuccess: () => void;
  onNavigate: (mode: AppMode) => void;
  loginMessage?: string;
  onClose?: () => void;
}

const PhoneLoginView: React.FC<PhoneLoginViewProps> = ({ 
  onLoginSuccess, 
  onNavigate, 
  loginMessage, 
  onClose 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('15738805764');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [countdown, setCountdown] = useState(0);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  // Setup RecaptchaVerifier
  useEffect(() => {
    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setError('验证已过期，请重试');
        }
      });
    }

    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      setError('请输入有效的手机号码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!recaptchaVerifier.current) {
        throw new Error('RecaptchaVerifier not initialized');
      }

      await sendVerificationCode(phoneNumber, recaptchaVerifier.current);
      setStep('verify');
      setCountdown(60);
    } catch (err: any) {
      console.error('Send code failed:', err);
      setError(err.message || '发送验证码失败，请重试');
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyPhoneCode(verificationCode);
      
      // Store auth data in localStorage
      localStorage.setItem('aura_user_token', response.token);
      localStorage.setItem('aura_user_uid', response.user.id);
      localStorage.setItem('aura_user_email', response.user.email);
      localStorage.setItem('aura_is_authenticated', 'true');

      onLoginSuccess();
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || '验证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    setStep('phone');
    await handleSendCode();
  };

  return (
    <div className="w-full h-full bg-[#F5F7F9] px-6 pt-12 pb-safe-offset overflow-y-auto flex flex-col relative font-sans">
      
      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
      
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
          <h1 className="text-4xl font-bold font-heading text-gray-900 mb-3 tracking-tight">
            {step === 'phone' ? '手机号登录' : '验证码验证'}
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            {step === 'phone' 
              ? '输入手机号接收验证码' 
              : `验证码已发送至 ${phoneNumber}`
            }
          </p>
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

        {/* Phone Input Step */}
        {step === 'phone' && (
          <>
            <div className="space-y-4 mb-8">
              <div className="relative group">
                <div className="absolute top-0 bottom-0 left-5 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-guardian-blue transition-colors" />
                </div>
                <input 
                  type="tel" 
                  placeholder="手机号码"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                />
              </div>
            </div>

            <button 
              onClick={handleSendCode}
              disabled={isLoading || !phoneNumber || phoneNumber.length !== 11}
              className="w-full h-16 bg-guardian-blue rounded-2xl text-white font-bold font-heading text-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none mb-10 gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  发送中...
                </span>
              ) : (
                <>
                  <span>获取验证码</span>
                  <ChevronRight className="w-5 h-5 opacity-80" strokeWidth={3} />
                </>
              )}
            </button>
          </>
        )}

        {/* Verification Code Step */}
        {step === 'verify' && (
          <>
            <div className="space-y-4 mb-8">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="6位验证码"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="w-full h-16 px-4 rounded-2xl bg-white border border-gray-200 text-lg font-medium text-center tracking-widest focus:ring-2 focus:ring-blue-100 focus:border-guardian-blue outline-none text-gray-900 transition-all shadow-sm"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setStep('phone')}
                  className="text-gray-500 hover:text-guardian-blue font-bold font-heading text-sm py-2 transition-colors"
                >
                  修改手机号
                </button>
                
                <button 
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  className="text-gray-500 hover:text-guardian-blue font-bold font-heading text-sm py-2 transition-colors disabled:opacity-50"
                >
                  {countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送'}
                </button>
              </div>
            </div>

            <button 
              onClick={handleVerifyCode}
              disabled={isLoading || !verificationCode || verificationCode.length !== 6}
              className="w-full h-16 bg-guardian-blue rounded-2xl text-white font-bold font-heading text-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none mb-10 gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  验证中...
                </span>
              ) : (
                <>
                  <span>验证并登录</span>
                  <ChevronRight className="w-5 h-5 opacity-80" strokeWidth={3} />
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-6">
        <p className="text-gray-500 text-sm">
          首次登录将自动注册账号
        </p>
      </div>
    </div>
  );
};

export default PhoneLoginView;
