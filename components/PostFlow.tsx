
import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, Send, RotateCw } from 'lucide-react';
import MessageEditor from './MessageEditor';
import ShareContent from './ShareContent';
import BottomDrawer from './BottomDrawer';

type PostStep = 'camera' | 'review' | 'message' | 'share_select' | 'sending' | 'success';

interface PostFlowProps {
  onClose: () => void;
  onPostCreated: (title: string, imageUrl: string) => void;
}

const PostFlow: React.FC<PostFlowProps> = ({ onClose, onPostCreated }) => {
  const [step, setStep] = useState<PostStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [destination, setDestination] = useState<string | null>(null);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, facingMode]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle mirroring for user-facing camera if needed, but keeping it simple for now
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        setStep('review');
      }
    } else {
      // Fallback for demo
      setCapturedImage("https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop");
      setStep('review');
    }
  };

  const handleShareSuccess = () => {
    setStep('sending');
    setTimeout(() => {
      setStep('success');
      onPostCreated(message || "A beautiful moment", capturedImage!);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F5F7F9] flex flex-col font-sans text-gray-900 h-[100dvh] overflow-hidden">

      <canvas ref={canvasRef} className="hidden" />

      {step !== 'success' && step !== 'sending' && step !== 'camera' && step !== 'review' && (
        <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold font-heading text-gray-900 uppercase tracking-tight">
            {step === 'message' && 'Add a Message'}
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-500 active:bg-gray-50 border border-gray-200 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {step === 'camera' && (
        <div className="flex-1 flex flex-col bg-black relative w-full h-full">
          {/* Top Bar - Close Button */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-[calc(1rem+env(safe-area-inset-top))] px-6 flex justify-between items-start">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Video Area - 4:3 Ratio */}
          <div className="w-full max-w-lg mx-auto mt-[calc(env(safe-area-inset-top)+3.5rem)] xs:mt-[calc(env(safe-area-inset-top)+1rem)] aspect-[3/4] rounded-[2.5rem] overflow-hidden relative bg-gray-900 border border-gray-800 shadow-2xl shrink-0 z-10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-full border border-white/10 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-white/30" />
                <div className="border-r border-white/30" />
                <div className="col-span-3 border-b border-white/30 row-start-2" />
                <div className="col-span-3 border-b border-white/30 row-start-3" />
              </div>
            </div>
          </div>

          {/* Bottom Controls - Shutter */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black min-h-0 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
            <div className="flex items-center justify-center w-full gap-12">
              <div className="w-12" />
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-[5px] border-white flex items-center justify-center active:scale-95 transition-transform shadow-lg"
              >
                <div className="w-[66px] h-[66px] bg-white rounded-full transition-all active:scale-90" />
              </button>
              <div className="w-12 flex items-center justify-center">
                <button
                  onClick={toggleCamera}
                  className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-gray-700/50 transition-all border border-gray-700"
                >
                  <RotateCw size={20} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {step === 'review' && capturedImage && (
        <div className="flex-1 flex flex-col bg-black relative w-full h-full">
          {/* Main Image Area - 4:3 Ratio */}
          <div className="w-full max-w-lg mx-auto mt-[calc(env(safe-area-inset-top)+3.5rem)] xs:mt-[calc(env(safe-area-inset-top)+1rem)] aspect-[3/4] rounded-[2.5rem] overflow-hidden relative bg-gray-900 border border-gray-800 shadow-2xl shrink-0 z-10">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Controls - Review */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black min-h-0 pb-[calc(env(safe-area-inset-bottom)+6rem)] px-12">
            <div className="flex items-center justify-between w-full max-w-sm h-20">
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setStep('camera');
                }}
                className="text-white font-medium text-lg tracking-wide opacity-90 hover:opacity-100 transition-opacity"
              >
                Retake
              </button>
              <button
                onClick={() => setStep('message')}
                className="text-black font-bold text-lg tracking-wide bg-white px-8 py-3 rounded-full hover:bg-gray-100 transition-colors active:scale-95 shadow-lg flex items-center gap-2"
              >
                Use Photo
                <Check size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'message' && (
        <div className="flex-1 bg-white flex flex-col overflow-y-auto touch-pan-y min-h-0">
          <MessageEditor
            message={message}
            setMessage={setMessage}
            onShare={() => setIsShareSheetOpen(true)}
            onRetake={() => {
              setCapturedImage(null);
              setStep('camera');
            }}
            imageUrl={capturedImage!}
          />
        </div>
      )}

      <BottomDrawer isOpen={isShareSheetOpen} onClose={() => setIsShareSheetOpen(false)}>
        <ShareContent
          onClose={() => setIsShareSheetOpen(false)}
          onShareSuccess={() => {
            setIsShareSheetOpen(false);
            handleShareSuccess();
          }}
        />
      </BottomDrawer>

      {step === 'sending' && (
        <div className="absolute inset-0 bg-guardian-blue flex flex-col items-center justify-center p-6 z-[300]">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-5xl font-bold font-heading text-white text-center leading-tight uppercase tracking-tighter">
            Sending...
          </h2>
        </div>
      )}

      {step === 'success' && (
        <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 z-[400] text-center">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-10 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
            <Check size={96} strokeWidth={5} className="text-guardian-blue" />
          </div>
          <h2 className="text-4xl font-bold font-heading text-guardian-blue mb-4 uppercase tracking-tight">Good News!</h2>
          <p className="text-xl text-gray-500 font-medium mb-12 px-6 leading-relaxed max-w-md">Your beautiful moment has been shared!</p>

          <button
            onClick={onClose}
            className="w-full max-w-sm h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform uppercase tracking-wide"
          >
            Finish
          </button>
        </div>
      )}

    </div>
  );
};

export default PostFlow;
