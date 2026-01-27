import React, { useState, useRef, useEffect } from 'react';
import { Mic, Share2, Heart, Loader2, StopCircle, Volume2, Square, Send, ArrowRight, X, Sparkles, MessageSquare, Check } from 'lucide-react';
import { Post } from '../types';
import { GoogleGenAI } from "@google/genai";

interface FeedCardProps {
  post: Post;
  isNews?: boolean;
  onShare?: (message: string) => void;
  onClick?: () => void;
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

const FeedCard: React.FC<FeedCardProps> = ({ post, isNews, onShare, onClick }) => {
  const [aiReply, setAiReply] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [sent, setSent] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'finished'>('idle');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
      const prompt = `Please read this news headline to me: "${post.title}". Narrate it clearly and professionally.`;
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
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setAiReply(currentTranscript);
    };
    
    recognition.onerror = () => {
      setVoiceState('idle');
    };
    
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition start failed:", err);
      setVoiceState('idle');
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleVoiceToggle();
  };

  const handleSendReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSent(true);
    setVoiceState('idle'); // Close recording overlay
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
    triggerVibration(50);
  };

  return (
    <>
      <div 
        onClick={onClick}
        className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-gray-100 cursor-pointer transition-transform active:scale-[0.98] relative"
      >
        <div className="aspect-square relative overflow-hidden group">
          <img 
            src={post.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt={post.title} 
          />
          <div className="absolute top-6 left-6 bg-black/50 text-white px-4 py-1.5 rounded-full font-bold text-sm">
            Today
          </div>
          
          {/* Updated Like Button: Heart Shape with LIKE text */}
          <button 
            onClick={toggleLike}
            className="absolute bottom-6 right-6 w-16 h-16 flex items-center justify-center active:scale-90 transition-transform"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Heart 
                size={64} 
                fill={liked ? "#ff4d4d" : "rgba(0,0,0,0.5)"} 
                className={`transition-colors ${liked ? "text-[#ff4d4d]" : "text-white/80"}`}
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white tracking-widest pt-1">
                LIKE
              </span>
            </div>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-[2rem] leading-tight font-black text-[#003366] tracking-tight">{post.title}</h3>
            <p className="text-xl text-gray-500 font-bold">Sent by {post.author} today</p>
          </div>

          <div className="flex gap-4 pt-2">
            {/* Main Action Button */}
            <button 
              onClick={isNews ? handleReadToMe : handleReplyClick}
              disabled={loading}
              className={`flex-1 h-32 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none font-black uppercase tracking-tighter
                ${(voiceState === 'recording' || isReading) 
                  ? 'bg-[#991b1b] text-white shadow-[0_6px_0_#450a0a]' 
                  : 'bg-[#002B7F] text-white shadow-[0_6px_0_#001a4d]'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={36} />
              ) : (voiceState === 'recording' || isReading) ? (
                <>
                  <div className="w-11 h-11 bg-white flex items-center justify-center rounded-xl">
                    <Square size={24} fill="#991b1b" className="text-[#991b1b]" />
                  </div>
                  <span className="text-lg">STOP</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-14 bg-[#2563EB] flex items-center justify-center rounded-xl shadow-inner">
                    {isNews ? <Volume2 size={32} fill="white" /> : <MessageSquare size={32} fill="white" />}
                  </div>
                  <span className="text-lg">
                    {isNews ? 'LISTEN' : 'REPLY'}
                  </span>
                </>
              )}
            </button>
            
            {/* SHARE Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); if (onShare) onShare(aiReply || post.title); }}
              className="flex-1 h-32 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 font-black uppercase tracking-tighter transition-all active:translate-y-1 active:shadow-none bg-[#9CA3AF] text-white shadow-[0_6px_0_#4B5563]"
            >
              <div className="w-11 h-11 bg-white flex items-center justify-center rounded-xl shadow-sm">
                <Share2 size={24} className="text-[#1152D4]" />
              </div>
              <span className="text-lg text-[#003366]">SHARE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Overlays */}
      
      {/* Sent Success Overlay */}
      {sent && (
        <div className="fixed inset-0 z-[650] bg-[#13EC13] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
          <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center mb-12 shadow-2xl animate-in zoom-in duration-500">
            <Check size={140} strokeWidth={6} className="text-[#13EC13]" />
          </div>
          <h2 className="text-8xl font-black text-white mb-6 uppercase tracking-tighter">SENT!</h2>
          <p className="text-4xl text-white font-bold px-8 leading-tight">Your family will see your message! ❤️</p>
        </div>
      )}

      {/* Recording / Review Overlay Panel */}
      {(voiceState === 'recording' || voiceState === 'finished') && (
        <div className="fixed inset-0 z-[550] bg-black/60 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-t-[3.5rem] p-10 space-y-10 animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_100px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center">
               <span className="text-sm font-black text-gray-400 uppercase tracking-widest">
                 {voiceState === 'recording' ? 'I AM LISTENING...' : 'READY TO SEND?'}
               </span>
               <button 
                 onClick={closeOverlay} 
                 className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 active:scale-90"
               >
                 <X size={32} strokeWidth={3} />
               </button>
            </div>

            <div className={`p-10 rounded-[3rem] border-[6px] min-h-[200px] flex items-center justify-center text-center transition-all
              ${voiceState === 'recording' ? 'border-[#1152D4] bg-blue-50' : 'border-gray-200 bg-white shadow-inner'}`}
            >
              <p className={`text-4xl font-black italic leading-tight ${voiceState === 'recording' ? 'text-[#1152D4]' : aiReply ? 'text-[#003366]' : 'text-gray-300'}`}>
                {aiReply || (voiceState === 'recording' ? "..." : "Tap the Mic below")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 pb-8">
               <div className="flex flex-col items-center gap-5">
                  <button 
                    onClick={(e) => handleVoiceToggle(e)}
                    className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border-[12px] border-white
                      ${voiceState === 'recording' 
                        ? 'bg-red-500 animate-pulse shadow-[0_0_80px_rgba(239,68,68,0.5)]' 
                        : 'bg-[#1152D4] shadow-[0_25px_50px_rgba(17,82,212,0.4)]'}`}
                  >
                    {voiceState === 'recording' ? (
                      <Square size={64} fill="white" className="text-white" />
                    ) : (
                      <Mic size={72} fill="white" className="text-white" />
                    )}
                  </button>
                  <span className={`text-2xl font-black uppercase tracking-[0.1em] ${voiceState === 'recording' ? 'text-red-500' : 'text-[#003366]'}`}>
                    {voiceState === 'recording' ? 'TAP TO STOP' : 'TAP TO TRY AGAIN'}
                  </span>
               </div>

               {aiReply && voiceState !== 'recording' && (
                 <button 
                   onClick={handleSendReply}
                   className="w-full h-36 bg-[#059669] text-white rounded-[3rem] flex items-center justify-center gap-6 shadow-[0_15px_0_#064e3b] active:translate-y-2 active:shadow-none transition-all border-4 border-white animate-in zoom-in duration-300"
                 >
                   <Send size={48} fill="white" />
                   <span className="text-4xl font-black uppercase tracking-tighter">
                     SEND TO FAMILY
                   </span>
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedCard;