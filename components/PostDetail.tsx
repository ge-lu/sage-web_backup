import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Send, Square, MessageSquare, Volume2, Loader2, StopCircle, Check, Share2, X, Heart, RotateCcw, Trash2 } from 'lucide-react';
import { Post } from '../types';
import { GoogleGenAI } from "@google/genai";
import GuardianButton from './GuardianButton';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onShare: (message: string) => void;
  initialScrollId?: string;
  onNewComment?: (comment: Comment) => void;
}

export interface Comment {
  id: string;
  author: string;
  relationship: string;
  avatar: string;
  text: string;
  time: string;
  replies?: Comment[];
  replyTo?: string; // 回复的对象（作者名字）
  likes: number;
}

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c0', author: 'Me', relationship: 'You', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me', text: "ni Hong Kong", time: "Just now", likes: 1, replyTo: 'Sarah' },
  { id: 'c1', author: 'Sarah', relationship: 'Granddaughter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', text: "Love you Grandpa! Looking so handsome in this park photo.", time: "Today", likes: 12 },
  { id: 'c2', author: 'Leo', relationship: 'Grandson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', text: "Look at those smiles! We should go back there next weekend.", time: "2 hours ago", likes: 5 },
  { id: 'c3', author: 'John', relationship: 'Son', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', text: "I remember this day clearly. Such a beautiful summer afternoon.", time: "Yesterday", likes: 8 },
  { id: 'c4', author: 'Mary', relationship: 'Daughter-in-law', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary', text: "The kids still talk about how much fun they had with you.", time: "2 days ago", likes: 3 },
  { id: 'c5', author: 'Michael', relationship: 'Son', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', text: "Thanks for sharing this, Dad. It made my whole morning!", time: "3 days ago", likes: 15 },
];

const POST_LIKERS = [
  { name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { name: 'John', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { name: 'Mary', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary' },
  { name: 'Leo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { name: 'Michael', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
];

const ALL_LIKERS = [
  ...POST_LIKERS,
  { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { name: 'Charlie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
  { name: 'David', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { name: 'Eve', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve' },
  { name: 'Frank', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' },
  { name: 'Grace', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace' },
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

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose, onShare, initialScrollId, onNewComment }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [message, setMessage] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sage-liked-comments');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sage-liked-comments', JSON.stringify(likedComments));
  }, [likedComments]);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [showEarlierMessages, setShowEarlierMessages] = useState<Record<string, boolean>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLikesDrawer, setShowLikesDrawer] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const simulateReplyTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 用于跟踪模拟回复的setTimeout

  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (initialScrollId) {
      const timer = setTimeout(() => {
        const element = commentRefs.current[initialScrollId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add a flash effect or temporary highlight if desired
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialScrollId]);

  // 当replyingTo状态变化时，清除所有待执行的模拟回复setTimeout
  useEffect(() => {
    if (replyingTo) {
      // 当开始回复时，清除所有待执行的模拟回复setTimeout
      if (simulateReplyTimeoutRef.current) {
        clearTimeout(simulateReplyTimeoutRef.current);
        simulateReplyTimeoutRef.current = null;
      }
    }
  }, [replyingTo]);

  // 组件卸载时清除模拟回复的setTimeout
  useEffect(() => {
    return () => {
      if (simulateReplyTimeoutRef.current) {
        clearTimeout(simulateReplyTimeoutRef.current);
        simulateReplyTimeoutRef.current = null;
      }
    };
  }, []);

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
      const commentsText = comments.map(c => `${c.author} said: ${c.text}`).join(". ");
      const prompt = `Read this memory page for me clearly and warmly. Title: ${post.title}. Now, here are ${comments.length} messages from your family: ${commentsText}`;

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
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setMessage(finalTranscript + interimTranscript);
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
    setMessage('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          setMessage('');
          if (recognitionRef.current) recognitionRef.current.start();
        }, 300);
      } catch (e) {
        try { recognitionRef.current.start(); } catch (err) { }
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    setTouchCurrentY(currentY);
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchCurrentY !== null) {
      const deltaY = touchCurrentY - touchStartY;
      // 如果下滑超过 100px，关闭弹窗
      if (deltaY > 100) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setVoiceState('idle');
        setMessage("");
        setReplyingTo(null);
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  const handleSend = () => {
    if (message.trim()) {
      const replyId = `reply-${Date.now()}`;
      const isReplying = !!replyingTo; // 保存当前是否是回复状态
      const newReply: Comment = {
        id: replyId,
        author: 'Me',
        relationship: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
        text: message.trim(),
        time: 'Just now',
        replies: [],
        likes: 0
      };

      // 清除之前可能存在的模拟回复setTimeout
      if (simulateReplyTimeoutRef.current) {
        clearTimeout(simulateReplyTimeoutRef.current);
        simulateReplyTimeoutRef.current = null;
      }

      if (replyingTo) {
        // 如果是回复某个评论，作为新的 Comment Card 添加到列表顶部（第一个位置）
        // 而不是作为嵌套回复
        
        // 清除所有待执行的模拟回复setTimeout
        if (simulateReplyTimeoutRef.current) {
          clearTimeout(simulateReplyTimeoutRef.current);
          simulateReplyTimeoutRef.current = null;
        }
        
        // 标记这是回复谁的
        newReply.replyTo = replyingTo.author;
        
        // 移除所有可能已经添加的模拟回复（通过检查id是否以"comment-to-me"开头）
        // 然后添加"Me"的回复到列表顶部
        setComments(prev => {
          const filteredComments = prev.filter(comment => !comment.id.startsWith('comment-to-me'));
          return [newReply, ...filteredComments];
        });
        
        // 直接返回，不执行后续的模拟回复逻辑
        setIsSent(true);
        triggerVibration([100, 50, 100]);
        setMessage("");
        setReplyingTo(null);
        setVoiceState('idle');
        setTimeout(() => {
          setIsSent(false);
        }, 3000);
        return; // 提前返回，避免执行else分支
      } else {
        // 如果不是回复，作为新评论添加到列表顶部（作为新的 Comment Card，显示在第一个位置）
        setComments(prev => [newReply, ...prev]);
        
        // 模拟其他评论者回复"Me"的新评论
        // 延迟一段时间后，添加一个新评论
        // 只有在不是回复的情况下才执行此逻辑
        if (onNewComment) {
          simulateReplyTimeoutRef.current = setTimeout(() => {
            setComments(prev => {
              if (prev.length > 0) {
                const randomCommenter = prev[Math.floor(Math.random() * prev.length)];
                const replyComment: Comment = {
                  id: `comment-to-me-${Date.now()}`,
                  author: randomCommenter.author,
                  relationship: randomCommenter.relationship,
                  avatar: randomCommenter.avatar,
                  text: `Great post! I also wanted to share my thoughts about "${post.title}".`,
                  time: 'Just now',
                  likes: 0
                };
                // 添加到评论列表
                if (onNewComment) {
                  onNewComment(replyComment);
                }
                return [replyComment, ...prev];
              }
              return prev;
            });
            simulateReplyTimeoutRef.current = null;
          }, 3000);
        }
      }

      setIsSent(true);
      triggerVibration([100, 50, 100]);
      setMessage("");
      setReplyingTo(null);
      setVoiceState('idle');

      setTimeout(() => {
        setIsSent(false);
      }, 2000);
    }
  };

  const toggleCommentLike = (id: string) => {
    setLikedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    triggerVibration(50);
  };

  const handleDeleteClick = (id: string) => {
    setCommentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      setComments(prev => prev.filter(c => c.id !== commentToDelete));
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
      triggerVibration(50);
    }
  };

  const handleCommentReply = (comment: Comment) => {
    // 清除之前可能存在的模拟回复setTimeout，避免在回复时添加模拟回复
    if (simulateReplyTimeoutRef.current) {
      clearTimeout(simulateReplyTimeoutRef.current);
      simulateReplyTimeoutRef.current = null;
    }
    setReplyingTo(comment);
    handleVoiceToggle();
  };

  const closeOverlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVoiceState('idle');
    setReplyingTo(null);
    setMessage("");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none overflow-hidden animate-in fade-in duration-300">

      {/* Sent Success Overlay */}
      {/* Sent Success Toast - Top Popup */}
      <div 
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[700] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-green-100 rounded-full px-6 py-3 flex items-center gap-3 transition-all duration-500 ease-out transform ${
          isSent ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-gray-900 font-bold text-base pr-1 whitespace-nowrap">Message sent</span>
      </div>

      {/* Recording / Review Overlay Panel */}
      {(voiceState === 'recording' || voiceState === 'finished') && (
        <div className="fixed inset-0 z-[550] bg-black/60 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div
            className="bg-white rounded-t-[2.5rem] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl mb-[calc(6rem+env(safe-area-inset-bottom))]"
            style={{
              transform: touchCurrentY !== null && touchStartY !== null && touchCurrentY > touchStartY
                ? `translateY(${touchCurrentY - touchStartY}px)`
                : 'translateY(0)',
              transition: touchStartY === null ? 'transform 0.3s ease-out' : 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="p-6 space-y-6 pb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold font-heading text-gray-900">
                  {voiceState === 'recording' ? (replyingTo ? `Replying to ${replyingTo.author}...` : "Recording Message...") : "Ready to Send?"}
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
                <p className={`text-lg font-medium leading-relaxed ${voiceState === 'recording' ? 'text-guardian-blue' : message ? 'text-gray-900' : 'text-gray-400'}`}>
                  {message || (voiceState === 'recording' ? "..." : `Say something${replyingTo ? ` to ${replyingTo.author}` : ''}...`)}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 pb-4">
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleVoiceToggle}
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
                  {voiceState !== 'recording' && (
                    <span className={`text-sm font-bold font-heading uppercase tracking-widest text-[#1A5F7A]`}>
                      TAP TO TRY AGAIN
                    </span>
                  )}
                </div>

                <div className="w-full flex gap-4">
                  <button
                    onClick={handleRetry}
                    className="flex-1 h-16 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-600 font-bold font-heading text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <RotateCcw size={20} />
                    RETRY
                  </button>

                  {message && voiceState !== 'recording' && (
                    <GuardianButton
                      onClick={handleSend}
                      className="flex-[2] h-16 !bg-guardian-blue rounded-2xl shadow-lg active:translate-y-1 active:shadow-md border-0 gap-3"
                    >
                      <Send size={24} fill="white" />
                      <span className="text-xl font-bold font-heading uppercase tracking-tight text-white">
                        {replyingTo ? 'SEND REPLY' : 'SEND'}
                      </span>
                    </GuardianButton>
                  )}
                </div>
              </div>
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
            {post.title === 'Trump 2.0: Taking Stock' && (
              <p className="text-base text-gray-700 leading-relaxed mt-4">
                Major technology companies around the world are significantly increasing their investment in artificial intelligence (AI) infrastructure, signaling a new phase in the global race for computing power. Industry analysts say the shift reflects growing demand for large-scale AI models, which require vast amounts of data, energy, and specialized hardware to operate efficiently.
              </p>
            )}
          </div>

          {/* 5. Post Likes */}
          <div className="mx-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-50 p-2 rounded-full">
                <Heart size={20} className="text-red-500 fill-red-500" />
              </div>
              <span className="text-xl font-bold text-gray-900">{post.likes} People Liked</span>
            </div>
            
            {post.author === 'Me' && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {POST_LIKERS.map((user, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-14 h-14 rounded-full border border-gray-100 overflow-hidden bg-gray-50">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{user.name}</span>
                  </div>
                ))}
                
                {/* Overflow Bubble */}
                {post.likes > POST_LIKERS.length && (
                  <button
                    onClick={() => setShowLikesDrawer(true)}
                    className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform"
                  >
                    <div className="w-14 h-14 rounded-full border border-gray-100 bg-gray-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-500">+{post.likes - POST_LIKERS.length}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">Others</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 6. Family Messages List */}
          <section className="space-y-10">
            <div className="flex items-center gap-5 px-6 py-4 bg-gray-100 rounded-[2rem] w-fit shadow-sm">
              <MessageSquare size={44} className="text-[#003366]" fill="#003366" fillOpacity={0.1} />
              <h3 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
                {comments.length + comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0)} MESSAGES
              </h3>
            </div>

            <div className="flex flex-col gap-8">
              {comments.map((comment) => {
                const allReplies = comment.replies || [];
                const visibleReplies = allReplies.slice(0, 1);
                const earlierReplies = allReplies.slice(1);
                const isExpanded = showEarlierMessages[comment.id] || false;
                const displayReplies = isExpanded ? allReplies : visibleReplies;

                  return (
                    <div key={comment.id} ref={el => commentRefs.current[comment.id] = el}>
                      <div
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4 active:bg-gray-50 transition-colors"
                      >
                        {/* Avatar, Name, and Delete Action */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                              <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold font-heading text-gray-900">{comment.author}</span>
                              {comment.replyTo && (
                                <span className="text-xs font-medium text-gray-500">to {comment.replyTo}</span>
                              )}
                            </div>
                          </div>

                          {(comment.author === 'Me' || post.author === 'Me') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(comment.id); }}
                              className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center transition-all active:scale-95 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>

                        {/* Comment text - left aligned */}
                        <div className="space-y-1">
                          <p className="text-lg text-gray-700 leading-relaxed break-words text-left">
                            {comment.text}
                          </p>
                          <span className="text-sm font-medium text-gray-400">{comment.time}</span>
                        </div>

                        {/* Reply and Like Actions */}
                        <div className="flex gap-2 mt-1 w-full">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCommentReply(comment); }}
                            className="h-12 px-5 rounded-xl bg-blue-50 text-[#1152D4] flex-1 flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 hover:bg-blue-100"
                          >
                            <Mic size={20} strokeWidth={2.5} />
                            <span>Reply</span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCommentLike(comment.id); }}
                            className={`h-12 px-5 rounded-xl flex-1 flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 
                              ${likedComments[comment.id] ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            <Heart size={20} fill={likedComments[comment.id] ? "currentColor" : "none"} strokeWidth={2.5} />
                            <span>{likedComments[comment.id] ? 'Liked' : 'Like'}</span>
                            {(comment.likes + (likedComments[comment.id] ? 1 : 0)) > 0 && (
                              <span className="ml-1">{comment.likes + (likedComments[comment.id] ? 1 : 0)}</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Show/Hide earlier messages button - 针对嵌套回复，出现在第一个回复的上面 */}
                      {earlierReplies.length > 0 && (
                        <div className="mt-3 ml-4">
                          <button
                            onClick={() => setShowEarlierMessages({ ...showEarlierMessages, [comment.id]: !isExpanded })}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors text-left"
                          >
                            {isExpanded ? 'Hide earlier messages' : `Show ${earlierReplies.length} earlier messages`}
                          </button>
                        </div>
                      )}

                      {/* Nested Replies - 显示该评论的回复 */}
                      {displayReplies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3">
                          {displayReplies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3"
                            >
                              {/* Avatar and Name in same row */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0">
                                  <img src={reply.avatar} alt={reply.author} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-bold font-heading text-gray-900">{reply.author}</span>
                                  <span className="text-xs font-medium text-gray-500">to {comment.author}</span>
                                </div>
                              </div>

                              {/* Reply text - left aligned */}
                              <div className="space-y-1">
                                <p className="text-base text-gray-700 leading-relaxed break-words text-left">
                                  {reply.text}
                                </p>
                                <span className="text-xs font-medium text-gray-400">{reply.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black font-heading text-gray-900 mb-2">Delete Comment?</h3>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Are you sure you want to delete this comment? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-14 bg-gray-100 text-gray-600 rounded-2xl text-lg font-bold font-heading uppercase tracking-wide active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-14 bg-red-500 text-white rounded-2xl text-lg font-bold font-heading uppercase tracking-wide active:scale-95 transition-transform"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Likes Drawer */}
      {showLikesDrawer && (
        <div className="fixed inset-0 z-[1000] flex items-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowLikesDrawer(false)}
          />
          <div className="relative w-full bg-white rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="flex items-center gap-2 mb-6 shrink-0">
              <div className="bg-red-50 p-2 rounded-full">
                <Heart size={24} className="text-red-500 fill-red-500" />
              </div>
              <h3 className="text-2xl font-black font-heading text-gray-900">{post.likes} People Liked</h3>
            </div>

            <div className="overflow-y-auto space-y-4 pb-8 flex-1">
              {ALL_LIKERS.map((user, i) => (
                <div key={i} className="flex items-center gap-4 p-2 rounded-xl active:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;