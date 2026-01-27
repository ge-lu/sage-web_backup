import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, Heart, Share2, Award, Send, Facebook, MessageCircle, Check, ArrowLeft, StopCircle, MessageSquare, Twitter, Music, Hand } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface JourneyFlowProps {
  onClose: () => void;
}

type JourneyView = 'main' | 'sharing';

const TIMELINE_MEMORIES = [
  {
    id: 1,
    who: "Grandson Tommy",
    action: "loved this photo 2 days ago",
    title: "1960 Wedding Day",
    before: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop&sepia=1",
    after: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    who: "Daughter Sarah",
    action: "shared this with the family",
    title: "The Old Garden",
    before: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1000&auto=format&fit=crop&sepia=1",
    after: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1000&auto=format&fit=crop",
  }
];

const THINKING_OF_YOU = [
  { name: "Nancy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy" },
  { name: "Leo", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo" },
  { name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
];

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

const JourneyFlow: React.FC<JourneyFlowProps> = ({ onClose }) => {
  const [view, setView] = useState<JourneyView>('main');
  const [isReading, setIsReading] = useState(false);
  const [sharingStep, setSharingStep] = useState<'select' | 'sending' | 'success'>('select');
  const [shareDestination, setShareDestination] = useState('');

  // Image Viewer State
  const [selectedMemory, setSelectedMemory] = useState<typeof TIMELINE_MEMORIES[0] | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleSpeak = async () => {
    if (isReading) {
      stopAudio();
      return;
    }

    setIsReading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const prompt = `Read this progress report to Grandma in a warm, loving voice: 
      "Wonderful job Grandma! You've been so busy. You've restored 12 of your old pictures and received 80 likes from the family. 
      Your grandson Tommy recently loved your 1960 wedding day photo. 
      Nancy, Leo, and Sarah are all thinking of you and smiling because of the memories you shared today. 
      We love you so much!"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm, female voice
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1
      );

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => {
        setIsReading(false);
      };

      audioSourceRef.current = source;
      source.start();
    } catch (error) {
      console.error("TTS Error:", error);
      setIsReading(false);
    }
  };

  const handleShareClick = () => {
    setView('sharing');
    setSharingStep('select');
  };

  const handleFinalShare = (dest: string) => {
    setShareDestination(dest);
    setSharingStep('sending');
    setTimeout(() => {
      setSharingStep('success');
    }, 1500);
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(x, 0), 100));
  };

  // Full Screen Sharing View
  if (view === 'sharing') {
    return (
      <div className="fixed inset-0 z-[600] bg-[#FDFBF7] flex flex-col font-['Plus_Jakarta_Sans'] select-none overflow-hidden animate-in fade-in slide-in-from-right duration-300">
        {sharingStep === 'select' && (
          <>
            <div className="px-8 pt-[calc(3rem+env(safe-area-inset-top))] pb-6 flex items-center justify-between">
              <button onClick={() => setView('main')} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#003366]">
                <ArrowLeft size={28} />
              </button>
              <h2 className="text-[2.25rem] font-black text-[#000000] uppercase tracking-tighter leading-none">
                SHARE THE JOY
              </h2>
              <div className="w-12" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-10">
              {/* Horizontal Preview Card */}
              <div className="mb-8">
                <div className="bg-white rounded-[2.5rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[1.75rem] overflow-hidden bg-gray-50 shrink-0 shadow-md">
                    <img
                      src={TIMELINE_MEMORIES[0].after}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    <span className="text-[#9CA3AF] font-black uppercase tracking-[0.2em] text-[12px] mb-1">PREVIEW</span>
                    <p className="text-[1.35rem] font-black text-[#003366] italic leading-tight line-clamp-2">
                      "Look at the joy you've created today!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Destination Buttons */}
              <div className="space-y-4">
                <p className="text-center text-[#CCCCCC] font-black uppercase tracking-[0.25em] text-[10px] mb-2">CHOOSE WHERE TO SEND:</p>

                {/* 1. iMessage (Green) */}
                <button
                  onClick={() => handleFinalShare('iMessage')}
                  className="w-full h-24 bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#128c7e] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                    <MessageSquare size={32} fill="white" className="text-white" />
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">IMESSAGE</span>
                </button>

                {/* 2. Facebook (Blue) */}
                <button
                  onClick={() => handleFinalShare('Facebook')}
                  className="w-full h-24 bg-[#1877F2] text-white rounded-[2rem] flex items-center justify-center gap-5 px-10 shadow-[0_8px_0_#0d52a8] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                    <Facebook size={32} fill="white" className="text-white" />
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">Facebook</span>
                </button>

                {/* 3. WhatsApp (Dark Green) */}
                <button
                  onClick={() => handleFinalShare('WhatsApp')}
                  className="w-full h-24 bg-[#075E54] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#043e37] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                    <MessageCircle size={32} fill="white" className="text-white" />
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">WhatsApp</span>
                </button>

                {/* 4. Twitter (Sky Blue) */}
                <button
                  onClick={() => handleFinalShare('Twitter')}
                  className="w-full h-24 bg-[#1DA1F2] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#0c85d0] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                    <Twitter size={32} fill="white" className="text-white" />
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">Twitter</span>
                </button>

                {/* 5. TikTok (Black) */}
                <button
                  onClick={() => handleFinalShare('TikTok')}
                  className="w-full h-24 bg-[#000000] text-white rounded-[2rem] flex items-center justify-center gap-6 px-10 shadow-[0_8px_0_#333333] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-active:scale-90 transition-transform">
                    <Music size={32} fill="white" className="text-white" />
                  </div>
                  <span className="text-3xl font-black uppercase tracking-tight">TikTok</span>
                </button>
              </div>
            </div>
          </>
        )}

        {sharingStep === 'sending' && (
          <div className="flex-1 bg-[#003366] flex flex-col items-center justify-center p-10">
            <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-12 relative">
              <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <Send size={64} className="text-white animate-bounce" />
            </div>
            <h2 className="text-5xl font-black text-white text-center">Sending to {shareDestination}...</h2>
          </div>
        )}

        {sharingStep === 'success' && (
          <div className="flex-1 bg-[#13EC13] flex flex-col items-center justify-center p-10 text-center">
            <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl">
              <Check size={100} strokeWidth={4} className="text-[#13EC13]" />
            </div>
            <h2 className="text-6xl font-black text-white mb-4 uppercase">Done!</h2>
            <button
              onClick={onClose}
              className="w-full bg-white text-[#13EC13] py-8 rounded-[2.5rem] text-4xl font-black shadow-[0_12px_0_#0fbc0f] uppercase"
            >
              Back To Home
            </button>
          </div>
        )}
      </div>
    );
  }

  // Main Journey View
  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none overflow-hidden animate-in slide-in-from-bottom duration-500">

      {/* Full Screen Image Slider Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-[800] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setSelectedMemory(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white active:bg-white/20 z-50"
          >
            <X size={32} strokeWidth={3} />
          </button>

          <div className="w-full max-w-lg space-y-6">
            <div className="text-center text-white mb-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">{selectedMemory.title}</h3>
              <p className="text-white/60 font-bold text-sm uppercase tracking-widest mt-1">Slide to compare</p>
            </div>

            <div
              className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 cursor-col-resize touch-none"
              onMouseMove={handleSliderMove}
              onTouchMove={handleSliderMove}
            >
              {/* After Image (Background) */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedMemory.after})` }}
              >
                <div className="absolute top-4 left-4 bg-[#13EC13] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Restored
                </div>
              </div>

              {/* Before Image (Clipped) */}
              <div
                className="absolute inset-0 bg-cover bg-center border-r-[3px] border-white/50"
                style={{
                  backgroundImage: `url(${selectedMemory.before})`,
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                }}
              >
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
                  Original
                </div>
              </div>

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-gray-300 rounded-full" />
                    <div className="w-1 h-4 bg-gray-300 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-bold uppercase tracking-widest animate-pulse">
              <ArrowLeft size={16} /> Slide Left / Right <ArrowLeft size={16} className="rotate-180" />
            </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between bg-white z-50 shrink-0 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-[#F0F4F8] rounded-full flex items-center justify-center text-[#003366] active:scale-90 transition-transform shadow-sm hover:bg-[#E5E9F0]"
          >
            <ArrowLeft size={28} strokeWidth={4} />
          </button>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-black text-[#003366] uppercase leading-none tracking-widest mb-0.5">MY LIFE</span>
            <span className="text-xl font-black text-[#003366] uppercase leading-none tracking-tighter">STORY</span>
          </div>
        </div>

        <button
          onClick={handleShareClick}
          className="bg-[#003366] text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all hover:bg-[#002244]"
        >
          <Share2 size={18} strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-widest">Share</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">

        <div className="bg-white px-8 pt-8 pb-6 relative z-50">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full border-[5px] border-[#FFB800] p-1 shadow-md bg-white shrink-0 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma" className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-[#003366] leading-[1.1]">
                Wonderful job Grandma!
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#FFF9E6] p-5 rounded-[2.5rem] border-[4px] border-[#FFB800] text-center shadow-[0_12px_30px_rgba(255,184,0,0.1)]">
              <div className="h-10 flex items-center justify-center mb-2">
                <Award className="text-[#FFB800]" size={36} />
              </div>
              <span className="block text-4xl font-black text-[#003366]">12</span>
              {/* Renamed to Pictures */}
              <span className="text-sm font-black uppercase text-[#8B6E1C] tracking-widest mt-1">Pictures</span>
            </div>
            <div className="bg-[#EBF2FF] p-5 rounded-[2.5rem] border-[4px] border-[#1152D4] text-center shadow-[0_12px_30px_rgba(17,82,212,0.1)]">
              <div className="h-10 flex items-center justify-center mb-2">
                <Heart className="text-[#1152D4]" size={36} fill="currentColor" />
              </div>
              <span className="block text-4xl font-black text-[#003366]">80</span>
              {/* Renamed to Like */}
              <span className="text-sm font-black uppercase text-[#1152D4] tracking-widest mt-1">Like</span>
            </div>
          </div>

          <button
            onClick={handleSpeak}
            className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase text-xl transition-all active:scale-95 mb-4 shadow-xl ${isReading ? 'bg-[#991b1b] text-white shadow-[#7f1d1d]' : 'bg-[#003366] text-white shadow-[#001a33]'}`}
          >
            {isReading ? <StopCircle size={32} fill="white" className="text-white" /> : <Volume2 size={32} fill="white" className="text-white" />}
            {isReading ? 'Stop Reading' : 'Listen to my progress'}
          </button>
        </div>

        <div className="px-8 pt-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-[#FFB800] rounded-full" />
            <h3 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Your Impact</h3>
          </div>

          <div className="space-y-12 relative pl-2">
            <div className="absolute left-[2.4rem] top-6 bottom-6 w-0.5 bg-gray-100 rounded-full" />

            {TIMELINE_MEMORIES.map((memory) => (
              <div key={memory.id} className="relative pl-14">
                <div className="absolute left-6 top-8 w-6 h-6 rounded-full border-4 border-white bg-[#FFB800] shadow-sm z-10" />

                <div className="bg-white rounded-[3rem] p-6 shadow-2xl border border-gray-50 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${memory.who}`} />
                    </div>
                    <p className="text-lg font-bold text-gray-600 leading-tight">
                      <span className="text-[#003366] font-black">{memory.who}</span> {memory.action}
                    </p>
                  </div>

                  {/* Clickable Image Container */}
                  <div
                    className="flex gap-3 h-48 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => {
                      setSliderPos(50); // Reset slider to middle
                      setSelectedMemory(memory);
                    }}
                  >
                    <div className="flex-1 rounded-2xl overflow-hidden relative shadow-inner">
                      <img src={memory.before} className="w-full h-full object-cover grayscale opacity-60" />
                      <div className="absolute bottom-3 left-3 bg-black/40 px-3 py-1 rounded-full text-[8px] text-white font-black uppercase tracking-widest">Before</div>
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden relative border-[3px] border-[#13EC13] shadow-md">
                      <img src={memory.after} className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 right-3 bg-[#13EC13] px-3 py-1 rounded-full text-[8px] text-white font-black uppercase tracking-widest shadow-lg">After</div>
                    </div>

                    {/* Visual cue for interactivity */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Hand size={20} className="text-[#003366]" />
                    </div>
                  </div>

                  <button
                    onClick={handleShareClick}
                    className="w-full bg-[#E6F0FF] py-4 rounded-full flex items-center justify-center gap-2 font-black text-[#003366] uppercase text-[11px] tracking-widest shadow-sm active:translate-y-1 transition-all border border-[#003366]/10 hover:bg-[#D1E5FF]"
                  >
                    <Share2 size={18} />
                    SHARE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-[#FFF9E6]/40 rounded-[3rem] p-8 border-2 border-dashed border-[#FFB800]/10 text-center mb-10 mx-8">
          <h3 className="text-xl font-black text-[#003366] mb-8 uppercase tracking-tight leading-snug">
            These people are smiling because of you
          </h3>
          <div className="flex justify-center gap-5">
            {THINKING_OF_YOU.map((person, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full border-[3px] border-white bg-white shadow-lg p-0.5 overflow-hidden">
                  <img src={person.avatar} className="w-full h-full rounded-full" alt={person.name} />
                </div>
                <span className="text-[10px] font-black text-[#003366] uppercase tracking-tighter">{person.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-20">
          <button
            onClick={handleShareClick}
            className="w-full bg-[#001A33] text-white p-2 rounded-[3rem] flex flex-col active:translate-y-2 active:shadow-none transition-all"
          >
            <div className="bg-[#1152D4] rounded-[2.8rem] py-8 flex flex-col items-center justify-center gap-4 shadow-[0_12px_0_#000a14]">
              <div className="w-16 h-12 bg-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg transform rotate-2">
                <Send size={32} fill="white" className="text-white transform -rotate-12" />
              </div>
              <span className="text-xl font-black uppercase tracking-[0.2em]">Share Summary</span>
            </div>
          </button>
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default JourneyFlow;