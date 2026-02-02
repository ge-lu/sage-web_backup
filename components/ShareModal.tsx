
import React, { useState } from 'react';
import { X, Facebook, MessageCircle, MessageSquare, Check, Send, Twitter, Music } from 'lucide-react';
import { Post } from '../types';

interface ShareModalProps {
  post: Post;
  message: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, message, onClose }) => {
  const [step, setStep] = useState<'select' | 'sending' | 'success'>('select');
  const [destination, setDestination] = useState<string>('');

  const handleShare = (dest: string) => {
    // Tactile feedback for elderly users
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setDestination(dest);
    setStep('sending');
    setTimeout(() => {
      setStep('success');
    }, 1800);
  };

  // Determine if this is a "Fixed Memory" share based on common message patterns
  const isPhotoFix = message?.includes("memory is alive") || post.title.toLowerCase().includes("fix");

  return (
    <div className="fixed inset-0 z-[500] bg-[#F5F7F9] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-300">
      {step === 'select' && (
        <>
          <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-transform -ml-2"
              >
                <X size={28} className="text-gray-900" strokeWidth={3} />
              </button>
              <h2 className="text-gray-900 font-heading text-2xl font-bold tracking-tight whitespace-nowrap">SHARE THE JOY</h2>
            </div>
            <div className="w-12" />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-10 space-y-4">
            {/* Horizontal Preview Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                <img
                  src={post.imageUrl}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <span className="text-gray-500 font-bold font-heading uppercase tracking-wider text-xs mb-1">PREVIEW</span>
                <p className="text-lg font-bold font-heading text-guardian-blue italic leading-snug line-clamp-2">
                  "{message || post.title}"
                </p>
              </div>
            </div>

            {/* Destination Buttons */}
            <div>
              <p className="text-center text-gray-400 font-bold font-heading uppercase tracking-widest text-xs mb-4">CHOOSE WHERE TO SEND:</p>
              <div className="space-y-3">

                {/* 1. iMessage */}
                <button
                  onClick={() => handleShare('iMessage')}
                  className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <MessageSquare size={18} fill="white" className="text-white" />
                  </div>
                  <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">iMessage</span>
                </button>

                {/* 2. Facebook */}
                <button
                  onClick={() => handleShare('Facebook')}
                  className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <Facebook size={18} fill="white" className="text-white" />
                  </div>
                  <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">Facebook</span>
                </button>

                {/* 3. WhatsApp */}
                <button
                  onClick={() => handleShare('WhatsApp')}
                  className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <MessageCircle size={18} fill="white" className="text-white" />
                  </div>
                  <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">WhatsApp</span>
                </button>

                {/* 4. Twitter */}
                <button
                  onClick={() => handleShare('Twitter')}
                  className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <Twitter size={18} fill="white" className="text-white" />
                  </div>
                  <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">Twitter</span>
                </button>

                {/* 5. TikTok */}
                <button
                  onClick={() => handleShare('TikTok')}
                  className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <Music size={18} fill="white" className="text-white" />
                  </div>
                  <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">TikTok</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'sending' && (
        <div className="flex-1 bg-guardian-blue flex flex-col items-center justify-center p-10">
          <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-12 relative">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-4xl font-black font-heading text-white text-center">Sending to {destination}...</h2>
        </div>
      )}

      {step === 'success' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 z-[800] text-center animate-in zoom-in-95 duration-500">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
            <Check size={96} strokeWidth={5} className="text-guardian-blue" />
          </div>
          <h2 className="text-4xl font-bold font-heading text-guardian-blue mb-4 uppercase tracking-tight">Good News!</h2>
          <p className="text-xl text-gray-500 font-medium mb-12 px-6 leading-relaxed max-w-md">
            Your family will love this! ❤️
          </p>

          <button
            onClick={onClose}
            className="w-full max-w-sm h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
          >
             Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareModal;
