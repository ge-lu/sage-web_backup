import React, { useState, useRef, useEffect } from 'react';
import { Mic, Share2, Loader2, Volume2, Square, MessageSquare, Check, X, Send, Heart } from 'lucide-react';
import { FamilyMemberUpdate } from '../types';
import GuardianButton from './GuardianButton';
import { GoogleGenAI } from "@google/genai";

interface UpdateCardProps {
  update: FamilyMemberUpdate;
  onShare?: (message: string) => void;
  onClick?: () => void;
  customTitle?: string;
}

// Helper functions for Gemini TTS audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update, onShare, onClick, customTitle }) => {
  const [aiReply, setAiReply] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [sent, setSent] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'finished'>('idle');
  const [liked, setLiked] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const displayName = update.name.charAt(0).toUpperCase() + update.name.slice(1).toLowerCase();

  useEffect(() => {
    return () => {
      stopAudio();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleReadToMe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReading) {
      stopAudio();
      return;
    }
    setIsReading(true);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Construct a relevant prompt for the update card
      const prompt = `Please read this update to me: "Lovely weather for ${displayName} in ${update.location}. It is ${update.temperature} degrees and ${update.condition}. ${update.message}". Narrate it clearly and specifically.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Audio data missing");
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsReading(false);
      audioSourceRef.current = source;
      source.start();
    } catch (error) {
      console.error("TTS Error:", error);
      setIsReading(false);
    } finally {
      setLoading(false);
    }
  };

  const triggerVibration = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleVoiceToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (voiceState === 'recording') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceState('finished');
      triggerVibration([50, 50]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setVoiceState('recording');
      setAiReply("");
      triggerVibration(50);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setAiReply(finalTranscript + interimTranscript);
    };

    recognition.onerror = () => {
      setVoiceState('idle');
    };

    recognition.onend = () => {
      if (voiceState === 'recording') {
        setVoiceState('finished');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition start failed:", err);
      setVoiceState('idle');
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiReply('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          setAiReply('');
          if (recognitionRef.current) recognitionRef.current.start();
        }, 300);
      } catch (e) {
        try { recognitionRef.current.start(); } catch (err) {}
      }
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleVoiceToggle();
  };

  const handleSendReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSent(true);
    setVoiceState('idle');
    triggerVibration([100, 50, 100]);
    setTimeout(() => {
      setSent(false);
      setAiReply("");
    }, 3000);
  };

  const closeOverlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
    setAiReply("");
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-transform active:scale-[0.98] relative"
      >
        {/* Cover Image */}
        <div className="aspect-square relative overflow-hidden group">
          <img
            src={update.imageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt={update.weatherTitle}
          />
          <div className="absolute top-6 left-6 bg-black/50 text-white px-4 py-1.5 rounded-full font-bold font-heading text-sm">
            Today
          </div>

          {/* Like Button: Heart Shape with LIKE text */}
          <button
            onClick={toggleLike}
            className="absolute bottom-6 right-6 w-16 h-16 flex items-center justify-center active:scale-90 transition-transform"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Heart
                size={80}
                fill={liked ? "#ff4d4d" : "rgba(0,0,0,0.5)"}
                className={`transition-colors ${liked ? "text-[#ff4d4d]" : "text-white/80"}`}
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-sans text-white tracking-widest pt-1">
                LIKE
              </span>
            </div>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold font-heading text-xl text-gray-900">
              {customTitle || `Lovely weather for ${displayName}!`}
            </h3>
            <p className="text-xs text-gray-500">
              Temp: {update.temperature}°C • London
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            {/* Main Action Button */}
            <GuardianButton
              onClick={update.actionType === 'voice' ? handleMessageClick : handleReadToMe}
              disabled={loading}
              className={`flex-1 h-20 !rounded-2xl shadow-md active:scale-95 transition-transform border-0
                ${(voiceState === 'recording' || isReading)
                  ? '!bg-[#991b1b] !shadow-none'
                  : ''}`}
            >
               {loading ? (
                <Loader2 className="animate-spin text-white" size={24} />
              ) : (voiceState === 'recording' || isReading) ? (
                <>
                  <Square size={20} fill="white" className="text-white" />
                  <span className="text-lg text-white">STOP</span>
                </>
              ) : (
                <>
                  <MessageSquare size={24} className="text-white" />
                  <span className="text-lg text-white">
                    MESSAGE
                  </span>
                </>
              )}
            </GuardianButton>

            {/* SHARE Button */}
            <GuardianButton
              onClick={(e) => { e.stopPropagation(); if (onShare) onShare(aiReply || update.weatherTitle); }}
              className="flex-1 h-20 !rounded-2xl !bg-white !shadow-sm border border-gray-200 active:scale-95 transition-transform"
            >
              <Share2 size={24} className="text-guardian-blue" />
              <span className="text-lg text-guardian-blue">SHARE</span>
            </GuardianButton>
          </div>
        </div>
      </div>

      {/* Recording / Review Overlay Panel */}
      {(voiceState === 'recording' || voiceState === 'finished') && (
        <div className="fixed inset-0 z-[550] bg-black/60 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-t-[3.5rem] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_100px_rgba(0,0,0,0.5)]">
            <div className="p-8 pt-4 pb-16 flex flex-col items-center gap-6">
              {/* Decorative Grab Handle */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>

              {/* Modal Top Row */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${voiceState === 'recording' ? 'bg-neon animate-pulse' : 'bg-neon'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neon">Voice Recording</span>
                </div>
                <button 
                  onClick={closeOverlay} 
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-transform shrink-0"
                >
                  <span className="material-symbols-outlined !text-xl">close</span>
                </button>
              </div>

              {/* Large Interactive Mic Button */}
              <div className="relative py-4">
                {voiceState === 'recording' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-neon/30 animate-ping"></div>
                    <div className="absolute -inset-3 rounded-full bg-neon/20 animate-pulse"></div>
                  </>
                )}
                <button 
                  onClick={(e) => handleVoiceToggle(e)}
                  className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl relative z-10 transition-all duration-300 ${voiceState === 'recording' ? 'bg-neon scale-110' : 'bg-gray-100 active:scale-95'}`}
                >
                  <span className={`material-symbols-outlined !text-5xl ${voiceState === 'recording' ? 'text-white filled' : 'text-gray-400'}`}>
                    {voiceState === 'recording' ? 'mic' : 'mic_none'}
                  </span>
                </button>
              </div>

              {/* Transcription and Feedback Text */}
              <div className="w-full text-center min-h-[120px] flex flex-col justify-center gap-2 px-4">
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${voiceState === 'recording' ? 'text-neon' : 'text-gray-400'}`}>
                  {voiceState === 'recording' ? 'Listening...' : aiReply ? 'Captured' : 'Tap to start'}
                </p>
                <div className="max-h-32 overflow-y-auto w-full">
                  <h3 className="text-2xl font-bold text-gray-900 leading-snug tracking-tight break-words px-2">
                    {aiReply || (voiceState === 'recording' ? "Say something to " + displayName : "Ready to record")}
                    {voiceState === 'recording' && <span className="inline-block w-1 h-6 bg-neon ml-1 animate-pulse align-middle"></span>}
                  </h3>
                </div>
              </div>

              {/* Sheet Actions Footer */}
              <div className="w-full flex gap-4 mt-2 mb-12">
                <button 
                  onClick={handleRetry}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-3xl py-4 text-gray-600 font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined !text-sm">replay</span>
                  Retry
                </button>
                <button 
                  disabled={!aiReply}
                  onClick={handleSendReply}
                  className="flex-[1.5] bg-neon hover:bg-green-600 active:bg-green-700 rounded-3xl py-4 text-white font-bold text-xs tracking-widest uppercase shadow-lg transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined !text-sm filled">send</span>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

       {/* Sent Success Overlay */}
       {sent && (
        <div className="fixed inset-0 z-[650] bg-[#13EC13] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 overflow-y-auto">
          <div className="flex flex-col items-center justify-center min-h-full max-w-full px-4 py-8">
            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full flex items-center justify-center mb-8 sm:mb-12 shadow-2xl animate-in zoom-in duration-500 shrink-0">
              <Check size={100} strokeWidth={6} className="text-[#13EC13] sm:w-[140px] sm:h-[140px]" />
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tighter">SENT!</h2>
            <p className="text-xl sm:text-2xl md:text-4xl text-white font-bold px-4 sm:px-8 leading-tight break-words max-w-2xl">
              Your message to {displayName} has been sent! ❤️
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateCard;
