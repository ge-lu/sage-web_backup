import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuraOrb from '../components/AuraOrb';
import { Icons, MOCK_ACTIVITIES } from '../constants';
import ActivityItem from '../components/ActivityItem';
import { TaskCard, AppMode } from '../types';
import { getPathForMode } from '../routes';
import asr from '../util/ASRindex';

interface DashboardProps {
  isListening: boolean; // Kept for interface compatibility
  setIsListening: (val: boolean) => void;
  pendingTasks?: TaskCard[]; // New Prop
  onTriggerSOS: () => void;
  onSearch?: (query: string) => void;
  onFileSelected?: () => void;
  onVoiceUsed?: () => void;
}

// Explicit Type for Aura State to match AuraOrb props strictly
type AuraState = 'neutral' | 'active' | 'thinking' | 'alert' | 'happy';

const Dashboard: React.FC<DashboardProps> = ({
  setIsListening: setGlobalChat,
  pendingTasks = [],
  onTriggerSOS,
  onSearch,
  onFileSelected,
  onVoiceUsed
}) => {
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
    <div className="w-full h-full overflow-y-auto bg-[#F9FAFB] px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-32 relative">

      {/* Top Header */}
      <div className="relative flex justify-between items-center mb-4 h-16">
        <button onClick={() => goTo(AppMode.ALL_ACTIVITY)} className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm z-20">
          <Icons.MoreHorizontal className="w-6 h-6 text-gray-400" />
        </button>
        <span className="text-sm font-bold text-gray-400 tracking-wide absolute left-0 right-0 text-center pointer-events-none">Ask Aura anything...</span>
        <button onClick={handleSOS} className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-500 font-bold shadow-sm animate-pulse z-20">SOS</button>
      </div>

      {/* --- AURA ORB CENTERPIECE --- */}
      <div className="mb-4 mt-0 relative flex flex-col items-center">
        <div onClick={handleMicToggle} className="cursor-pointer transition-transform active:scale-95 transform scale-90 origin-center">
          {/* The Safe Zone: We strictly control the props passed here */}
          <AuraOrb isListening={localIsListening} sentiment={auraState} />
        </div>

        <div className="mt-[-2rem] h-6 text-center flex flex-col justify-center relative z-20">
          {localIsListening && (
            <p className="font-bold text-[#00E341] text-lg animate-pulse drop-shadow-md">Listening...</p>
          )}
        </div>

        {/* --- NEW: TASK NOTIFICATION CARD --- */}
        {/* Replaces Input Area or sits above it when tasks are pending */}
        {primaryTask && !localIsListening ? (
          <div
            onClick={() => goTo(AppMode.PLAN)}
            className="w-full max-w-[280px] mt-2 relative z-30 animate-in slide-in-from-bottom duration-500 fade-in zoom-in cursor-pointer active:scale-95 transition-transform"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white flex items-center gap-4 relative overflow-hidden group">
              {/* Left Time Badge */}
              <div className="flex flex-col items-center justify-center bg-gray-900 text-white rounded-xl min-w-[60px] h-14 px-2 shadow-sm">
                <span className="text-xs font-bold uppercase text-[#00E341]">DUE</span>
                <span className="text-lg font-bold leading-none">{primaryTask.time || "Now"}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Next Task</p>
                <h4 className="font-bold text-gray-900 truncate text-base leading-tight">{primaryTask.title}</h4>
              </div>

              {/* Chevron */}
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#00E341] group-hover:text-white transition-colors">
                <Icons.ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ) : (
          /* Input Area (Only visible if no high-priority task overlay or user is interacting) */
          <div className="w-[240px] mt-4 relative z-20 min-h-[40px]">
            {showUploadMenu ? (
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[340px] h-32 bg-white rounded-[2rem] border border-gray-200 shadow-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in zoom-in duration-200 z-50">
                <button onClick={() => setShowUploadMenu(false)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><Icons.X className="w-6 h-6 text-gray-600" /></button>
                <button onClick={() => goTo(AppMode.OMNIBUS)} className="flex flex-col items-center gap-2"><div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><Icons.Camera className="w-8 h-8" /></div><span className="text-xs font-bold text-gray-700">Camera</span></button>
                <button onClick={() => { setShowUploadMenu(false); if (onFileSelected) onFileSelected(); }} className="flex flex-col items-center gap-2"><div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100"><Icons.Image className="w-8 h-8" /></div><span className="text-xs font-bold text-gray-700">Photo</span></button>
              </div>
            ) : (
              <div className="flex items-end gap-1 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm p-1 w-full">
                <button onClick={() => setShowUploadMenu(true)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-0.5"><Icons.Plus className="w-4 h-4 text-gray-600" /></button>
                <textarea
                  ref={textareaRef}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearchSubmit(); } }}
                  className="flex-1 min-h-[24px] max-h-20 py-2 bg-transparent border-none outline-none text-gray-900 font-medium text-sm resize-none"
                  rows={1}
                  placeholder="Type to chat..."
                />
                <button onClick={handleSearchSubmit} className="w-8 h-8 rounded-full bg-[#00E341] flex items-center justify-center mb-0.5"><Icons.ArrowRight className="w-4 h-4 text-black" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div onClick={() => goTo(AppMode.OMNIBUS)} className="h-48 rounded-[2.5rem] bg-[#2E5C7A] relative overflow-hidden shadow-lg active:scale-95 transition-transform cursor-pointer p-6 flex flex-col items-center justify-center gap-3 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
          <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm p-4"><Icons.Camera className="w-10 h-10 text-white" /></div>
          <div className="text-center"><span className="text-white font-bold text-3xl tracking-tight block mb-1">See</span><span className="text-white/90 text-sm font-bold leading-tight block">Identify & Help</span></div>
        </div>
        <button onClick={() => setGlobalChat(true)} className="h-48 rounded-[2.5rem] border-2 border-gray-100 bg-white relative overflow-hidden shadow-sm active:scale-95 transition-transform p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-18 h-18 rounded-2xl flex items-center justify-center bg-[#F3F4F6] text-gray-900 p-4"><Icons.Mic className="w-10 h-10" /></div>
          <div className="text-center"><span className="font-bold text-3xl text-gray-900 tracking-tight block mb-1">Speak</span><span className="text-gray-600 text-sm font-bold leading-tight block">Commands & Chat</span></div>
        </button>
      </div>

      {/* Context List */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-5 px-2">Recent Activity</h3>
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
  );
};

export default Dashboard;
