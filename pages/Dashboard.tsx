import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuraOrb from '../components/AuraOrb';
import { Icons, MOCK_ACTIVITIES } from '../constants';
import ActivityItem from '../components/ActivityItem';
import { TaskCard, AppMode } from '../types';
import { getPathForMode } from '../routes';
import asr from '../util/ASRindex';

import { useDataStore } from '../stores/useDataStore';

interface DashboardProps {
  isListening: boolean; // Kept for interface compatibility
  setIsListening: (val: boolean) => void;
  // pendingTasks removed
  onTriggerSOS: () => void;
  onSearch?: (query: string) => void;
  onFileSelected?: () => void;
  onVoiceUsed?: () => void;
}

// Explicit Type for Aura State to match AuraOrb props strictly
type AuraState = 'neutral' | 'active' | 'thinking' | 'alert' | 'happy';

const Dashboard: React.FC<DashboardProps> = ({
  setIsListening: setGlobalChat,
  onTriggerSOS,
  onSearch,
  onFileSelected,
  onVoiceUsed
}) => {
  const tasks = useDataStore(state => state.tasks) || [];
  const pendingTasks = tasks?.filter(t => !t.completed);
  const navigate = useNavigate();
  const goTo = (mode: AppMode) => { navigate(getPathForMode(mode)) };
  // --- 1. VISUAL STATE MACHINE ---
  // We control the AuraOrb strictly through this state.
  const [auraState, setAuraState] = useState<AuraState>('happy'); // Start happy
  const [localIsListening, setLocalIsListening] = useState(false);

  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. EFFECT: INITIAL GREETING ---
  // Safely transition from Happy -> Neutral after load
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only go neutral if we haven't started interacting
      if (!localIsListening && auraState === 'happy') {
        setAuraState('neutral');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [localIsListening, auraState]);

  // --- 3. VOICE LOGIC ---
  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
  };

  const handleMicToggle = () => {
    vibrate();

    // Stop Listening
    if (localIsListening) {
      setLocalIsListening(false);
      setAuraState('neutral');
      return;
    }

    // Start Listening
    setLocalIsListening(true);
    setAuraState('active'); // 'active' = Speaking/Listening animation in AuraOrb

    asr.start({
      onResult: (text, isFinal) => {
        // Wait for final result
        if (isFinal) {
          const transcript = text.toLowerCase();
          // Transition to Thinking
          setLocalIsListening(false);
          setAuraState('thinking');

          if (onVoiceUsed) onVoiceUsed();

          console.log("Command:", transcript);

          // Simple Router
          setTimeout(() => {
            if (transcript.includes('scan') || transcript.includes('camera')) {
              goTo(AppMode.OMNIBUS);
            } else {
              // Pass to Global Chat for complex handling
              if (onSearch) onSearch(transcript);
            }
            // Reset to neutral if navigation didn't happen fast enough
            setAuraState('neutral');
          }, 1000);
        }
      },
      onError: () => {
        setLocalIsListening(false);
        setAuraState('neutral'); // Fail safe to neutral
      },
      onEnd: () => {
        if (localIsListening) {
          setLocalIsListening(false);
          setAuraState('neutral');
        }
      }
    });
  };

  const handleSearchSubmit = () => {
    vibrate();
    if (searchText.trim() && onSearch) {
      setAuraState('thinking');
      onSearch(searchText);
      setSearchText("");
    } else {
      handleMicToggle();
    }
  };

  const handleSOS = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 500]);
    setAuraState('alert'); // Triggers red angry/alert face
    onTriggerSOS();
  };

  // Helper to determine the "next" or most important task

  // Helper to determine the "next" or most important task
  const primaryTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  return (
    <div className="w-full h-full bg-[#F5F7F9] relative flex flex-col font-sans overflow-hidden">

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 grid grid-cols-[1fr_auto_1fr] items-center shrink-0">
         <div className="flex justify-start">
           <button 
             onClick={() => goTo(AppMode.ALL_ACTIVITY)} 
             className="bg-white px-3 py-2.5 rounded-xl border border-gray-200 cursor-pointer active:bg-gray-50 transition-all shadow-sm flex items-center justify-center"
           >
             <Icons.MoreHorizontal className="w-5 h-5 text-gray-900" />
           </button>
         </div>

        <h1 className="text-gray-900 font-heading text-2xl font-bold tracking-tight truncate">Aura</h1>
        
        <div className="flex justify-end">
           <button 
             onClick={handleSOS} 
             className="bg-white px-4 py-2.5 rounded-xl border border-red-100 cursor-pointer active:bg-red-50 transition-all shadow-sm flex items-center gap-2 group"
           >
              <span className="text-red-600 font-bold font-heading text-sm uppercase tracking-wider group-hover:text-red-700">SOS</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32">

      {/* --- AURA ORB CENTERPIECE --- */}
      <div className="mb-4 mt-0 relative flex flex-col items-center">
        <div onClick={handleMicToggle} className="cursor-pointer transition-transform active:scale-95 transform scale-90 origin-center">
          {/* The Safe Zone: We strictly control the props passed here */}
          <AuraOrb isListening={localIsListening} sentiment={auraState} />
        </div>

        <div className="mt-[-2rem] h-6 text-center flex flex-col justify-center relative z-20">
          {localIsListening && (
            <p className="font-bold text-guardian-blue text-lg animate-pulse drop-shadow-md font-heading">Listening...</p>
          )}
        </div>

        {/* --- NEW: TASK NOTIFICATION CARD --- */}
        {/* Replaces Input Area or sits above it when tasks are pending */}
        {primaryTask && !localIsListening ? (
          <div
            onClick={() => goTo(AppMode.PLAN)}
            className="w-full max-w-[280px] mt-2 relative z-30 animate-in slide-in-from-bottom duration-500 fade-in zoom-in cursor-pointer active:scale-95 transition-transform"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 relative overflow-hidden group">
              {/* Left Time Badge */}
              <div className="flex flex-col items-center justify-center bg-guardian-blue text-white rounded-lg min-w-[60px] h-14 px-2 shadow-sm">
                <span className="text-xs font-bold uppercase text-blue-200 font-heading">DUE</span>
                <span className="text-lg font-bold leading-none font-heading">{primaryTask.time || "Now"}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 font-heading">Next Task</p>
                <h4 className="font-bold text-gray-900 truncate text-lg leading-tight font-heading">{primaryTask.title}</h4>
              </div>

              {/* Chevron */}
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-guardian-blue group-hover:text-white transition-colors">
                <Icons.ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ) : (
          /* Input Area (Only visible if no high-priority task overlay or user is interacting) */
          <div className="w-[240px] mt-4 relative z-20 min-h-[40px]">
            {showUploadMenu ? (
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[340px] h-32 bg-white rounded-[2rem] border border-gray-200 shadow-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in zoom-in duration-200 z-50">
                <button onClick={() => setShowUploadMenu(false)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><Icons.X className="w-6 h-6 text-gray-600" /></button>
                <button onClick={() => goTo(AppMode.OMNIBUS)} className="flex flex-col items-center gap-2 group"><div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-active:scale-95 transition-transform"><Icons.Camera className="w-8 h-8" /></div><span className="text-xs font-bold text-gray-700 font-heading">Camera</span></button>
                <button onClick={() => { setShowUploadMenu(false); if (onFileSelected) onFileSelected(); }} className="flex flex-col items-center gap-2 group"><div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 group-active:scale-95 transition-transform"><Icons.Image className="w-8 h-8" /></div><span className="text-xs font-bold text-gray-700 font-heading">Photo</span></button>
              </div>
            ) : (
              <div className="flex items-end gap-1 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm p-1 w-full">
                <button onClick={() => setShowUploadMenu(true)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-0.5 hover:bg-gray-200 transition-colors"><Icons.Plus className="w-4 h-4 text-gray-600" /></button>
                <textarea
                  ref={textareaRef}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearchSubmit(); } }}
                  className="flex-1 min-h-[24px] max-h-20 py-2 bg-transparent border-none outline-none text-gray-900 font-medium text-base resize-none placeholder:font-heading"
                  rows={1}
                  placeholder="Type to chat..."
                />
                <button onClick={handleSearchSubmit} className="w-8 h-8 rounded-full bg-guardian-blue flex items-center justify-center mb-0.5 hover:brightness-110 transition-all"><Icons.ArrowRight className="w-4 h-4 text-white" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div onClick={() => {
            // ipuMobile.getPhoto(function (data) {
            //   console.log(data, 'data');
            // })
          goTo(AppMode.OMNIBUS)
          }
          } className="h-48 rounded-xl bg-guardian-blue relative overflow-hidden shadow-lg active:scale-95 transition-transform cursor-pointer p-6 flex flex-col items-center justify-center gap-3 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
          <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm p-4"><Icons.Camera className="w-10 h-10 text-white" /></div>
          <div className="text-center"><span className="text-white font-bold text-3xl tracking-tight block mb-1 font-heading">See</span><span className="text-white/90 text-base font-bold leading-tight block font-heading">Identify & Help</span></div>
        </div>
        <button onClick={() => setGlobalChat(true)} className="h-48 rounded-xl border border-gray-200 bg-white relative overflow-hidden shadow-sm active:scale-95 transition-transform p-6 flex flex-col items-center justify-center gap-3 hover:bg-gray-50">
          <div className="w-18 h-18 rounded-2xl flex items-center justify-center bg-[#F5F7F9] text-gray-900 p-4"><Icons.Mic className="w-10 h-10 text-guardian-blue" /></div>
          <div className="text-center"><span className="font-bold text-3xl text-gray-900 tracking-tight block mb-1 font-heading">Speak</span><span className="text-gray-600 text-base font-bold leading-tight block font-heading">Commands & Chat</span></div>
        </button>
      </div>

      {/* Context List */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-5">
           <h3 className="text-2xl font-bold text-gray-900 font-heading">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {MOCK_ACTIVITIES.slice(0, 3).map((item) => (
              <ActivityItem
                key={item.id}
                item={item}
                isExpanded={expandedActivity === item.id}
                onToggle={() => setExpandedActivity(expandedActivity === item.id ? null : item.id)}
                onAction={(action) => {
                   if (action === 'scam') goTo(AppMode.FAMILY_CONNECTIONS);
                   if (action === 'order') goTo(AppMode.PLAN);
                }}
              />
          ))}
        </div>
      </div>
      </main>
    </div>
  );
};

export default Dashboard;
