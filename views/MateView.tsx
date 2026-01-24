
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface MateViewProps {
  onTriggerAlert: () => void;
  onOpenGuide?: () => void;
}

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    status: string;
    img: string;
    isOnline?: boolean;
}

interface FeedItem {
    id: string;
    type: 'PRESENT' | 'PAST';
    image: string;
    title: string;
    description: string;
    date: string;
    author: string; // "John" or "Mom" (Self)
    likes?: number;
    comments?: number;
    isRestored?: boolean;
}

const MateView: React.FC<MateViewProps> = ({ onTriggerAlert }) => {
  // State for interaction flow
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([
      {
          id: '1',
          type: 'PRESENT',
          image: 'https://images.unsplash.com/photo-1517466787929-bc90951d6428?auto=format&fit=crop&q=80&w=500',
          title: 'Soccer Championship!',
          description: "Tommy scored the winning goal today. So proud!",
          date: '2 hours ago',
          author: 'John',
          likes: 4
      },
      {
          id: '2',
          type: 'PAST',
          image: 'https://images.unsplash.com/photo-1544083512-42c234a47d2b?auto=format&fit=crop&q=80&w=500', // Placeholder vintage
          title: 'The Blue Dress',
          description: 'Would you like to tell the story behind this photo to your kids?',
          date: 'May 14, 1975',
          author: 'Mom',
          isRestored: true
      }
  ]);

  const members: FamilyMember[] = [
      { id: '1', name: 'John', relation: 'Son', status: 'Working', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', isOnline: true },
      { id: '2', name: 'Sarah', relation: 'Granddaughter', status: 'In Class', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
      { id: '3', name: 'Liz', relation: 'Daughter', status: 'Driving', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
  ];

  // Haptics
  const vibrate = (pattern: number | number[] = 10) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  };

  const speak = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleRestorePhoto = () => {
      vibrate();
      setIsRestoring(true);
      // Simulate scan process
      setTimeout(() => {
          setRestoredImage('https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=500'); // Dessert/Party image
          setIsRestoring(false);
          speak("Wow, I remember this! Who gave you this dress? It looks special.");
          
          // Add to feed
          const newItem: FeedItem = {
              id: Date.now().toString(),
              type: 'PAST',
              image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=500',
              title: 'Restored Memory',
              description: 'Scan completed. Tap to record the story.',
              date: 'Just now',
              author: 'Mom',
              isRestored: true
          };
          setFeed(prev => [newItem, ...prev]);
      }, 3000);
  };

  const handleRecordStory = (id: string) => {
      vibrate([50, 50]);
      setIsRecording(true);
      speak("I'm listening. Tell me about that day.");
      setTimeout(() => {
          setIsRecording(false);
          alert("Story saved and shared with John!");
          vibrate(50);
      }, 4000); // Simulate 4s recording
  };

  const handleLove = (id: string) => {
      vibrate([20, 20]);
      setFeed(prev => prev.map(item => item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item));
  };

  const handleNudge = (name: string) => {
      vibrate([50, 100]);
      alert(`Sent a "Thinking of you" nudge to ${name}`);
  };

  return (
    <div className="w-full h-full bg-[#FDFBF7] px-4 pt-12 pb-32 overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-3xl font-serif font-bold text-[#2C3333]">The Family</h1>
          <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400">
              <Icons.Settings className="w-5 h-5" />
          </button>
      </div>

      {/* 1. PEOPLE (Horizontal Scroll) */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-6 px-2">
          {members.map(member => (
              <div key={member.id} onClick={() => handleNudge(member.name)} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group">
                  <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-white shadow-md p-0.5">
                          <img src={member.img} className="w-full h-full rounded-full object-cover" alt={member.name} />
                      </div>
                      {/* Status Bubble */}
                      <div className="absolute -bottom-1 -right-2 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                          <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap">{member.status}</span>
                      </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
              </div>
          ))}
          {/* Add Button */}
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white/50">
                  <Icons.Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-400">Invite</span>
          </div>
      </div>

      {/* 2. MEMORY MUSEUM (Self-Driven Area) */}
      <div className="mb-8 px-2">
          <div className="flex items-center gap-2 mb-3">
              <Icons.Hourglass className="w-5 h-5 text-[#8C7B75]" />
              <h2 className="text-sm font-bold text-[#8C7B75] uppercase tracking-widest">Memory Museum</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              {/* Photo Revive Card */}
              <div 
                onClick={handleRestorePhoto}
                className="bg-[#2C3333] rounded-[2rem] p-5 text-white relative overflow-hidden shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
              >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Icons.Wand className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col h-32 justify-between">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                          <Icons.Wand className="w-6 h-6 text-[#FFD700]" /> {/* Gold Wand */}
                      </div>
                      <div>
                          <h3 className="font-bold text-xl leading-tight mb-1">Restore Old Photo</h3>
                          <p className="text-gray-400 text-xs">Colorize & Sharpen</p>
                      </div>
                  </div>
              </div>

              {/* Legacy Quest Card */}
              <div 
                className="bg-white rounded-[2rem] p-5 relative overflow-hidden shadow-md border border-[#E6E2D8] active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => handleRecordStory('quest')}
              >
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Icons.Mic className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col h-32 justify-between">
                      <div className="w-12 h-12 bg-[#FDF6E3] rounded-full flex items-center justify-center text-[#D97706]">
                          <Icons.Book className="w-6 h-6" />
                      </div>
                      <div>
                          <span className="text-[#D97706] font-bold text-[10px] uppercase mb-1 block">Daily Question</span>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">"What was your wedding day like?"</h3>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* RESTORE OVERLAY */}
      {isRestoring && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
              <div className="w-full max-w-sm aspect-[3/4] bg-gray-800 rounded-3xl overflow-hidden relative shadow-2xl border border-white/20">
                  {/* Scanner Line */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-[#00E341] shadow-[0_0_20px_#00E341] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>
                  
                  <img src="https://images.unsplash.com/photo-1544083512-42c234a47d2b?auto=format&fit=crop&q=80&w=500" className="w-full h-full object-cover grayscale opacity-50" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                          <Icons.Wand className="w-16 h-16 text-white mb-4 animate-spin mx-auto" />
                          <p className="text-white font-bold text-xl">Restoring Memory...</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 3. FAMILY FEED (Waterfall) */}
      <div className="px-2">
          <div className="flex items-center gap-2 mb-4">
              <Icons.Heart className="w-5 h-5 text-[#8C7B75]" />
              <h2 className="text-sm font-bold text-[#8C7B75] uppercase tracking-widest">Family Feed</h2>
          </div>

          <div className="space-y-6">
              {feed.map(item => (
                  <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-[#E6E2D8] animate-in slide-in-from-bottom duration-500">
                      
                      {/* Image Area */}
                      <div className="relative">
                          <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                          
                          {/* Label Badge */}
                          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md ${item.type === 'PAST' ? 'bg-[#FFD700]/90 text-black' : 'bg-black/60 text-white'}`}>
                              {item.type === 'PAST' ? '1975 • Memory' : 'Today • Live'}
                          </div>

                          {/* Author Badge */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                                  <img 
                                    src={item.author === 'Mom' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'} 
                                    className="w-full h-full object-cover" 
                                  />
                              </div>
                              <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{item.author} shared</span>
                          </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="text-2xl font-bold text-[#2C3333]">{item.title}</h3>
                              <span className="text-xs font-bold text-gray-400 uppercase mt-2">{item.date}</span>
                          </div>
                          
                          <p className="text-gray-600 text-lg leading-relaxed mb-6 font-medium">
                              {item.description}
                          </p>

                          {/* Dynamic Action Buttons */}
                          {item.type === 'PAST' ? (
                              <button 
                                onClick={() => handleRecordStory(item.id)}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg active:scale-95 transition-transform ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[#FFF8E1] text-[#D97706]'}`}
                              >
                                  {isRecording ? (
                                      <>
                                        <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                                        Recording...
                                      </>
                                  ) : (
                                      <>
                                        <Icons.Mic className="w-6 h-6" />
                                        Tell the Story
                                      </>
                                  )}
                              </button>
                          ) : (
                              <div className="flex gap-3">
                                  <button 
                                    onClick={() => handleLove(item.id)}
                                    className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                  >
                                      <Icons.Heart className={`w-6 h-6 ${item.likes ? 'fill-current' : ''}`} />
                                      {item.likes ? item.likes : 'Love'}
                                  </button>
                                  <button className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                      <Icons.MessageCircle className="w-6 h-6" />
                                      Reply
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MateView;
