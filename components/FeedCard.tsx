import React, { useState, useRef, useEffect } from 'react';
import { Mic, Share2, Heart, Loader2, StopCircle, Volume2, Square, Send, ArrowRight, X, Sparkles, MessageSquare, Check } from 'lucide-react';
import { Post } from '../types';
import GuardianButton from './GuardianButton';
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

  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
    triggerVibration(50);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-transform active:scale-[0.98] relative"
      >
        <div className="aspect-square relative overflow-hidden group">
          <img
            src={post.imageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt={post.title}
          />
          <div className="absolute top-6 left-6 bg-black/50 text-white px-4 py-1.5 rounded-full font-bold font-heading text-sm">
            Today
          </div>

          {/* Updated Like Button: Heart Shape with Count */}
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
              <span className={`absolute inset-0 flex items-center justify-center font-bold font-sans text-white pt-1 ${likeCount > 0 ? 'text-2xl' : 'text-xs tracking-widest'}`}>
                {likeCount > 0 ? likeCount : 'LIKE'}
              </span>
            </div>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold font-heading text-xl text-gray-900">{post.title}</h3>
            <p className="text-xs text-gray-500">Sent by {post.author} today</p>
          </div>

          <div className="flex gap-4 pt-2">
            {/* Main Action Button */}
            <GuardianButton
              onClick={isNews ? handleReadToMe : handleReplyClick}
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
                  {isNews ? <Volume2 size={24} className="text-white" /> : <MessageSquare size={24} className="text-white" />}
                  <span className="text-lg text-white">
                    {isNews ? 'LISTEN' : 'REPLY'}
                  </span>
                </>
              )}
            </GuardianButton>

            {/* SHARE Button */}
            <GuardianButton
              onClick={(e) => { e.stopPropagation(); if (onShare) onShare(aiReply || post.title); }}
              className="flex-1 h-20 !rounded-2xl !bg-white !shadow-sm border border-gray-200 active:scale-95 transition-transform"
            >
              <Share2 size={24} className="text-guardian-blue" />
              <span className="text-lg text-guardian-blue">SHARE</span>
            </GuardianButton>
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
          <h2 className="text-[5rem] font-black font-heading text-white mb-6 uppercase tracking-tighter">SENT!</h2>
          <p className="text-3xl text-white font-bold font-heading px-8 leading-tight">Your family will see your message! ❤️</p>
        </div>
      )}

      {/* Recording / Review Overlay Panel - Standardized */}
      {(voiceState === 'recording' || voiceState === 'finished') && (
        <div className="fixed inset-0 z-[550] bg-black/60 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-t-[2.5rem] p-6 space-y-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold font-heading text-gray-900">
                {voiceState === 'recording' ? "I'm Listening..." : "Ready to Send?"}
              </span>
              <button
                onClick={closeOverlay}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 active:scale-90 hover:bg-gray-200"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className={`p-6 rounded-xl border min-h-[160px] flex items-center justify-center text-center transition-all shadow-sm
              ${voiceState === 'recording' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
            >
              <p className={`text-lg font-medium leading-relaxed ${voiceState === 'recording' ? 'text-guardian-blue' : aiReply ? 'text-gray-900' : 'text-gray-400'}`}>
                {aiReply || (voiceState === 'recording' ? "..." : "Tap the Mic below to start recording")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 pb-6">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={(e) => handleVoiceToggle(e)}
                  className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(26,95,122,0.3)] transition-all transform hover:scale-105 active:scale-95
                      ${voiceState === 'recording'
                      ? 'bg-[#E57C23] animate-pulse'
                      : 'bg-gradient-to-tr from-[#1A5F7A] to-[#548CA8]'}`}
                >
                  {voiceState === 'recording' ? (
                    <Square size={40} fill="white" className="text-white" />
                  ) : (
                    <Mic size={48} className="text-white" />
                  )}
                </button>
                <span className={`text-sm font-bold font-heading uppercase tracking-widest ${voiceState === 'recording' ? 'text-[#E57C23]' : 'text-[#1A5F7A]'}`}>
                  {voiceState === 'recording' ? 'TAP TO STOP' : 'TAP TO TRY AGAIN'}
                </span>
              </div>

              {aiReply && voiceState !== 'recording' && (
                <GuardianButton
                  onClick={handleSendReply}
                  className="w-full h-16 !bg-guardian-blue rounded-2xl shadow-lg active:translate-y-1 active:shadow-md border-0 gap-3"
                >
                  <Send size={24} fill="white" />
                  <span className="text-xl font-bold font-heading uppercase tracking-tight text-white">
                    SEND TO FAMILY
                  </span>
                </GuardianButton>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedCard;