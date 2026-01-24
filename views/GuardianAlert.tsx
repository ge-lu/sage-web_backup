
import React, { useEffect } from 'react';
import { Icons } from '../constants';

interface GuardianAlertProps {
  onDismiss: () => void;
}

const GuardianAlert: React.FC<GuardianAlertProps> = ({ onDismiss }) => {

  useEffect(() => { 
      // Initial Alert Vibration: Warning Pattern
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([500, 200, 500, 200, 800]); 
      }
  }, []);

  const handleBlock = () => {
      // Strong, distinct "Heavy Impact" pattern for blocking action
      // Pattern: Short-Sharp, Short-Sharp, Long-Heavy
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([80, 50, 80, 50, 600]);
      }
      onDismiss();
  };

  const handleTrust = () => {
      // Very light single tick for ignore/trust (dismissal)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
      }
      onDismiss();
  };

  return (
    // Background: Dark Mode for Danger
    <div className="fixed inset-0 z-50 bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-[#EF4444]/10 flex items-center justify-center gap-2 border-b border-[#EF4444]/20">
          <Icons.Shield className="w-5 h-5 text-[#EF4444]" />
          <span className="text-[#EF4444] font-bold text-sm tracking-widest uppercase">Guardian Mode Active</span>
      </div>

      {/* Main Alert Icon */}
      <div className="w-32 h-32 rounded-full border-4 border-[#EF4444] flex items-center justify-center mb-8 bg-[#EF4444]/10 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]">
        <Icons.AlertTriangle className="w-16 h-16 text-[#EF4444]" />
      </div>

      <h1 className="text-4xl font-bold text-white mb-2 uppercase tracking-tight">
        Potential Scam Alert!
      </h1>
      
      <p className="text-lg text-gray-400 mb-8 max-w-sm">
          This caller is using a known fraud pattern.
      </p>

      {/* Context Card */}
      <div className="w-full max-w-sm bg-[#1F1F1F] rounded-2xl p-5 flex items-start gap-4 mb-8 border border-white/10 shadow-2xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 shrink-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div className="text-left flex-1">
              <p className="text-white font-bold text-sm mb-1">Aura Analysis</p>
              <p className="text-gray-300 text-sm italic leading-relaxed">"They just asked for your social security number. Do not share it."</p>
          </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button 
            onClick={handleBlock}
            className="w-full h-16 rounded-full bg-[#EF4444] text-white font-bold text-xl shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-[#DC2626]"
        >
            <Icons.X className="w-6 h-6" /> Hang Up & Block
        </button>

        <button 
            onClick={handleTrust}
            className="w-full h-14 rounded-full bg-[#272727] text-gray-300 font-bold text-lg active:scale-95 transition-transform hover:bg-[#333]"
        >
            I'm Safe (Ignore)
        </button>
      </div>
      
    </div>
  );
};

export default GuardianAlert;
