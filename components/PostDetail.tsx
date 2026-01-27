import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Send, Square, MessageSquare, Volume2, Loader2, StopCircle, Check, Share2, X, Heart } from 'lucide-react';
import { Post } from '../types';
import { GoogleGenAI } from "@google/genai";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onShare: (message: string) => void;
}

interface Comment {
  id: string;
  author: string;
  relationship: string;
  avatar: string;
  text: string;
  time: string;
}

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', author: 'Sarah', relationship: 'Granddaughter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', text: "Love you Grandpa! Looking so handsome in this park photo.", time: "Today" },
  { id: 'c2', author: 'Leo', relationship: 'Grandson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', text: "Look at those smiles! We should go back there next weekend.", time: "2 hours ago" },
  { id: 'c3', author: 'John', relationship: 'Son', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', text: "I remember this day clearly. Such a beautiful summer afternoon.", time: "Yesterday" },
  { id: 'c4', author: 'Mary', relationship: 'Daughter-in-law', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary', text: "The kids still talk about how much fun they had with you.", time: "2 days ago" },
  { id: 'c5', author: 'Michael', relationship: 'Son', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', text: "Thanks for sharing this, Dad. It made my whole morning!", time: "3 days ago" },
];

type VoiceState = 'idle' | 'recording' | 'finished';

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

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose, onShare }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [message, setMessage] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    setIsReadingLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const commentsText = MOCK_COMMENTS.map(c => `${c.author} said: ${c.text}`).join(". ");
      const prompt = `Read this memory page for me clearly and warmly. Title: ${post.title}. Now, here are 5 messages from your family: ${commentsText}`;
      
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
      setIsReadingLoading(false);
    }
  };

  const triggerVibration = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleVoiceToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice transcription is not supported in this browser.");
      return;
    }

    if (voiceState === 'recording') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      triggerVibration([50, 50]);
      setVoiceState('finished');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setVoiceState('recording');
      setMessage(""); 
      triggerVibration(50);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setMessage(currentTranscript);
    };

    recognition.onerror = () => {
      setVoiceState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = () => {
    if (message.trim()) {
      setIsSent(true);
      triggerVibration([100, 50, 100]);
      setTimeout(() => {
        onClose();
        setReplyingTo(null);
      }, 3000);
    }
  };

  const toggleCommentLike = (id: string) => {
    setLikedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    triggerVibration(50);
  };

  const handleCommentReply = (comment: Comment) => {
    setReplyingTo(comment);
    handleVoiceToggle();
  };

  const closeOverlay = () => {
    setVoiceState('idle');
    setReplyingTo(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* Sent Success Overlay */}
      {isSent && (
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
        <div className="fixed inset-0 z-[550] bg-black/60 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[3.5rem] p-10 space-y-10 animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_100px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center">
               <span className="text-sm font-black text-gray-400 uppercase tracking-widest">
                 {voiceState === 'recording' 
                   ? (replyingTo ? `Replying to ${replyingTo.author}...` : 'I am listening...') 
                   : 'Ready to send?'}
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
              <p className={`text-4xl font-black italic leading-tight ${voiceState === 'recording' ? 'text-[#1152D4]' : message ? 'text-[#003366]' : 'text-gray-300'}`}>
                {message || (voiceState === 'recording' ? "..." : "Tap the Mic below")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 pb-8">
               <div className="flex flex-col items-center gap-5">
                  <button 
                    onClick={handleVoiceToggle}
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
                    {voiceState === 'recording' ? 'Tap to Stop' : 'Tap to Try Again'}
                  </span>
               </div>

               {message && voiceState !== 'recording' && (
                 <button 
                   onClick={handleSend}
                   className="w-full h-36 bg-[#059669] text-white rounded-[3rem] flex items-center justify-center gap-6 shadow-[0_15px_0_#064e3b] active:translate-y-2 active:shadow-none transition-all border-4 border-white animate-in zoom-in duration-300"
                 >
                   <Send size={48} fill="white" />
                   <span className="text-4xl font-black uppercase tracking-tighter">
                     {replyingTo ? 'SEND REPLY' : 'SEND TO FAMILY'}
                   </span>
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Area */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-white z-50 shrink-0 border-b border-gray-50">
        <button 
          onClick={onClose}
          className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-[#003366] active:scale-90 transition-transform shadow-sm"
        >
          <ArrowLeft size={44} strokeWidth={4} />
        </button>
        
        <span className="text-2xl font-black text-[#003366] uppercase tracking-tight">Memory Details</span>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onShare(post.title); }}
          className="bg-[#003366] text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all border-2 border-white"
        >
          <Share2 size={24} strokeWidth={3} />
          <span className="text-sm font-black uppercase tracking-tight">Share</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar bg-[#F6F6F8]"
      >
        
        {/* 2. Feature Image Area */}
        <div className="relative w-full h-[38vh] bg-gray-200 overflow-hidden shadow-inner">
          <img 
            src={post.imageUrl} 
            className="w-full h-full object-cover" 
            alt={post.title} 
          />
        </div>

        {/* 3. Horizontal Large Action Buttons Row */}
        <div className="flex gap-4 px-6 mt-6">
          {/* READ TO ME Button */}
          <button 
            onClick={handleReadToMe}
            className={`flex-1 h-32 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none font-black uppercase tracking-tighter
              ${isReading 
                ? 'bg-[#991b1b] text-white shadow-[0_8px_0_#7f1d1d]' 
                : 'bg-[#003366] text-white shadow-[0_8px_0_#001a33]'}`}
          >
            {isReadingLoading ? (
              <Loader2 className="animate-spin" size={32} />
            ) : isReading ? (
              <>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <StopCircle size={30} fill="white" />
                </div>
                <span className="text-lg">STOP</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Volume2 size={30} fill="white" />
                </div>
                <span className="text-lg">LISTEN</span>
              </>
            )}
          </button>

          {/* TAP TO REPLY Button */}
          <button 
            onClick={handleVoiceToggle}
            className={`flex-1 h-32 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none font-black uppercase tracking-tighter bg-[#1152D4] text-white shadow-[0_8px_0_#0a3791]`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Mic size={30} fill="white" />
            </div>
            <span className="text-lg whitespace-nowrap">REPLY</span>
          </button>
        </div>

        <div className="px-8 py-10 space-y-14 pb-52">
          
          {/* 4. Memory Title Area */}
          <div className="mt-2">
            <h2 className="text-[36px] font-black text-black leading-[1.1] tracking-tight">
              {post.title}
            </h2>
          </div>

          {/* 5. Family Messages List */}
          <section className="space-y-10">
            <div className="flex items-center gap-5 px-6 py-4 bg-gray-100 rounded-[2rem] w-fit shadow-sm">
              <MessageSquare size={44} className="text-[#003366]" fill="#003366" fillOpacity={0.1} />
              <h3 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">5 MESSAGES</h3>
            </div>

            <div className="flex flex-col gap-8">
              {MOCK_COMMENTS.map((comment) => (
                <div 
                  key={comment.id} 
                  className="bg-white p-8 rounded-[3.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-6 active:scale-[0.99] transition-transform"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-4 border-white shadow-md shrink-0">
                      <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-[#003366]">{comment.author}</span>
                      </div>
                      <p className="text-[28px] font-medium text-gray-700 leading-[1.6] break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>

                  {/* Like and Voice Reply Actions */}
                  <div className="flex gap-3 mt-2 pl-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleCommentLike(comment.id); }}
                      className={`h-16 px-8 rounded-full flex items-center gap-3 font-black text-lg transition-all active:scale-95 
                        ${likedComments[comment.id] ? 'bg-red-50 text-red-500 ring-2 ring-red-100' : 'bg-gray-100 text-gray-500'}`}
                    >
                      <Heart size={28} fill={likedComments[comment.id] ? "currentColor" : "none"} strokeWidth={3} />
                      <span>{likedComments[comment.id] ? 'Liked' : 'Like'}</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCommentReply(comment); }}
                      className="h-16 px-8 rounded-full bg-blue-50 text-[#1152D4] flex items-center gap-3 font-black text-lg transition-all active:scale-95 hover:bg-blue-100"
                    >
                      <Mic size={28} strokeWidth={3} />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PostDetail;