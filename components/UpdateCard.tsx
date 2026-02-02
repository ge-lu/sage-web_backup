import React, { useState, useRef, useEffect } from 'react';
import { Mic, Share2, Loader2, Volume2, Square, MessageSquare, Check, X, Send, Heart, RotateCcw } from 'lucide-react';
import { FamilyMemberUpdate } from '../types';
import GuardianButton from './GuardianButton';
import { GoogleGenAI } from "@google/genai";

interface UpdateCardProps {
  update: FamilyMemberUpdate;
  onShare?: (message: string) => void;
  onClick?: () => void;
  customTitle?: string;
  onLike?: (liked: boolean) => void;
  showLikedLabel?: boolean;
  likedByName?: string;
  onMessageSent?: (message: string) => void;
  displayMessage?: string;
  showSendBy?: boolean;
  messageButtonText?: string;
  onMessageButtonClick?: () => void;
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

const UpdateCard: React.FC<UpdateCardProps> = ({ update, onShare, onClick, customTitle, onLike, showLikedLabel, likedByName, onMessageSent, displayMessage, showSendBy, messageButtonText, onMessageButtonClick }) => {
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
    if (onMessageSent && aiReply) {
      onMessageSent(aiReply);
    }
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
    const newLikedState = !liked;
    setLiked(newLikedState);
    if (onLike) {
      onLike(newLikedState);
    }
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

          {/* Location and Temperature - Top Right */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-3">
            <div className="flex items-center gap-1 text-white font-medium font-heading text-sm drop-shadow-lg">
              <span className="material-symbols-outlined !text-sm">location_on</span>
              <span>{update.location}</span>
            </div>
            <div className="text-white font-bold font-heading text-5xl drop-shadow-lg">
              {update.temperature}℃
            </div>
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

        {/* Display Message Below Image */}
        {displayMessage && (
          <div className="px-8 pt-6 pb-2 space-y-1">
            <p className="text-base text-gray-900 font-medium break-words">
              {displayMessage}
            </p>
            {showSendBy && (
              <p className="text-xs text-gray-500 font-medium">
                Send by
              </p>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold font-heading text-xl text-gray-900">
              {customTitle || `Lovely weather for ${displayName}!`}
            </h3>
            {showSendBy && (
              <p className="text-xs text-gray-500 font-medium">
                Send by {displayName}
              </p>
            )}
            {showLikedLabel && likedByName && (
              <div className="inline-flex items-center gap-2 bg-[#FFD700] text-gray-900 px-4 py-2 rounded-full font-bold font-heading text-sm shadow-md">
                <span className="text-lg">⭐</span>
                <span>{likedByName} Liked This</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            {/* Main Action Button */}
            <GuardianButton
              onClick={onMessageButtonClick || (update.actionType === 'voice' ? handleMessageClick : handleReadToMe)}
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
                    {messageButtonText || 'MESSAGE'}
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
          <div className="bg-white rounded-t-[2.5rem] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl mb-[calc(6rem+env(safe-area-inset-bottom))]">
            <div className="p-6 space-y-6 pb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold font-heading text-gray-900">
                  {voiceState === 'recording' ? "Recording Message..." : "Ready to Send?"}
                </span>
                <button
                  onClick={closeOverlay}
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 active:scale-90 hover:bg-gray-200"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className={`p-6 rounded-xl border min-h-[140px] flex items-center justify-center text-center transition-all shadow-sm
                ${voiceState === 'recording' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <p className={`text-lg font-medium leading-relaxed ${voiceState === 'recording' ? 'text-guardian-blue' : aiReply ? 'text-gray-900' : 'text-gray-400'}`}>
                  {aiReply || (voiceState === 'recording' ? "..." : `Say something to ${displayName}...`)}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 pb-4">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={(e) => handleVoiceToggle(e)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(26,95,122,0.3)] transition-all transform hover:scale-105 active:scale-95
                      ${voiceState === 'recording'
                      ? 'bg-[#E57C23] animate-pulse'
                      : 'bg-gradient-to-tr from-[#1A5F7A] to-[#548CA8]'}`}
                >
                  {voiceState === 'recording' ? (
                    <Square size={32} fill="white" className="text-white" />
                  ) : (
                    <Mic size={36} className="text-white" />
                  )}
                </button>
                <span className={`text-sm font-bold font-heading uppercase tracking-widest ${voiceState === 'recording' ? 'text-[#E57C23]' : 'text-[#1A5F7A]'}`}>
                  {voiceState === 'recording' ? 'TAP TO STOP' : 'TAP TO TRY AGAIN'}
                </span>
              </div>

              <div className="w-full flex gap-4">
                 <button
                  onClick={handleRetry}
                  className="flex-1 h-16 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-600 font-bold font-heading text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <RotateCcw size={20} />
                  RETRY
                </button>

                {aiReply && voiceState !== 'recording' && (
                  <GuardianButton
                    onClick={handleSendReply}
                    className="flex-[2] h-16 !bg-guardian-blue rounded-2xl shadow-lg active:translate-y-1 active:shadow-md border-0 gap-3"
                  >
                    <Send size={24} fill="white" />
                    <span className="text-xl font-bold font-heading uppercase tracking-tight text-white">
                      SEND
                    </span>
                  </GuardianButton>
                )}
                </div>
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
