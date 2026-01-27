
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
    <div className="fixed inset-0 z-[500] bg-[#FDFBF7] flex flex-col font-['Plus_Jakarta_Sans'] select-none overflow-hidden animate-in fade-in duration-300">

      {step === 'select' && (
        <div className="flex flex-col h-full relative">
          {/* Top-Right Close Button - Compact */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 active:bg-gray-200 z-[600] shadow-sm transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>

          {/* Section 1: Top 30% - Horizontal Preview Layout */}
          <div className="h-[32%] flex flex-col justify-center pb-2 pt-8">
            {/* Header */}
            <div className="pb-4 text-center">
              <h2 className="text-[2.25rem] font-black text-[#000000] uppercase tracking-tighter leading-none">
                SHARE THE JOY
              </h2>
            </div>

            {/* Horizontal Preview Card with Optional Comparison */}
            <div className="px-6">
              <div className="bg-white rounded-[2.5rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-5">

                {isPhotoFix ? (
                  /* Comparison View for Fixed Photos */
                  <div className="w-40 h-24 rounded-[1.5rem] overflow-hidden bg-gray-50 shrink-0 shadow-md flex relative border-2 border-gray-50">
                    <div className="flex-1 relative overflow-hidden">
                      <img src={post.imageUrl} className="w-full h-full object-cover grayscale" style={{ filter: 'sepia(0.8) contrast(0.8)' }} />
                      <div className="absolute bottom-1 left-1 bg-black/40 px-2 py-0.5 rounded-md text-[6px] text-white font-black uppercase tracking-tighter">Old</div>
                    </div>
                    <div className="w-0.5 h-full bg-white z-10" />
                    <div className="flex-1 relative overflow-hidden">
                      <img src={post.imageUrl} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-[#13EC13] px-2 py-0.5 rounded-md text-[6px] text-white font-black uppercase tracking-tighter shadow-sm">New</div>
                    </div>
                  </div>
                ) : (
                  /* Normal View */
                  <div className="w-24 h-24 rounded-[1.75rem] overflow-hidden bg-gray-50 shrink-0 shadow-md">
                    <img
                      src={post.imageUrl}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <span className="text-[#9CA3AF] font-black uppercase tracking-[0.2em] text-[10px] mb-1 leading-none">PREVIEW</span>
                  <p className="text-[1.25rem] font-black text-[#003366] italic leading-tight line-clamp-2 tracking-tight">
                    "{message || post.title}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Bottom - Sharing Buttons (Centered Layout & No White Background) */}
          <div className="flex-1 flex flex-col pt-6">
            {/* Send To Label */}
            <div className="text-center mb-4">
              <p className="text-[#CCCCCC] font-black uppercase tracking-[0.25em] text-[10px]">CHOOSE WHERE TO SEND:</p>
            </div>

            {/* Large Tactile Buttons - Centered Text & Icon */}
            <div className="px-5 space-y-3.5 flex flex-col items-stretch overflow-y-auto no-scrollbar pb-12">
              {/* 1. iMessage (Green) */}
              <button
                onClick={() => handleShare('iMessage')}
                className="w-full min-h-[76px] bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center gap-5 px-6 shadow-[0_6px_0_#128c7e] active:translate-y-1 active:shadow-none transition-all group"
              >
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                  <MessageSquare size={28} fill="white" className="text-white" />
                </div>
                <span className="text-3xl font-black uppercase tracking-tight">iMessage</span>
              </button>

              {/* 2. Facebook (Blue) */}
              <button
                onClick={() => handleShare('Facebook')}
                className="w-full min-h-[76px] bg-[#1877F2] text-white rounded-[2rem] flex items-center justify-center gap-5 px-6 shadow-[0_6px_0_#0d52a8] active:translate-y-1 active:shadow-none transition-all group"
              >
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                  <Facebook size={28} fill="white" className="text-white" />
                </div>
                <span className="text-3xl font-black uppercase tracking-tight">Facebook</span>
              </button>

              {/* 3. WhatsApp (Dark Green) */}
              <button
                onClick={() => handleShare('WhatsApp')}
                className="w-full min-h-[76px] bg-[#075E54] text-white rounded-[2rem] flex items-center justify-center gap-5 px-6 shadow-[0_6px_0_#043e37] active:translate-y-1 active:shadow-none transition-all group"
              >
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                  <MessageCircle size={28} fill="white" className="text-white" />
                </div>
                <span className="text-3xl font-black uppercase tracking-tight">WhatsApp</span>
              </button>

              {/* 4. Twitter (Sky Blue) */}
              <button
                onClick={() => handleShare('Twitter')}
                className="w-full min-h-[76px] bg-[#1DA1F2] text-white rounded-[2rem] flex items-center justify-center gap-5 px-6 shadow-[0_6px_0_#0c85d0] active:translate-y-1 active:shadow-none transition-all group"
              >
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                  <Twitter size={28} fill="white" className="text-white" />
                </div>
                <span className="text-3xl font-black uppercase tracking-tight">Twitter</span>
              </button>

              {/* 5. TikTok (Black) */}
              <button
                onClick={() => handleShare('TikTok')}
                className="w-full min-h-[76px] bg-[#000000] text-white rounded-[2rem] flex items-center justify-center gap-5 px-6 shadow-[0_6px_0_#333333] active:translate-y-1 active:shadow-none transition-all group"
              >
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                  <Music size={28} fill="white" className="text-white" />
                </div>
                <span className="text-3xl font-black uppercase tracking-tight">TikTok</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'sending' && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#003366] animate-in fade-in duration-500">
          <div className="w-44 h-44 bg-white/10 rounded-full flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 border-[6px] border-blue-400/30 border-t-white rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-4xl font-black text-white text-center leading-tight tracking-tight uppercase">
            Sharing your<br />joy...
          </h2>
        </div>
      )}

      {step === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#13EC13] text-center animate-in zoom-in-95 duration-500">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl scale-110">
            <Check size={88} strokeWidth={4} className="text-[#13EC13]" />
          </div>
          <h2 className="text-6xl font-black text-white mb-4 uppercase tracking-tighter">SENT!</h2>
          <p className="text-2xl text-white font-bold mb-16 px-6 leading-tight">Your family will love this! ❤️</p>

          <button
            onClick={onClose}
            className="w-full h-20 bg-white text-[#13EC13] rounded-[2rem] text-3xl font-black shadow-[0_10px_0_#0fbc0f] active:translate-y-2 active:shadow-none transition-all uppercase tracking-tight"
          >
            Finish
          </button>
        </div>
      )}

    </div>
  );
};

export default ShareModal;
