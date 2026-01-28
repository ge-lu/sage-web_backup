
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { RobotBubble } from './RobotBubble';

enum RideStage {
  RECOMMENDATION = 'RECOMMENDATION',
  WAITING = 'WAITING',
  PICKUP = 'PICKUP',
  IN_TRIP = 'IN_TRIP',
  IDLE = 'IDLE'
}

interface DriverInfo {
  name: string;
  rating: number;
  photo: string;
  carModel: string;
  carColor: string;
  plateNumber: string;
  eta: number;
}

const MOCK_DRIVER: DriverInfo = {
  name: "Michael",
  rating: 4.9,
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
  carModel: "Toyota Camry",
  carColor: "Silver",
  plateNumber: "7ABC123",
  eta: 4
};

const WAITING_MESSAGES = [
  "Looking for a ride...",
  "Scanning nearby drivers...",
  "Checking availability...",
  "Connecting to the network..."
];

export const SmartRideCard: React.FC = () => {
  const [stage, setStage] = useState<RideStage>(RideStage.RECOMMENDATION);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [waitingMsgIndex, setWaitingMsgIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-transition: WAITING -> PICKUP (15s)
  useEffect(() => {
    let timer: any;
    if (stage === RideStage.WAITING) {
      timer = setTimeout(() => {
        setStage(RideStage.PICKUP);
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  // Auto-transition: PICKUP -> IN_TRIP (10s)
  useEffect(() => {
    let timer: any;
    if (stage === RideStage.PICKUP) {
      timer = setTimeout(() => {
        setStage(RideStage.IN_TRIP);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  // Handle waiting message rotation
  useEffect(() => {
    let interval: any;
    if (stage === RideStage.WAITING) {
      interval = setInterval(() => {
        setWaitingMsgIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
      }, 3500);
    } else {
      setWaitingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleCall = () => {
    window.location.href = `tel:5550123`;
  };

  // Card preview (collapsed state)
  const renderCardPreview = () => {
    switch (stage) {
      case RideStage.RECOMMENDATION:
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Icons.Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Icons.Heart className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Appointment Alert</h3>
                <p className="text-sm text-gray-600 mt-1">City General Hospital • Tomorrow 10:00 AM</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-4">Would you like me to book your ride?</p>
            <div className="flex gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setStage(RideStage.IDLE); }}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold active:scale-95"
              >
                No
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setStage(RideStage.WAITING); }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg active:scale-95"
              >
                Yes, Book
              </button>
            </div>
          </div>
        );

      case RideStage.WAITING:
        return (
          <div className="bg-[#121926] rounded-2xl p-6 shadow-xl text-white">
            <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border border-blue-500/30 w-fit mb-4">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              Searching...
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 w-16 h-16 bg-blue-500/30 rounded-full animate-pulse"></div>
                <div className="w-16 h-16 rounded-full border-4 border-[#121926] bg-white flex items-center justify-center relative z-10">
                  <Icons.Sparkles className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-black mb-1 text-cyan-400">3-5 min</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Expected wait</div>
              </div>
            </div>
            <p className="text-lg font-black mt-4">{WAITING_MESSAGES[waitingMsgIndex]}</p>
          </div>
        );

      case RideStage.PICKUP:
        return (
          <div className="bg-[#121926] rounded-2xl overflow-hidden text-white shadow-xl">
            <div className="h-32 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover brightness-[0.6] grayscale" alt="Map" />
              <div className="absolute top-2 left-2">
                <div className="bg-[#2a3343]/80 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-[9px] font-black tracking-widest uppercase">ACTIVE RIDE</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-lg overflow-hidden bg-white">
                  <img src={MOCK_DRIVER.photo} alt={MOCK_DRIVER.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-black mb-1">4 min</div>
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">Est. Arrival</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCall(); }}
                  className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl active:scale-90"
                >
                  <Icons.Phone className="w-7 h-7 text-white" />
                </button>
              </div>
              <h3 className="text-2xl font-black mb-1">{MOCK_DRIVER.name}</h3>
              <p className="text-slate-400 text-base">{MOCK_DRIVER.carModel} • {MOCK_DRIVER.plateNumber}</p>
            </div>
          </div>
        );

      case RideStage.IN_TRIP:
        return (
          <div className="bg-[#121926] rounded-2xl overflow-hidden text-white shadow-xl">
            <div className="h-32 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover brightness-[0.5] grayscale" alt="Map" />
              <div className="absolute top-2 left-2">
                <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-2 border border-emerald-400/30">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black tracking-widest uppercase">● ON TRIP</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-lg overflow-hidden bg-white">
                  <img src={MOCK_DRIVER.photo} alt={MOCK_DRIVER.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-black mb-1">8 min</div>
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">2.5 miles to go</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCall(); }}
                  className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl active:scale-90"
                >
                  <Icons.Phone className="w-7 h-7 text-white" />
                </button>
              </div>
              <h3 className="text-xl font-black mb-2">To General Hospital</h3>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <Icons.Shield className="w-4 h-4" />
                <span>Sarah is following your trip</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Expanded view (when clicked)
  const renderExpandedView = () => {
    return (
      <div className="space-y-4">
        {stage === RideStage.WAITING && (
          <RobotBubble message="I'm searching for the best driver near your home. One moment..." />
        )}
        {stage === RideStage.PICKUP && (
          <RobotBubble message={`Success! ${MOCK_DRIVER.name} is on his way to pick you up.`} />
        )}
        {stage === RideStage.IN_TRIP && (
          <RobotBubble message="You're on your way! I've shared your live trip with Sarah." />
        )}
        {renderCardPreview()}
        {stage === RideStage.WAITING && (
          <button 
            onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
            className="w-full py-4 bg-slate-800 text-slate-400 rounded-xl text-base font-bold active:scale-95"
          >
            Cancel
          </button>
        )}
      </div>
    );
  };

  if (stage === RideStage.IDLE) {
    return null; // Don't show card when idle
  }

  return (
    <>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer transition-all"
      >
        {isExpanded ? renderExpandedView() : renderCardPreview()}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <Icons.AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-4 text-center">Stop looking?</h3>
            <p className="text-gray-600 font-bold text-base mb-8 text-center leading-relaxed">
              Wait times are high. It might be hard to find another ride if you cancel now.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowCancelConfirm(false); setStage(RideStage.IDLE); }}
                className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-xl text-base"
              >
                Yes, Stop
              </button>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="w-full bg-blue-600 text-white py-5 rounded-xl text-lg font-black uppercase shadow-lg"
              >
                KEEP WAITING
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
