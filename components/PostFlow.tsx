
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
    <div className="fixed inset-0 z-[200] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none">

      <canvas ref={canvasRef} className="hidden" />

      {step !== 'success' && step !== 'sending' && (
        <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-gray-100 bg-white">
          <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tight">
            {step === 'camera' && 'Take a Photo'}
            {step === 'message' && 'Add a Message'}
            {step === 'share_select' && 'SHARE THE JOY'}
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 active:bg-gray-200"
          >
            <X size={28} />
          </button>
        </div>
      )}

      {step === 'camera' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-900 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative w-72 h-72 border-2 border-white/30 rounded-full flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border border-white/10 rounded-full animate-pulse" />
              <Camera size={64} className="text-white/20 absolute" />
            </div>

            <div className="absolute bottom-10 left-6 right-6 flex justify-center items-center px-10">
              <button
                onClick={handleCapture}
                className="w-28 h-28 rounded-full bg-white p-2 shadow-2xl active:scale-90 transition-transform"
              >
                <div className="w-full h-full rounded-full border-4 border-[#003366] flex items-center justify-center" />
              </button>
            </div>
          </div>
          <div className="p-10 text-center">
            <p className="text-xl font-bold text-gray-400">Point at something beautiful</p>
          </div>
        </div>
      )}

      {step === 'message' && (
        <div className="flex-1 flex flex-col p-8 overflow-y-auto no-scrollbar">
          <div className="w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl mb-10 relative">
            <img src={capturedImage!} className="w-full h-full object-cover" />
            <button
              onClick={() => setStep('camera')}
              className="absolute top-6 right-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest"
            >
              Retake
            </button>
          </div>
          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-2">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tap the blue button to speak..."
                className={`w-full bg-[#F6F6F8] p-8 rounded-[2rem] text-2xl font-medium min-h-[180px] outline-none border-2 border-transparent focus:border-blue-200 transition-all resize-none ${message.includes("didn't hear") ? 'text-red-500' : 'text-[#003366]'}`}
              />
            </div>
            <button
              onClick={handleVoiceInput}
              className={`w-full py-8 rounded-[2.5rem] flex items-center justify-center gap-6 shadow-xl transition-all active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#1152D4] text-white'}`}
            >
              {isListening ? (
                <>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">Listening...</span>
                </>
              ) : (
                <>
                  <Mic size={44} fill="white" />
                  <span className="text-3xl font-black uppercase tracking-tight">SAY SOMETHING</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-12 pb-6">
            <button
              onClick={() => setStep('share_select')}
              className="w-full bg-[#001A33] text-white py-8 rounded-[2.5rem] text-4xl font-black shadow-[0_12px_0_#000a14] active:translate-y-2 active:shadow-none transition-all uppercase"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {step === 'share_select' && (
        <div className="flex-1 flex flex-col bg-[#F8F9FA] overflow-y-auto no-scrollbar">
          {/* Reduced padding bottom to tighten space */}
          <div className="px-8 pt-8 pb-4">
            <div className="bg-white rounded-[2.5rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-6">
              <div className="w-24 h-24 rounded-[1.75rem] overflow-hidden bg-gray-50 shrink-0 shadow-md">
                <img
                  src={capturedImage!}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <span className="text-[#9CA3AF] font-black uppercase tracking-[0.2em] text-[12px] mb-1">PREVIEW</span>
                <p className="text-[1.35rem] font-black text-[#003366] italic leading-tight line-clamp-2">
                  "{message || "Sharing a beautiful moment!"}"
                </p>
              </div>
            </div>
          </div>

          {/* Reduced padding top to tighten space */}
          <div className="flex-1 px-8 pt-0 pb-8 space-y-4">
            <p className="text-center text-[#CCCCCC] font-black uppercase tracking-[0.25em] text-[10px] mb-2">CHOOSE WHERE TO SEND:</p>

            {/* 1. iMessage (Green) */}
            <button
              onClick={() => startSending('iMessage')}
              className="w-full h-24 bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#128c7e] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <MessageSquare size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">IMESSAGE</span>
            </button>

            {/* 2. Facebook (Blue) */}
            <button
              onClick={() => startSending('Facebook')}
              className="w-full h-24 bg-[#1877F2] text-white rounded-[2rem] flex items-center justify-center gap-5 px-10 shadow-[0_8px_0_#0d52a8] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <Facebook size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">Facebook</span>
            </button>

            {/* 3. WhatsApp (Dark Green) */}
            <button
              onClick={() => startSending('WhatsApp')}
              className="w-full h-24 bg-[#075E54] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#043e37] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <MessageCircle size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">WhatsApp</span>
            </button>

            {/* 4. Twitter (Sky Blue) */}
            <button
              onClick={() => startSending('Twitter')}
              className="w-full h-24 bg-[#1DA1F2] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#0c85d0] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                <Twitter size={32} fill="white" className="text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tight">Twitter</span>
            </button>

            {/* 5. TikTok (Black) */}
            <button
              onClick={() => startSending('TikTok')}
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

      {step === 'sending' && (
        <div className="absolute inset-0 bg-[#003366] flex flex-col items-center justify-center p-10 z-[300]">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative mb-12">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <Send size={64} className="text-white animate-bounce" />
          </div>
          <h2 className="text-5xl font-black text-white text-center leading-tight">
            Sending to {destination}...
          </h2>
        </div>
      )}

      {step === 'success' && (
        <div className="absolute inset-0 bg-[#13EC13] flex flex-col items-center justify-center p-10 z-[400] text-center">
          <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl animate-in zoom-in duration-500">
            <Check size={100} strokeWidth={4} className="text-[#13EC13]" />
          </div>
          <h2 className="text-6xl font-black text-white mb-4">Done!</h2>
          <p className="text-2xl text-white font-bold mb-16 px-6">Your beautiful memory has been shared!</p>

          <button
            onClick={onClose}
            className="w-full bg-white text-[#13EC13] py-8 rounded-[2.5rem] text-4xl font-black shadow-[0_12px_0_#0fbc0f] active:translate-y-2 active:shadow-none transition-all uppercase"
          >
            Finish
          </button>
        </div>
      )}

    </div>
  );
};

export default PostFlow;
