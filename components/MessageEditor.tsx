
import React, { useState, useRef, useEffect } from 'react';
import { Mic, ArrowRight, RotateCcw, X, Maximize2 } from 'lucide-react';

interface MessageEditorProps {
  message: string;
  setMessage: (m: string) => void;
  onShare: () => void;
  onRetake: () => void;
  imageUrl: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MessageEditor: React.FC<MessageEditorProps> = ({ message, setMessage, onShare, onRetake, imageUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalDragY, setModalDragY] = useState(0);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const modalStartYRef = useRef(0);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US'; // Use browser language or default to English

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        // Since continuous is true, event.results accumulates. 
        // We want to replace the message with the full session transcript.
        const currentSessionTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        setMessage(currentSessionTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone permissions.');
        }
        stopRecording();
      };

      recognition.onend = () => {
        // This triggers when silence timeout occurs or manually stopped
        if (isRecording) {
          stopRecording();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    try {
      setMessage(""); // Clear previous message for new recording
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error("Failed to start recording:", e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onModalDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDraggingModal(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    modalStartYRef.current = clientY - modalDragY;
  };

  const onModalDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingModal) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentDrag = Math.max(0, clientY - modalStartYRef.current);
    setModalDragY(currentDrag);
  };

  const onModalDragEnd = () => {
    setIsDraggingModal(false);
    if (modalDragY > 150) {
      setIsFullScreen(false);
    }
    setModalDragY(0);
  };

  return (
    <div className="px-6 py-8 flex flex-col gap-8 min-h-full bg-white">
      {/* Visual Preview / Media Card */}
      <div className="relative group">
        <div
          onClick={() => setIsFullScreen(true)}
          className="w-full aspect-square bg-gray-100 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center transition-all group-hover:shadow-lg cursor-pointer relative active:scale-[0.98]"
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRetake(); }}
            className="absolute top-6 right-6 bg-white/95 backdrop-blur shadow-xl px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] text-slate-800 flex items-center gap-2.5 hover:bg-white transition-all active:scale-90 border border-white/50 z-10"
          >
            <RotateCcw size={16} />
            Retake
          </button>
        </div>
      </div>

      {/* Message Text Area */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center px-1">
          <span>Your Message</span>
          {isRecording && (
            <span className="text-red-500 font-bold flex items-center gap-1.5 lowercase tabular-nums">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTime(recordingSeconds)}
            </span>
          )}
        </label>
        <div className="relative">
          <div className={`min-h-[140px] w-full p-7 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col transition-all duration-300 ${isRecording ? 'ring-2 ring-blue-500 bg-blue-50/50 shadow-inner' : ''}`}>
            {isRecording ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <div className="flex items-center gap-1.5 h-10">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{
                        height: `${Math.random() * 100 + 20}%`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: '0.7s'
                      }}
                    />
                  ))}
                </div>
                <div className="text-center space-y-2">
                  <p className="text-blue-600 font-bold tracking-wide animate-pulse text-sm uppercase">Listening...</p>
                  {/* Show partial transcript while recording if available */}
                  {message && <p className="text-slate-500 text-sm line-clamp-2 px-4">{message}</p>}
                </div>
              </div>
            ) : message ? (
              <p className="text-lg text-slate-800 leading-relaxed font-medium break-words">
                {message}
              </p>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-center text-lg leading-relaxed px-4">
                  Tap the blue button to speak...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons Container */}
      <div className="mt-auto space-y-4 pt-4 pb-40">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-3 transition-all transform active:scale-[0.96] shadow-xl ${isRecording
            ? 'bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-100 shadow-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
        >
          <div className={`${isRecording ? 'animate-pulse' : ''}`}>
            <Mic size={24} fill={isRecording ? "white" : "none"} />
          </div>
          <span className="text-lg font-bold uppercase tracking-wider">
            {isRecording ? 'STOP RECORDING' : 'SAY SOMETHING'}
          </span>
        </button>

        <button
          onClick={onShare}
          disabled={isRecording}
          className={`w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-3 transition-all transform active:scale-[0.96] shadow-lg shadow-slate-100 ${isRecording ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-slate-900 text-white hover:bg-black'
            }`}
        >
          <span className="text-lg font-bold uppercase tracking-wider">NEXT STEP</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Full Screen Overlay Modal */}
      {isFullScreen && (
        <div
          className="absolute inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 px-6 py-12 touch-none"
          onMouseMove={onModalDragMove}
          onMouseUp={onModalDragEnd}
          onMouseLeave={onModalDragEnd}
          onTouchMove={onModalDragMove}
          onTouchEnd={onModalDragEnd}
          style={{ opacity: Math.max(0.3, 1 - modalDragY / 500) }}
        >
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors p-3 bg-white/10 rounded-full hover:bg-white/20 z-[210]"
          >
            <X size={28} />
          </button>

          <div
            className="w-full h-full flex flex-col items-center justify-center transition-transform ease-out"
            onMouseDown={onModalDragStart}
            onTouchStart={onModalDragStart}
            style={{
              transform: `translateY(${modalDragY}px)`,
              transitionDuration: isDraggingModal ? '0ms' : '300ms'
            }}
          >
            <div className="aspect-[3/4] w-full max-h-[85%] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={imageUrl}
                alt="Full Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Swipe down to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageEditor;
