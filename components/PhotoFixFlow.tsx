import React, { useState, useEffect, useRef } from 'react';
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

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a110a] flex flex-col font-['Plus_Jakarta_Sans'] select-none overflow-hidden text-[#2C2E31]">

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. SCANNING VIEW */}
      {step === 'scanning' && (
        <div className="flex-1 flex flex-col bg-[#1a110a] relative animate-in fade-in duration-500">
          <div className="px-8 pt-[calc(3rem+env(safe-area-inset-top))] pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400/20 p-2 rounded-xl backdrop-blur-md">
                <Wand2 className="text-yellow-400" size={24} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-lexend text-2xl font-black italic uppercase leading-none tracking-tight">
                  THE MEMORY
                </h2>
                <h2 className="text-white font-lexend text-2xl font-black italic uppercase leading-none tracking-tight">
                  THEATER
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 transition-colors rounded-full flex items-center justify-center text-white border border-white/20"
            >
              <X size={32} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-sm aspect-[3/4] relative">
              <div className="absolute inset-0 bg-[#2d1e14] rounded-[2.5rem] shadow-2xl border-[1px] border-white/5" />
              <div className="absolute inset-4 rounded-[2rem] overflow-hidden bg-black shadow-inner border border-white/10 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border-2 border-dashed border-white/30 rounded-2xl flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-1 bg-white/20 absolute top-10 rounded-full animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/10 to-transparent h-1/4 w-full animate-scanner pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="h-48 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={handleCapture}
              className="w-24 h-24 rounded-full bg-white p-2 shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-transform flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full border-4 border-[#1a110a] flex items-center justify-center">
                <Camera size={36} className="text-[#1a110a]" />
              </div>
            </button>
            <p className="mt-4 text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">Capture & Fix Memory</p>
          </div>
        </div>
      )}

      {/* 2. UPLOADING VIEW */}
      {step === 'uploading' && (
        <div className="absolute inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center p-10 overflow-hidden">
          <div className="relative w-64 h-64 mb-12">
            <div className="absolute inset-0 border-8 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={48} className="text-blue-600" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-3xl text-[#2C2E31] font-bold">Just a moment...</h2>
            <div className="h-10">
              <p className="text-xl text-blue-600 font-medium italic transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                {RESTORATION_MESSAGES[msgIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2b. SUBMITTED VIEW (NEW) */}
      {step === 'submitted' && (
        <div className="absolute inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center p-10 z-[500] text-center">
          <div className="w-40 h-40 bg-yellow-100 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
            <Clock size={80} className="text-yellow-600" />
          </div>

          <h2 className="text-4xl font-black text-[#003366] mb-6 leading-tight uppercase">We're working<br />on it!</h2>

          <p className="text-xl text-gray-600 font-medium mb-4 leading-relaxed">
            Restoring memories takes a little time. This usually takes about <b className="text-[#003366]">5 minutes</b>.
          </p>

          <p className="text-lg text-gray-400 font-medium mb-12">
            You can go back to using the app. We'll let you know when it's ready!
          </p>

          <button
            onClick={() => onSubmitCapture(capturedImage!)}
            className="w-full bg-[#003366] text-white py-8 rounded-[2.5rem] text-3xl font-black shadow-[0_12px_0_#001a33] active:translate-y-2 active:shadow-none transition-all uppercase"
          >
            Okay, Thanks!
          </button>
        </div>
      )}

      {/* 3. RESULT VIEW */}
      {step === 'result' && (
        <div className="absolute inset-0 bg-[#F6F6F8] flex flex-col items-center justify-between py-12 px-6 pt-[calc(3rem+env(safe-area-inset-top))]">
          <div className="text-center">
            <h2 className="text-[2.5rem] font-lexend font-black text-[#003366] uppercase mb-1 leading-none">Incredible!</h2>
          </div>

          <div
            className={`relative rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border-[12px] border-white group
              ${orientation === 'landscape' ? 'w-full aspect-[4/3] cursor-row-resize' : 'w-full max-w-sm aspect-[4/5] cursor-col-resize'}`}
            onMouseMove={handleSliderMove}
            onTouchMove={handleSliderMove}
            onMouseDown={() => setHasInteracted(true)}
            onTouchStart={() => setHasInteracted(true)}
          >
            <div className="absolute inset-0 border-[6px] border-[#D4AF37] z-20 pointer-events-none rounded-2xl" />

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
              <div className={`absolute bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest pointer-events-none
                ${orientation === 'landscape' ? 'top-4 left-4' : 'bottom-4 left-4'}`}>
                New
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
              <div className={`absolute bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest pointer-events-none
                ${orientation === 'landscape' ? 'bottom-4 right-4' : 'bottom-4 right-4'}`}>
                Old
              </div>
            </div>

            {/* The Golden Slider Handle */}
            <div
              className={`absolute z-30 shadow-[0_0_20px_rgba(212,175,55,0.8)]
                ${orientation === 'landscape'
                  ? 'left-0 right-0 h-2.5 bg-gradient-to-r from-[#F5E6AD] via-[#D4AF37] to-[#F5E6AD]'
                  : 'top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#F5E6AD] via-[#D4AF37] to-[#F5E6AD]'}`}
              style={orientation === 'landscape'
                ? { top: `${sliderPos}%`, transform: 'translateY(-50%)' }
                : { left: `${sliderPos}%`, transform: 'translateX(-50%)' }
              }
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#D4AF37] border-[6px] border-white rounded-full shadow-2xl flex items-center justify-center relative">
                {/* Grip Lines */}
                <div className={`flex gap-2 ${orientation === 'landscape' ? 'flex-col' : 'flex-row'}`}>
                  <div className={`bg-white/60 rounded-full shadow-sm ${orientation === 'landscape' ? 'h-2 w-9' : 'w-2 h-9'}`} />
                  <div className={`bg-white/60 rounded-full shadow-sm ${orientation === 'landscape' ? 'h-2 w-9' : 'w-2 h-9'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex gap-4 mt-8 max-w-sm">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#003366] text-white py-6 rounded-3xl flex flex-col items-center gap-1 shadow-[0_10px_0_#001a33] active:translate-y-1 active:shadow-none transition-all"
            >
              <Save size={32} />
              <span className="font-black uppercase text-sm">Save</span>
            </button>
            <button
              onClick={() => setStep('sharing')}
              className="flex-1 bg-[#FF8C00] text-white py-6 rounded-3xl flex flex-col items-center gap-1 shadow-[0_10px_0_#cc7000] active:translate-y-1 active:shadow-none transition-all"
            >
              <Share2 size={32} />
              <span className="font-black uppercase text-sm">Show Friends</span>
            </button>
          </div>

          <button onClick={onClose} className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Close</button>
        </div>
      )}

      {/* 4. SHARING VIEW */}
      {step === 'sharing' && (
        <div className="absolute inset-0 bg-[#FDFBF7] flex flex-col overflow-hidden animate-in fade-in duration-300">
          <button
            onClick={() => setStep('result')}
            className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-6 w-12 h-12 bg-gray-100/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 active:bg-gray-200 z-[600] shadow-sm"
          >
            <X size={28} strokeWidth={3} />
          </button>

          <div className="flex flex-col items-center mt-[calc(4rem+env(safe-area-inset-top))] mb-4 px-4 text-center">
            <h2 className="text-[2.25rem] font-black text-[#003366] font-lexend uppercase tracking-tighter leading-none whitespace-nowrap">
              SHARE THE JOY
            </h2>
          </div>

          <div className="px-6 pt-4 pb-6">
            <div className="bg-white rounded-[2.5rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-5">
              <div className="w-40 h-24 rounded-[1.5rem] overflow-hidden bg-gray-50 shrink-0 shadow-md flex relative border-2 border-gray-50">
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={capturedImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"}
                    className="w-full h-full object-cover grayscale opacity-80"
                    style={{ filter: 'sepia(0.8) contrast(0.8) blur(0.5px)' }}
                  />
                  <div className="absolute bottom-1 left-1 bg-black/40 px-2 py-0.5 rounded-md text-[6px] text-white font-black uppercase tracking-tighter">Old</div>
                </div>
                <div className="w-0.5 h-full bg-white z-10" />
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={capturedImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-[#13EC13] px-2 py-0.5 rounded-md text-[6px] text-white font-black uppercase tracking-tighter shadow-sm">New</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <span className="text-[#9CA3AF] font-black uppercase tracking-[0.2em] text-[10px] mb-1 leading-none">PREVIEW</span>
                <p className="text-[1.25rem] font-black text-[#003366] italic leading-tight line-clamp-2 tracking-tight">
                  "My memory is alive again! ❤️"
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-[#CCCCCC] font-black uppercase tracking-[0.25em] text-[10px]">CHOOSE WHERE TO SEND:</p>
          </div>

          <div className="flex-1 px-8 pb-10 space-y-4 overflow-y-auto no-scrollbar">
            <button
              onClick={() => handleShare('IMESSAGE')}
              className="w-full h-24 bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#128c7e] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <MessageSquare size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">IMESSAGE</span>
            </button>

            <button
              onClick={() => handleShare('Facebook')}
              className="w-full h-24 bg-[#1877F2] text-white rounded-[2rem] flex items-center justify-center gap-5 px-10 shadow-[0_8px_0_#0d52a8] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <Facebook size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('WhatsApp')}
              className="w-full h-24 bg-[#075E54] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#043e37] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <MessageCircle size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('Twitter')}
              className="w-full h-24 bg-[#1DA1F2] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#0c85d0] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <Twitter size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('TikTok')}
              className="w-full h-24 bg-[#000000] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#333333] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <Music size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">TikTok</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. SENDING VIEW */}
      {step === 'sending' && (
        <div className="absolute inset-0 bg-[#003366] flex flex-col items-center justify-center p-10 z-[700] animate-in fade-in duration-500">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-5xl font-black text-white text-center leading-tight uppercase tracking-tighter">
            {actionType === 'save' ? 'Saving to Gallery...' : `Sharing to\n${shareDestination}...`}
          </h2>
        </div>
      )}

      {/* 6. SUCCESS VIEW */}
      {step === 'success' && (
        <div className="absolute inset-0 bg-[#13EC13] flex flex-col items-center justify-center p-10 z-[800] text-center animate-in zoom-in-95 duration-500">
          <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl animate-in zoom-in duration-500">
            <Check size={120} strokeWidth={6} className="text-[#13EC13]" />
          </div>
          <h2 className="text-7xl font-black text-white mb-4 uppercase tracking-tighter">Done!</h2>
          <p className="text-2xl text-white font-bold mb-16 px-6 leading-tight">
            {actionType === 'save'
              ? "Your memory has been saved to your gallery!"
              : "Your beautiful memory has been shared with everyone!"}
          </p>

          <button
            onClick={finishFlow}
            className="w-full bg-white text-[#13EC13] py-8 rounded-[2.5rem] text-4xl font-black shadow-[0_12px_0_#0fbc0f] active:translate-y-2 active:shadow-none transition-all uppercase tracking-tight"
          >
            Finish
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanner {
          0% { transform: translateY(0); }
          50% { transform: translateY(400%); }
          100% { transform: translateY(0); }
        }
        .animate-scanner {
          animation: scanner 4s infinite linear;
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
    </div>
  );
};

export default PhotoFixFlow;