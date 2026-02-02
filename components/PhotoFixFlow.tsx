import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Sparkles, X, Save, Share2, MessageCircle, Wand2, ArrowLeft, Twitter, Send, Check, Clock, Instagram, MoreHorizontal, Users, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../services/storage';
import { deleteRestoration, PhotoRestoration, restorePhoto } from '@/services/phoneApi';

type FlowStep = 'scanning' | 'uploading' | 'submitted' | 'result' | 'sharing' | 'select-contacts' | 'sending' | 'success';

const RESTORATION_MESSAGES = [
  "Uploading photo...",
  "Analyzing damage...",
  "Queueing for AI...",
];

const MOCK_CONTACTS = [
  { name: 'Alex', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60' },
  { name: 'Sarah', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' },
  { name: 'Jordan', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' },
  { name: 'Mike', img: 'https://images.unsplash.com/photo-1542596594-649edbc13630?w=100&auto=format&fit=crop&q=60' },
  { name: 'Family', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=100&auto=format&fit=crop&q=60', group: true },
  { name: 'Work', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60', group: true },
  { name: 'Design', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&auto=format&fit=crop&q=60', group: true },
  { name: 'Grandma', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' },
  { name: 'Book Club', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&auto=format&fit=crop&q=60', group: true },
  { name: 'David', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60' },
  { name: 'Emma', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' },
  { name: 'High School', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&auto=format&fit=crop&q=60', group: true },
  { name: 'Chris', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60' },
  { name: 'Lisa', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&auto=format&fit=crop&q=60' },
  { name: 'Tom', img: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&auto=format&fit=crop&q=60' },
];

interface PhotoFixFlowProps {
  onClose: () => void;
  onSubmitCapture: (restoredImage: PhotoRestoration) => void;
  mode: 'capture' | 'view';
  restoredImage?: PhotoRestoration;
  onReset?: () => void;
}

const PhotoFixFlow: React.FC<PhotoFixFlowProps> = ({ onClose, onSubmitCapture, mode = 'capture', restoredImage, onReset }) => {
  const [step, setStep] = useState<FlowStep>(mode === 'view' ? 'result' : 'scanning');
  const [sliderPos, setSliderPos] = useState(50);
  const [msgIndex, setMsgIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<PhotoRestoration>(restoredImage || null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [shareDestination, setShareDestination] = useState<string>('');
  const [actionType, setActionType] = useState<'share' | 'save'>('share');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStep('uploading');
      try {
        const url = await uploadImage(file);
        console.log("Upload successful", url);
        const _restoredImage = await restorePhoto(url);
        setCapturedImage(_restoredImage);
        
        // Determine orientation
        const img = new Image();
        img.onload = () => {
          setOrientation(img.width > img.height ? 'landscape' : 'portrait');
          setStep('submitted');
        };
        img.src = url;
      } catch (error) {
        console.error("Upload failed", error);
        setStep('scanning');
      }
    }
  };

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

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setOrientation(canvas.width > canvas.height ? 'landscape' : 'portrait');
        setStep('uploading');
        try {
          const url = await uploadImage(dataUrl);
          // 调用修复老照片接口
          const _restoredImage = await restorePhoto(url);
          setCapturedImage(_restoredImage);
          setStep('submitted');
        } catch (error) {
          console.error("Upload failed", error);
          setStep('scanning');
        }
      }
    } else {
      // Fallback if camera failed - default to portrait
      setCapturedImage(null);
      setOrientation('portrait');
      setStep('scanning');
    }
  };

  const toggleRecipient = (name: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSelectedRecipients(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const handleMultiSend = () => {
    if (selectedRecipients.length === 0) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setActionType('share');
    setShareDestination(selectedRecipients.length > 1 
      ? `${selectedRecipients.length} Recipients` 
      : selectedRecipients[0]);
    setStep('sending');
    setTimeout(() => {
      setStep('success');
      setSelectedRecipients([]);
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

      return () => { clearInterval(msgTimer); };
    }
  }, [step]);

  const onDelete = async () => {
    if (capturedImage?.id) {
       await deleteRestoration(capturedImage.id);
    }
    onClose();
  };

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
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

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
            <div className="flex items-center gap-8 px-8">
              <button 
                onClick={handleGalleryClick}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-gray-500 transition-all shadow-lg border border-gray-200 active:scale-95"
              >
                <ImageIcon size={28} />
              </button>

              <button
                onClick={handleCapture}
                className="w-24 h-24 rounded-full bg-white p-2 shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-transform flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-4 border-gray-200 flex items-center justify-center">
                  <Camera size={36} className="text-gray-900" />
                </div>
              </button>
              
              <div className="w-16 h-16" /> {/* Spacer */}
            </div>
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
                backgroundImage: `url(${capturedImage?.originalUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"})`,
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
                backgroundImage: `url(${capturedImage?.fixedUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"})`,
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

          <button onClick={onDelete} className="mt-4 text-gray-400 font-bold font-heading uppercase tracking-widest text-sm">delete</button>
        </div>
      )}

      {/* 4. SHARING VIEW */}
      {step === 'sharing' && (
        <div className="absolute inset-0 bg-white flex flex-col overflow-hidden animate-in fade-in duration-300 font-sans">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-white px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-2 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
              Share with Friends
            </h2>
            <button
              onClick={() => setStep('result')}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
            
            {/* 1. Preview Card (Existing) */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-gray-100 p-3 mb-8 flex items-center gap-4">
               <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 shadow-sm flex relative border border-gray-100">
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={capturedImage?.originalUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"}
                    className="w-full h-full object-cover grayscale opacity-80"
                    style={{ filter: 'sepia(0.8) contrast(0.8) blur(0.5px)' }}
                  />
                  <div className="absolute bottom-0.5 left-0.5 bg-gray-500/80 px-1.5 py-0.5 rounded text-[10px] text-white font-bold font-heading uppercase tracking-tighter">Old</div>
                </div>
                <div className="w-[1px] h-full bg-white z-10" />
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={capturedImage?.fixedUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0.5 right-0.5 bg-guardian-blue px-1.5 py-0.5 rounded text-[10px] text-white font-bold font-heading uppercase tracking-tighter shadow-sm">New</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <span className="text-gray-400 font-bold font-heading uppercase tracking-[0.2em] text-[10px] mb-1">PREVIEW</span>
                <p className="text-lg font-bold font-heading text-guardian-blue italic leading-tight line-clamp-2">
                  "My memory is alive again! ❤️"
                </p>
              </div>
            </div>

            {/* 2. Friends Grid */}
            <div className="mb-8">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {[
                  ...MOCK_CONTACTS.slice(0, 7),
                  { name: 'MORE', icon: MoreHorizontal, more: true, img: '' },
                ].map((friend: any, i) => {
                  const isSelected = selectedRecipients.includes(friend.name);
                  return (
                    <button 
                      key={i} 
                      onClick={() => friend.more ? setStep('select-contacts') : toggleRecipient(friend.name)}
                      className="flex flex-col items-center gap-2 group relative"
                    >
                      <div className={`w-14 h-14 rounded-full overflow-hidden relative shadow-sm group-active:scale-95 transition-all border 
                        ${isSelected ? 'border-guardian-blue ring-2 ring-guardian-blue ring-offset-2' : 'border-gray-100'}`}
                      >
                        {friend.more ? (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <MoreHorizontal className="text-gray-400" />
                          </div>
                        ) : (
                          <>
                            <img src={friend.img} alt={friend.name} className={`w-full h-full object-cover transition-all ${isSelected ? 'brightness-75' : ''}`} />
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                                <Check size={24} className="text-white drop-shadow-md" strokeWidth={3} />
                              </div>
                            )}
                            {friend.group && !isSelected && (
                              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                                <Users size={8} className="text-white" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${friend.more ? 'text-gray-400 font-bold uppercase text-xs' : isSelected ? 'text-guardian-blue font-bold' : 'text-gray-600'}`}>
                        {friend.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Send to Platform */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Send to Platform</h3>
              <div className="flex justify-between px-2">
                 {[
                   { name: 'WECHAT', icon: MessageCircle, color: '#07C160' }, // WeChat Green
                   { name: 'INSTAGRAM', icon: Instagram, color: '#E1306C' }, // Instagram Pink
                   { name: 'X', icon: Twitter, color: '#000000' }, // X Black
                   { name: 'WHATSAPP', icon: Send, color: '#25D366' }, // Whatsapp Green
                 ].map((platform, i) => {
                   const isSelected = selectedRecipients.includes(platform.name);
                   return (
                     <button 
                       key={i}
                       onClick={() => toggleRecipient(platform.name)}
                       className="flex flex-col items-center gap-2 group relative"
                     >
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm group-active:scale-95 transition-all
                         ${isSelected ? 'border-guardian-blue ring-2 ring-guardian-blue ring-offset-2 bg-white' : 'border-gray-100'}`}
                       >
                          {isSelected ? (
                            <div className="animate-in zoom-in duration-200">
                              <Check size={20} className="text-guardian-blue" strokeWidth={3} />
                            </div>
                          ) : (
                            <platform.icon size={24} color={platform.color} />
                          )}
                       </div>
                       <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-guardian-blue' : 'text-gray-500'}`}>
                         {platform.name}
                       </span>
                     </button>
                   );
                 })}
              </div>
            </div>
            
            {/* 4. Action Button (Cancel or Send) */}
             <button
              onClick={() => selectedRecipients.length > 0 ? handleMultiSend() : setStep('result')}
              className={`w-full h-14 rounded-2xl text-lg font-bold font-heading uppercase tracking-widest active:scale-98 transition-all shadow-sm
                ${selectedRecipients.length > 0 
                  ? 'bg-guardian-blue text-white shadow-blue-200' 
                  : 'bg-gray-100 text-gray-500'}`}
            >
              {selectedRecipients.length > 0 ? `SEND (${selectedRecipients.length})` : 'CANCEL'}
            </button>

          </div>
        </div>
      )}

       {/* 4a. SELECT CONTACTS VIEW */}
       {step === 'select-contacts' && (
         <div className="absolute inset-0 bg-white flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 font-sans z-[600]">
           <div className="sticky top-0 z-50 bg-white px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 border-b border-gray-100 flex items-center gap-4">
             <button
               onClick={() => setStep('sharing')}
               className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 active:bg-gray-100 transition-colors"
             >
               <ArrowLeft size={24} />
             </button>
             <h2 className="text-xl font-bold font-heading text-gray-900 tracking-tight">Select Recipients</h2>
           </div>

           <div className="flex-1 overflow-y-auto px-6 py-4">
             <div className="space-y-4">
                {MOCK_CONTACTS.map((friend, i) => {
                  const isSelected = selectedRecipients.includes(friend.name);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleRecipient(friend.name)}
                      className="w-full flex items-center gap-4 p-3 bg-white rounded-2xl active:bg-gray-50 transition-colors border border-transparent active:border-gray-100"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 relative">
                        <img src={friend.img} className="w-full h-full object-cover" />
                        {friend.group && (
                           <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                             <Users size={8} className="text-white" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`text-base font-bold font-heading ${isSelected ? 'text-guardian-blue' : 'text-gray-900'}`}>{friend.name}</h3>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-guardian-blue border-guardian-blue' : 'border-gray-300'}`}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
             </div>
           </div>

           <div className="p-6 border-t border-gray-100 bg-white pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
             <button
              onClick={() => setStep('sharing')}
              className="w-full h-14 bg-guardian-blue text-white rounded-2xl text-lg font-bold font-heading uppercase tracking-widest active:scale-98 transition-transform shadow-blue-200 shadow-sm"
            >
              Done {selectedRecipients.length > 0 && `(${selectedRecipients.length})`}
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