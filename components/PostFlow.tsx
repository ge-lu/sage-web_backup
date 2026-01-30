
import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Mic, Send, Image as ImageIcon, Sparkles, Check, Users, Globe, MessageCircle, Facebook, Mail, MessageSquare, Twitter, Music } from 'lucide-react';

type PostStep = 'camera' | 'message' | 'share_select' | 'sending' | 'success';

interface PostFlowProps {
  onClose: () => void;
  onPostCreated: (title: string, imageUrl: string) => void;
}

const PostFlow: React.FC<PostFlowProps> = ({ onClose, onPostCreated }) => {
  const [step, setStep] = useState<PostStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (step === 'camera') {
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
      console.error("Camera access denied or unavailable:", err);
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        setStep('message');
      }
    } else {
      setCapturedImage("https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop");
      setStep('message');
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice transcription is not supported in this browser. Please try using Chrome or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      if (message.includes("didn't hear")) {
        setMessage(""); // Clear error message if user retries
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setMessage(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        setMessage("I didn't hear you. Please tap the blue button and try again!");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Start failed:", err);
      setIsListening(false);
    }
  };

  const startSending = (destName: string) => {
    setDestination(destName);
    setStep('sending');
    setTimeout(() => {
      setStep('success');
      onPostCreated(message || "A beautiful moment", capturedImage!);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#F5F7F9] flex flex-col font-sans select-none text-gray-900">

      <canvas ref={canvasRef} className="hidden" />

      {step !== 'success' && step !== 'sending' && (
        <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-heading text-gray-900 uppercase tracking-tight">
            {step === 'camera' && 'Take a Photo'}
            {step === 'message' && 'Add a Message'}
            {step === 'share_select' && 'Share The Joy'}
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
        <div className="flex-1 flex flex-col bg-[#F5F7F9]">
          <div className="flex-1 px-6 flex items-center justify-center">
            <div className="w-full max-w-sm aspect-[3/4] relative bg-black rounded-xl overflow-hidden shadow-xl border border-gray-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 border-[3px] border-white/20 rounded-xl pointer-events-none" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                <Camera size={24} className="text-white/50" />
              </div>
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
            <p className="mt-4 text-gray-400 font-bold font-heading uppercase text-sm tracking-widest">Capture Moment</p>
          </div>
        </div>
      )}

      {step === 'message' && (
        <div className="flex-1 flex flex-col px-6 py-6 overflow-y-auto no-scrollbar bg-[#F5F7F9]">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-6 relative group">
            <img src={capturedImage!} className="w-full h-full object-cover" />
            <button
              onClick={() => setStep('camera')}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold font-heading uppercase tracking-wider hover:bg-black/80 transition-colors"
            >
              Retake
            </button>
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <label className="text-xs font-bold font-heading text-gray-400 uppercase tracking-widest block">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tap the mic to speak..."
                className={`w-full bg-transparent text-xl font-medium min-h-[120px] outline-none resize-none placeholder-gray-300 ${message.includes("didn't hear") ? 'text-red-500' : 'text-gray-900'}`}
              />
            </div>

            <button
              onClick={handleVoiceInput}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 border-2 ${isListening ? 'bg-white text-red-500 border-red-100 animate-pulse' : 'bg-white text-guardian-blue border-blue-100'}`}
            >
              {isListening ? (
                <>
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                  <span className="text-lg font-bold font-heading uppercase tracking-wide">Listening...</span>
                </>
              ) : (
                <>
                  <Mic size={24} className="text-guardian-blue" />
                  <span className="text-lg font-bold font-heading uppercase tracking-wide">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pb-4">
            <button
              onClick={() => setStep('share_select')}
              className="w-full h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform uppercase tracking-wide"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {step === 'share_select' && (
        <div className="flex-1 flex flex-col bg-[#F5F7F9] overflow-y-auto no-scrollbar">
          <div className="px-6 pt-6 pb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0 shadow-sm border border-gray-100">
                <img
                  src={capturedImage!}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <span className="text-gray-400 font-bold font-heading uppercase tracking-widest text-xs mb-1">PREVIEW</span>
                <p className="text-lg font-medium text-gray-900 italic leading-tight line-clamp-2">
                  "{message || "Sharing a beautiful moment!"}"
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 pt-2 pb-8 space-y-3">
            <p className="text-center text-gray-400 font-bold font-heading uppercase tracking-widest text-xs mb-4">CHOOSE WHERE TO SEND:</p>

            {/* 1. iMessage */}
            <button
              onClick={() => startSending('iMessage')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <MessageSquare size={16} className="text-[#34C759]" fill="#34C759" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">IMESSAGE</span>
            </button>

            {/* 2. Facebook */}
            <button
              onClick={() => startSending('Facebook')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <Facebook size={16} className="text-[#1877F2]" fill="#1877F2" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">Facebook</span>
            </button>

            {/* 3. WhatsApp */}
            <button
              onClick={() => startSending('WhatsApp')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <MessageCircle size={16} className="text-[#075E54]" fill="#075E54" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">WhatsApp</span>
            </button>

            {/* 4. Twitter */}
            <button
              onClick={() => startSending('Twitter')}
              className="w-full h-16 bg-[#F5F9FF] text-guardian-blue border border-blue-100 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-98 transition-all group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-50 shadow-sm">
                <Twitter size={16} className="text-[#1DA1F2]" fill="#1DA1F2" />
              </div>
              <span className="text-lg font-bold font-heading uppercase tracking-wide">Twitter</span>
            </button>

            {/* 5. TikTok */}
            <button
              onClick={() => startSending('TikTok')}
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

      {step === 'sending' && (
        <div className="absolute inset-0 bg-guardian-blue flex flex-col items-center justify-center p-6 z-[300]">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-5xl font-bold font-heading text-white text-center leading-tight uppercase tracking-tighter">
            Sending to {destination}...
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
