
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Icons } from '../constants';
import { getPathForMode } from '../routes';
import { AppMode } from '../types';

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
  const navigate = useNavigate();
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

  const openRideDetail = () => {
    navigate(getPathForMode(AppMode.RIDE_DETAIL), {
      state: {
        stage: stage === RideStage.PICKUP ? 'PICKUP' : 'IN_TRIP',
        driver: MOCK_DRIVER
      }
    });
  };

  // Card preview (collapsed state)
  const renderCardPreview = () => {
    switch (stage) {
      case RideStage.RECOMMENDATION:
        return (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 transition-all hover:shadow-md">
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
                <h3 className="text-lg font-bold font-heading text-gray-900">Need a ride tomorrow? </h3>
              </div>
            </div>
            <p className="text-base text-gray-800 leading-relaxed mb-4">
               <span className=" text-gray-900">10:00 AM at City General Hospital.</span> <span className="font-black text-gray-900"></span>
            </p>
            <div className="flex gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setStage(RideStage.IDLE); }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl text-sm font-bold font-heading active:scale-95 border-2 border-gray-300"
              >
                No, Thanks
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setStage(RideStage.WAITING); }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold font-heading shadow-lg active:scale-95"
              >
                Yes, Book
              </button>
            </div>
          </div>
        );

      case RideStage.WAITING:
        return (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 p-6 relative">
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 border border-blue-100 w-fit mb-5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Searching...
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 w-20 h-20 bg-blue-50 rounded-full animate-ping"></div>
                <div className="w-20 h-20 rounded-full border border-blue-100 shadow-sm bg-white flex items-center justify-center relative z-10">
                  <Icons.Sparkles className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black mb-1 text-blue-600 font-heading tracking-tighter">3-5 min</div>
                <div className="text-gray-400 font-extrabold uppercase tracking-widest text-[11px]">Expected wait</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 key={waitingMsgIndex} className="text-2xl font-black font-heading mb-3 animate-in fade-in duration-1000 text-gray-900">
                {WAITING_MESSAGES[waitingMsgIndex]}
              </h3>
              <div className="flex items-center gap-2 text-gray-500 font-bold text-base">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>Scanning Main St Area</span>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
              className="w-full py-4 bg-gray-50 text-gray-500 rounded-xl text-base font-bold font-heading active:scale-95 transition-colors hover:bg-gray-100 hover:text-gray-700 uppercase tracking-wide border border-gray-100"
            >
              Cancel Search
            </button>
          </div>
        );

      case RideStage.PICKUP:
        return (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="h-32 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Map" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent"></div>
              <div className="absolute top-3 left-3">
                <div className="bg-white/90 backdrop-blur-md text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100 shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black tracking-widest uppercase">Driver Arriving</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 relative -mt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white">
                  <img src={MOCK_DRIVER.photo} alt={MOCK_DRIVER.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 pt-4">
                  <div className="text-3xl font-black text-blue-600 font-heading mb-0.5">4 min</div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Est. Arrival</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCall(); }}
                  className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm border border-blue-100 active:scale-90 mt-4"
                >
                  <Icons.Phone className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-2xl font-black font-heading mb-1 text-gray-900">{MOCK_DRIVER.name}</h3>
              <p className="text-gray-500 text-sm font-medium">{MOCK_DRIVER.carModel} • {MOCK_DRIVER.plateNumber}</p>
            </div>
          </div>
        );

      case RideStage.IN_TRIP:
        return (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="h-32 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Map" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent"></div>
              <div className="absolute top-3 left-3">
                <div className="bg-white/90 backdrop-blur-md text-emerald-800 px-3 py-1 rounded-full flex items-center gap-2 border border-emerald-100 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black tracking-widest uppercase">On Trip</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 relative -mt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white">
                  <img src={MOCK_DRIVER.photo} alt={MOCK_DRIVER.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 pt-4">
                  <div className="text-3xl font-black text-gray-900 font-heading mb-0.5">8 min</div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">2.5 miles left</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCall(); }}
                  className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center shadow-sm border border-gray-200 active:scale-90 mt-4"
                >
                  <Icons.Phone className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold font-heading mb-1 text-gray-900">To General Hospital</h3>
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
        {renderCardPreview()}
      </div>
    );
  };

  if (stage === RideStage.IDLE) {
    return null; // Don't show card when idle
  }

  const canToggleExpand = stage !== RideStage.PICKUP && stage !== RideStage.IN_TRIP;
  const canOpenRideDetail = stage === RideStage.PICKUP || stage === RideStage.IN_TRIP;

  return (
    <>
      <div 
        onClick={canOpenRideDetail ? openRideDetail : (canToggleExpand ? () => setIsExpanded(!isExpanded) : undefined)}
        className={(canOpenRideDetail || canToggleExpand) ? "cursor-pointer transition-all" : "transition-all"}
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
