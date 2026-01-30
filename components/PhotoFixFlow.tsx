import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Sparkles, X, Loader2, Save, Share2, Facebook, MessageCircle, Wand2, ArrowRight, ArrowDown, MessageSquare, ArrowLeft, Twitter, Music, Send, Check, Clock } from 'lucide-react';

type FlowStep = 'scanning' | 'uploading' | 'submitted' | 'result' | 'sharing' | 'sending' | 'success';

const RESTORATION_MESSAGES = [
  "Uploading photo...",
  "Analyzing damage...",
  "Queueing for AI...",
];

interface PhotoFixFlowProps {
  onClose: () => void;
  onSubmitCapture: (image: string) => void;
  mode: 'capture' | 'view';
  restoredImage?: string | null;
  onReset?: () => void;
}

const PhotoFixFlow: React.FC<PhotoFixFlowProps> = ({ onClose, onSubmitCapture, mode = 'capture', restoredImage, onReset }) => {
  const [step, setStep] = useState<FlowStep>(mode === 'view' ? 'result' : 'scanning');
  const [sliderPos, setSliderPos] = useState(50);
  const [msgIndex, setMsgIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(restoredImage || null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [shareDestination, setShareDestination] = useState<string>('');
  const [actionType, setActionType] = useState<'share' | 'save'>('share');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when in scanning mode
  useEffect(() => {
    if (step === 'scanning') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setOrientation(canvas.width > canvas.height ? 'landscape' : 'portrait');
        setStep('uploading');
      }
    } else {
      // Fallback if camera failed - default to portrait
      setCapturedImage("https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop");
      setOrientation('portrait');
      setStep('uploading');
    }
  };

  const handleShare = (dest: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setActionType('share');
    setShareDestination(dest);
    setStep('sending');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setActionType('save');
    setStep('sending');
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const finishFlow = () => {
    if (onReset) onReset();
    onClose();
  };

  useEffect(() => {
    if (step === 'uploading') {
      const msgTimer = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % RESTORATION_MESSAGES.length);
      }, 1000);

      const finishTimer = setTimeout(() => {
        setStep('submitted');
      }, 3000);

      return () => { clearInterval(msgTimer); clearTimeout(finishTimer); };
    }
  }, [step]);

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!hasInteracted) setHasInteracted(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    if (orientation === 'landscape') {
      const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setSliderPos(Math.min(Math.max(y, 0), 100));
    } else {
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const x = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.min(Math.max(x, 0), 100));
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#F5F7F9] flex flex-col font-sans select-none overflow-hidden text-[#1F2937]">

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. SCANNING VIEW */}
      {step === 'scanning' && (
        <div className="flex-1 flex flex-col bg-[#F5F7F9] relative animate-in fade-in duration-500">
          <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200">
                <Wand2 className="text-guardian-blue" size={24} />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-gray-900 font-heading text-2xl font-bold tracking-tight leading-none">
                  The Memory Theater
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 bg-white hover:bg-gray-50 transition-colors rounded-full flex items-center justify-center text-gray-500 border border-gray-200 shadow-sm"
            >
              <X size={32} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-sm aspect-[3/4] relative bg-black rounded-xl overflow-hidden shadow-xl border border-gray-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute left-0 right-0 h-[2px] bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scanner z-10" />
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] pointer-events-none" />
            </div>
          </div>

          <div className="h-48 flex flex-col items-center justify-center bg-transparent pb-[env(safe-area-inset-bottom)]">
            <button
              onClick={handleCapture}
              className="w-24 h-24 rounded-full bg-white p-2 shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-transform flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full border-4 border-gray-200 flex items-center justify-center">
                <Camera size={36} className="text-gray-900" />
              </div>
            </button>
            <p className="mt-4 text-gray-500 font-bold font-heading uppercase text-sm tracking-[0.3em]">Capture & Fix Memory</p>
          </div>
        </div>
      )}

      {/* 2. UPLOADING VIEW */}
      {step === 'uploading' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 overflow-hidden">
          <div className="relative w-64 h-64 mb-12">
            <div className="absolute inset-0 border-8 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-8 border-guardian-blue border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={48} className="text-guardian-blue" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading text-gray-900 font-bold">Just a moment...</h2>
            <div className="h-10">
              <p className="text-xl font-heading text-guardian-blue font-medium italic transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                {RESTORATION_MESSAGES[msgIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2b. SUBMITTED VIEW (NEW) */}
      {step === 'submitted' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 z-[500] text-center">
          <div className="w-40 h-40 bg-blue-50 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
            <Clock size={80} className="text-guardian-blue" />
          </div>

          <h2 className="text-4xl font-bold font-heading text-guardian-blue mb-6 leading-tight uppercase">We're working<br />on it!</h2>

          <p className="text-xl text-gray-500 font-medium mb-4 leading-relaxed">
            Restoring memories takes a little time. This usually takes about <b className="text-guardian-blue">5 minutes</b>.
          </p>

          <p className="text-lg text-gray-400 font-medium mb-12">
            You can go back to using the app. We'll let you know when it's ready!
          </p>

          <button
            onClick={() => onSubmitCapture(capturedImage!)}
            className="w-full h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            Okay, Thanks!
          </button>
        </div>
      )}

      {/* 3. RESULT VIEW */}
      {step === 'result' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-between">
          <div className="w-full sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 text-center">
            <h2 className="text-2xl font-heading font-bold text-gray-900 tracking-tight leading-none">Incredible!</h2>
          </div>

          <div
            className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white group
              ${orientation === 'landscape' ? 'w-full aspect-[4/3] cursor-row-resize' : 'w-full max-w-sm aspect-[4/5] cursor-col-resize'}`}
            onMouseMove={handleSliderMove}
            onTouchMove={handleSliderMove}
            onMouseDown={() => setHasInteracted(true)}
            onTouchStart={() => setHasInteracted(true)}
          >
            <div className="absolute inset-0 border-[3px] border-white z-20 pointer-events-none rounded-xl" />

            {/* Restored Photo (New) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${capturedImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"})`,
                clipPath: orientation === 'landscape'
                  ? `inset(0 0 ${100 - sliderPos}% 0)` // Clips bottom, reveals top
                  : `inset(0 ${100 - sliderPos}% 0 0)` // Clips right, reveals left
              }}
            >
              <div className="absolute inset-0 animate-gentle-pulse" />
              <div className={`absolute bg-guardian-blue shadow-lg px-3 py-1.5 rounded-lg text-sm font-bold font-heading text-white uppercase tracking-widest pointer-events-none
                ${orientation === 'landscape' ? 'top-4 left-4' : 'bottom-4 left-4'}`}>
                Restored
              </div>
            </div>

            {/* Original Photo (Old) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${capturedImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"})`,
                filter: 'sepia(0.8) contrast(0.9) brightness(1.1) blur(1px) saturate(0.4)',
                clipPath: orientation === 'landscape'
                  ? `inset(${sliderPos}% 0 0 0)` // Clips top, reveals bottom
                  : `inset(0 0 0 ${sliderPos}%)` // Clips left, reveals right
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40" />
              <div className={`absolute bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold font-heading text-white uppercase tracking-widest pointer-events-none
                ${orientation === 'landscape' ? 'bottom-4 right-4' : 'bottom-4 right-4'}`}>
                Old
              </div>
            </div>

            {/* The Golden Slider Handle */}
            <div
              className={`absolute z-30 shadow-lg cursor-grab active:cursor-grabbing
                ${orientation === 'landscape'
                  ? 'left-0 right-0 h-1 bg-white/50'
                  : 'top-0 bottom-0 w-1 bg-white/50'}`}
              style={orientation === 'landscape'
                ? { top: `${sliderPos}%`, transform: 'translateY(-50%)' }
                : { left: `${sliderPos}%`, transform: 'translateX(-50%)' }
              }
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
                <div className={`flex gap-1.5 ${orientation === 'landscape' ? 'flex-col' : 'flex-row'}`}>
                  <div className={`bg-gray-300 rounded-full ${orientation === 'landscape' ? 'h-1.5 w-6' : 'w-1.5 h-6'}`} />
                  <div className={`bg-gray-300 rounded-full ${orientation === 'landscape' ? 'h-1.5 w-6' : 'w-1.5 h-6'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex gap-4 mt-8 max-w-sm px-2">
            <button
              onClick={handleSave}
              className="flex-1 h-20 bg-[#F5F9FF] text-guardian-blue border-2 border-blue-100 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Save size={28} />
              <span className="font-bold font-heading uppercase text-sm tracking-wide">Save</span>
            </button>
            <button
              onClick={() => setStep('sharing')}
              className="flex-1 h-20 bg-guardian-blue text-white rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-all"
            >
              <Share2 size={28} />
              <span className="font-bold font-heading uppercase text-sm tracking-wide">Show Friends</span>
            </button>
          </div>

          <button onClick={onClose} className="mt-4 text-gray-400 font-bold font-heading uppercase tracking-widest text-sm">Close</button>
        </div>
      )}

      {/* 4. SHARING VIEW */}
      {step === 'sharing' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col overflow-hidden animate-in fade-in duration-300">
          <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-center relative">
            <h2 className="text-2xl font-bold font-heading text-gray-900 tracking-tight leading-none">
              Share The Joy
            </h2>
            <button
              onClick={() => setStep('result')}
              className="absolute right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 active:bg-gray-50 border border-gray-200 shadow-sm"
            >
            <X size={24} strokeWidth={2.5} />
          </button>
          </div>

          <div className="px-6 pt-4 pb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0 shadow-sm flex relative border border-gray-100">
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={capturedImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"}
                    className="w-full h-full object-cover grayscale opacity-80"
                    style={{ filter: 'sepia(0.8) contrast(0.8) blur(0.5px)' }}
                  />
                  <div className="absolute bottom-1 left-1 bg-black/40 px-2 py-0.5 rounded-md text-xs text-white font-bold font-heading uppercase tracking-tighter">Old</div>
                </div>
                <div className="w-0.5 h-full bg-white z-10" />
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={capturedImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-guardian-blue px-2 py-0.5 rounded-md text-xs text-white font-bold font-heading uppercase tracking-tighter shadow-sm">New</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <span className="text-gray-400 font-bold font-heading uppercase tracking-[0.2em] text-sm mb-1 leading-none">PREVIEW</span>
                <p className="text-[1.25rem] font-bold font-heading text-guardian-blue italic leading-tight line-clamp-2 tracking-tight">
                  "My memory is alive again! ❤️"
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-400 font-bold font-heading uppercase tracking-[0.25em] text-sm">CHOOSE WHERE TO SEND:</p>
          </div>

          <div className="flex-1 px-6 pb-10 space-y-4 overflow-y-auto no-scrollbar">
            <button
              onClick={() => handleShare('IMESSAGE')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <MessageSquare size={16} className="text-[#34C759]" fill="#34C759" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">IMESSAGE</span>
            </button>

            <button
              onClick={() => handleShare('Facebook')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <Facebook size={16} className="text-[#1877F2]" fill="#1877F2" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('WhatsApp')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <MessageCircle size={16} className="text-[#075E54]" fill="#075E54" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('Twitter')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <Twitter size={16} className="text-[#1DA1F2]" fill="#1DA1F2" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('TikTok')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <Music size={16} className="text-black" fill="black" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">TikTok</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. SENDING VIEW */}
      {step === 'sending' && (
        <div className="absolute inset-0 bg-guardian-blue flex flex-col items-center justify-center p-6 z-[700] animate-in fade-in duration-500">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-5xl font-bold font-heading text-white text-center leading-tight uppercase tracking-tighter">
            {actionType === 'save' ? 'Saving to Gallery...' : `Sharing to\n${shareDestination}...`}
          </h2>
        </div>
      )}

      {/* 6. SUCCESS VIEW */}
      {step === 'success' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 z-[800] text-center animate-in zoom-in-95 duration-500">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
            <Check size={96} strokeWidth={5} className="text-guardian-blue" />
          </div>
          <h2 className="text-4xl font-bold font-heading text-guardian-blue mb-4 uppercase tracking-tight">Good News!</h2>
          <p className="text-xl text-gray-500 font-medium mb-12 px-6 leading-relaxed max-w-md">
            {actionType === 'save'
              ? "Your photo is fixed and saved!"
              : "Your photo is fixed and shared!"}
          </p>

          <button
            onClick={finishFlow}
            className="w-full max-w-sm h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            Finish
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanner {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanner {
          animation: scanner 3s infinite linear;
        }
        @keyframes gentle-pulse {
          0% { transform: scale(1); filter: saturate(1); }
          50% { transform: scale(1.02); filter: saturate(1.2); }
          100% { transform: scale(1); filter: saturate(1); }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 8s infinite ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>,
    document.body
  );
};

export default PhotoFixFlow;