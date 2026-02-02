import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, Heart, Share2, Award, Send, Facebook, MessageCircle, Check, ArrowLeft, StopCircle, MessageSquare, Twitter, Music, Hand } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import GuardianButton from './GuardianButton';
import SectionTitle from './SectionTitle';
import { PhotoRestoration, getRestorationList } from '@/services/phoneApi';

interface JourneyFlowProps {
  onClose: () => void;
}

type JourneyView = 'main' | 'sharing';

const TIMELINE_MEMORIES: any[] = [
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
  const [timelineMemories, setTimelineMemories] = useState<any[]>([]);
  // Image Viewer State
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const list = await getRestorationList();
        console.log("list", list);
        const mappedList = list.map(item => ({
          ...item,
          who: "Me",
          action: "restored this photo",
          title: item.description || "Restored Memory",
          before: item.originalUrl,
          after: item.fixedUrl || item.originalUrl
        }));
        setTimelineMemories(mappedList);
      } catch (error) {
        console.error("Failed to fetch timeline memories:", error);
      }
    };
    fetchMemories();
  }, []);

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
      <div className="fixed inset-0 z-[600] bg-[#F5F7F9] flex flex-col font-sans select-none overflow-hidden animate-in fade-in slide-in-from-right duration-300">
        {sharingStep === 'select' && (
          <>
            <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('main')}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-transform -ml-2"
                >
                  <ArrowLeft size={28} className="text-gray-900" strokeWidth={3} />
                </button>
                <h2 className="text-gray-900 font-heading text-2xl font-bold tracking-tight whitespace-nowrap">SHARE THE JOY</h2>
              </div>
              <div className="w-12" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-10 space-y-4">
              {/* Horizontal Preview Card */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <img
                    src={timelineMemories[0]?.after || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop"}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <span className="text-gray-500 font-bold font-heading uppercase tracking-wider text-xs mb-1">PREVIEW</span>
                  <p className="text-lg font-bold font-heading text-guardian-blue italic leading-snug line-clamp-2">
                    "Look at the joy you've created today!"
                  </p>
                </div>
              </div>

              {/* Destination Buttons */}
              <div>
                <p className="text-center text-gray-400 font-bold font-heading uppercase tracking-widest text-xs mb-4">CHOOSE WHERE TO SEND:</p>
                <div className="space-y-3">

                  {/* 1. iMessage */}
                  <button
                    onClick={() => handleFinalShare('iMessage')}
                    className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <MessageSquare size={18} fill="white" className="text-white" />
                    </div>
                    <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">iMessage</span>
                  </button>

                  {/* 2. Facebook */}
                  <button
                    onClick={() => handleFinalShare('Facebook')}
                    className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <Facebook size={18} fill="white" className="text-white" />
                    </div>
                    <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">Facebook</span>
                  </button>

                  {/* 3. WhatsApp */}
                  <button
                    onClick={() => handleFinalShare('WhatsApp')}
                    className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <MessageCircle size={18} fill="white" className="text-white" />
                    </div>
                    <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">WhatsApp</span>
                  </button>

                  {/* 4. Twitter */}
                  <button
                    onClick={() => handleFinalShare('Twitter')}
                    className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <Twitter size={18} fill="white" className="text-white" />
                    </div>
                    <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">Twitter</span>
                  </button>

                  {/* 5. TikTok */}
                  <button
                    onClick={() => handleFinalShare('TikTok')}
                    className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <Music size={18} fill="white" className="text-white" />
                    </div>
                    <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">TikTok</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {sharingStep === 'sending' && (
          <div className="flex-1 bg-guardian-blue flex flex-col items-center justify-center p-10">
            <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-12 relative">
              <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <Send size={64} className="text-white animate-bounce" />
            </div>
            <h2 className="text-4xl font-black font-heading text-white text-center">Sending to {shareDestination}...</h2>
          </div>
        )}

        {sharingStep === 'success' && (
          <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 z-[800] text-center animate-in zoom-in-95 duration-500">
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
              <Check size={96} strokeWidth={5} className="text-guardian-blue" />
            </div>
            <h2 className="text-4xl font-bold font-heading text-guardian-blue mb-4 uppercase tracking-tight">Good News!</h2>
            <p className="text-xl text-gray-500 font-medium mb-12 px-6 leading-relaxed max-w-md">
              Your family will love this! ❤️
            </p>
            <button
              onClick={onClose}
              className="w-full max-w-sm h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              Finish
            </button>
          </div>
        )}
      </div>
    );
  }

  // Main Journey View
  return (
    <div className="fixed inset-0 z-[500] bg-[#F5F7F9] flex flex-col font-sans select-none overflow-hidden animate-in slide-in-from-bottom duration-500">

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
              <h3 className="text-3xl font-bold font-heading uppercase tracking-tight">{selectedMemory.title}</h3>
              <p className="text-white/60 font-medium font-heading text-base uppercase tracking-widest mt-1">Slide to compare</p>
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
                <div className="absolute top-4 left-4 bg-guardian-blue text-white text-sm font-bold font-heading px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
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
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm font-bold font-heading px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
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

            <div className="flex items-center justify-center gap-3 text-white/50 text-base font-bold font-heading uppercase tracking-widest animate-pulse">
              <ArrowLeft size={20} /> Slide Left / Right <ArrowLeft size={20} className="rotate-180" />
            </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-transform -ml-2"
          >
            <ArrowLeft size={28} className="text-gray-900" strokeWidth={3} />
          </button>

          <h2 className="text-gray-900 font-heading text-2xl font-bold tracking-tight whitespace-nowrap">Life Story</h2>
        </div>
        {
          timelineMemories.length > 0 && (
            <button
              onClick={handleShareClick}
              className="bg-guardian-blue text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Share2 size={18} strokeWidth={3} />
              <span className="text-sm font-black font-heading uppercase tracking-widest">Share</span>
            </button>
          )
        }
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-6">

        <div className="bg-white rounded-xl border border-gray-200 p-6 mx-6 mb-6 shadow-sm relative z-50">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full border-[5px] border-white ring-4 ring-gray-100 p-1 shadow-md bg-white shrink-0 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma" className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col">
                <span className="text-xl font-bold font-heading text-gray-500 uppercase tracking-wide">Wonderful job,</span>
                <span className="text-3xl font-black font-heading text-gray-900 leading-none">Grandma!</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="h-10 flex items-center justify-center mb-2">
                <Award className="text-guardian-blue" size={36} />
              </div>
              <span className="block text-4xl font-black font-heading text-gray-900">12</span>
              {/* Renamed to Pictures */}
              <span className="text-sm font-black font-heading uppercase text-gray-500 tracking-widest mt-1">Pictures</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="h-10 flex items-center justify-center mb-2">
                <Heart className="text-guardian-blue" size={36} fill="currentColor" />
              </div>
              <span className="block text-4xl font-black font-heading text-gray-900">80</span>
              {/* Renamed to Like */}
              <span className="text-sm font-black font-heading uppercase text-guardian-blue tracking-widest mt-1">Like</span>
            </div>
          </div>

          <button
            onClick={handleSpeak}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold font-heading uppercase text-sm tracking-wide shadow-sm active:translate-y-0.5 transition-all border mb-4
              ${isReading
                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                : 'bg-[#F5F9FF] text-guardian-blue border-blue-100 hover:bg-blue-50'
              }`}
          >
            {isReading ? <StopCircle size={18} /> : <Volume2 size={18} />}
            {isReading ? 'Stop Reading' : 'Listen to my progress'}
          </button>
        </div>

        <div className="px-6 pt-8">
          <SectionTitle className="ml-0">Your Impact</SectionTitle>

          <div className="space-y-6 relative">
            {/* Journey Line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200" />

            {timelineMemories.map((memory) => (
              <div key={memory.id} className="relative z-10">

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${memory.who}`} />
                    </div>
                    <div>
                      <p className="font-bold font-heading text-xl text-gray-900">{memory.who}</p>
                      <p className="text-xs text-gray-500">{memory.action}</p>
                    </div>
                  </div>

                  {/* Clickable Image Container */}
                  <div
                    className="flex gap-3 h-48 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => {
                      setSliderPos(50); // Reset slider to middle
                      setSelectedMemory(memory);
                    }}
                  >
                    <div className="flex-1 rounded-xl overflow-hidden relative shadow-sm border border-gray-200">
                      <img src={memory.before} className="w-full h-full object-cover grayscale opacity-60" />
                      <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-bold font-heading uppercase tracking-wide">Before</div>
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden relative shadow-sm border border-gray-200">
                      <img src={memory.after} className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 right-3 bg-guardian-blue px-2 py-1 rounded text-xs text-white font-bold font-heading uppercase tracking-wide shadow-sm">After</div>
                    </div>

                    {/* Visual cue for interactivity */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Hand size={20} className="text-guardian-blue" />
                    </div>
                  </div>

                  <button
                    onClick={handleShareClick}
                    className="w-full bg-[#F5F9FF] py-3 rounded-xl flex items-center justify-center gap-2 font-bold font-heading text-guardian-blue uppercase text-sm tracking-wide shadow-sm active:translate-y-0.5 transition-all border border-blue-100 hover:bg-blue-50"
                  >
                    <Share2 size={18} />
                    SHARE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 text-center mb-10 mx-6 shadow-sm">
          <h3 className="text-xl font-bold font-heading text-gray-900 mb-6 leading-snug">
            These people are smiling because of you
          </h3>
          <div className="flex justify-center gap-5">
            {THINKING_OF_YOU.map((person, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-gray-200 shadow-sm overflow-hidden">
                  <img src={person.avatar} className="w-full h-full object-cover" alt={person.name} />
                </div>
                <span className="text-sm font-bold font-heading text-gray-700">{person.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-20">
          <button
            onClick={handleShareClick}
            className="w-full"
          >
            <div className="bg-guardian-blue rounded-xl py-4 flex items-center justify-center gap-4 shadow-lg active:scale-95 transition-all">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Send size={20} fill="white" className="text-white" />
              </div>
              <span className="text-lg font-bold font-heading text-white uppercase tracking-wide">Share Summary</span>
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