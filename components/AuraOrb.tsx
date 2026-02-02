
import React, { useEffect, useState } from 'react';

interface AuraFaceProps {
  isListening: boolean;
  sentiment?: 'neutral' | 'active' | 'thinking' | 'alert' | 'happy'; 
}

const AuraOrb: React.FC<AuraFaceProps> = ({ isListening, sentiment = 'neutral' }) => {
  const [blink, setBlink] = useState(false);
  const [lookDir, setLookDir] = useState({ x: 0, y: 0 }); // For looking around

  // Default: Neutral (Warm & Alive)
  let containerClass = "bg-gradient-to-b from-gray-800 via-gray-900 to-black shadow-[0_0_40px_rgba(0,0,0,0.3)] animate-[breathe_4s_ease-in-out_infinite]";
  let eyeClass = "bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]";
  let mouthClass = "border-white/60"; 
  let cheekClass = "opacity-0"; 
  
  // Base transforms
  let containerTransform = "";
  let eyeLeftStyle = "w-12 h-16 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";
  let eyeRightStyle = "w-12 h-16 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";
  let mouthStyle = "w-10 h-6 border-b-4 rounded-[100%] mt-8 transition-all duration-500"; 
  let faceContentTransform = `translate(${lookDir.x}px, ${lookDir.y}px)`;

  // --- State Logic Overrides ---

  if (sentiment === 'alert') {
      // Alert: Urgent, fast aggressive pulse (0.3s), larger scale
      containerClass = "bg-gradient-to-b from-[#7F1D1D] to-[#450A0A] shadow-[0_0_60px_rgba(220,38,38,1)] animate-[aggressivePulse_0.3s_ease-in-out_infinite]";
      eyeClass = "bg-red-50 shadow-[0_0_20px_rgba(239,68,68,1)]";
      eyeLeftStyle = "w-14 h-10 rounded-full translate-y-2 rotate-[15deg]";
      eyeRightStyle = "w-14 h-10 rounded-full translate-y-2 -rotate-[15deg]";
      mouthStyle = "w-16 h-8 border-t-[6px] border-red-500 rounded-t-full mt-10 translate-y-2";
      mouthClass = ""; 
      faceContentTransform = "translate(0,0)";

  } else if (sentiment === 'thinking') {
      // Thinking: Rapid jittery motion, deep blue
      containerClass = "bg-gradient-to-b from-blue-900 to-indigo-950 shadow-[0_0_40px_rgba(59,130,246,0.5)] animate-[jitter_0.1s_steps(2)_infinite]";
      eyeClass = "bg-blue-100/90";
      eyeLeftStyle = "w-12 h-12 rounded-full -translate-y-4 scale-90";
      eyeRightStyle = "w-12 h-12 rounded-full -translate-y-4 scale-90";
      mouthStyle = "w-4 h-4 rounded-full border-2 border-blue-400/50 mt-8 animate-spin"; 
      mouthClass = "";
      faceContentTransform = "translate(0, -5px)";

  } else if (sentiment === 'happy') {
      // Happy: Bouncing, Cheeks
      containerClass = "bg-gradient-to-b from-gray-800 to-black shadow-[0_0_40px_rgba(255,192,203,0.2)] animate-[bounce_2s_infinite]";
      eyeClass = "bg-white";
      eyeLeftStyle = "w-14 h-8 rounded-t-full mt-4 border-t-4 border-white bg-transparent shadow-none h-4"; 
      eyeRightStyle = "w-14 h-8 rounded-t-full mt-4 border-t-4 border-white bg-transparent shadow-none h-4";
      mouthStyle = "w-16 h-8 border-b-[5px] border-white rounded-b-full mt-4"; 
      mouthClass = "";
      cheekClass = "opacity-100";
      faceContentTransform = "translate(0, -2px)";

  } else if (isListening) {
      // Listening: Attentive, White Glow, Head Tilt
      containerClass = "bg-gradient-to-b from-gray-700 to-black shadow-[0_0_50px_rgba(255,255,255,0.5)]";
      containerTransform = "rotate(-5deg)";
      eyeClass = "bg-white";
      eyeLeftStyle = "w-14 h-18 rounded-full -translate-y-2";
      eyeRightStyle = "w-14 h-18 rounded-full -translate-y-2";
      mouthStyle = "w-8 h-6 border-b-[4px] border-white rounded-[100%] mt-6"; 
      mouthClass = "";
      faceContentTransform = "translate(0, 0)";

  } else if (sentiment === 'active') {
      // Speaking/Active: Smooth rhythmic pulse
      containerClass = "bg-gradient-to-b from-gray-800 to-black shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-[breathe_2s_ease-in-out_infinite]";
      eyeClass = "bg-white";
      eyeLeftStyle = "w-12 h-10 rounded-full mt-2"; 
      eyeRightStyle = "w-12 h-10 rounded-full mt-2";
      mouthStyle = "w-16 bg-white/90 rounded-[1rem] mt-6 animate-[speak_0.4s_ease-in-out_infinite] min-h-[8px]";
      mouthClass = "";
      faceContentTransform = "translate(0,0)";
  }

  // Blinking Logic
  useEffect(() => {
    if (sentiment === 'alert' || sentiment === 'thinking') return;
    
    const blinkInterval = setInterval(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 200);
    }, 3500 + Math.random() * 3000); 

    return () => clearInterval(blinkInterval);
  }, [sentiment]);

  // "Looking Around" Logic
  useEffect(() => {
      if (sentiment !== 'neutral') {
          setLookDir({ x: 0, y: 0 });
          return;
      }

      const lookInterval = setInterval(() => {
          const x = (Math.random() - 0.5) * 10; 
          const y = (Math.random() - 0.5) * 6;
          setLookDir({ x, y });
          setTimeout(() => setLookDir({ x: 0, y: 0 }), 1500);
      }, 5000 + Math.random() * 4000);

      return () => clearInterval(lookInterval);
  }, [sentiment]);

  const blinkClass = blink ? "!h-1 !mt-8 scale-y-0" : "";

  return (
    <div className="relative flex items-center justify-center w-full py-6 perspective-[1000px]">
      <style>{`
        @keyframes speak {
          0%, 100% { height: 10px; transform: scaleX(1); }
          50% { height: 28px; transform: scaleX(0.9); }
        }
        @keyframes aggressivePulse {
          0% { transform: scale(1); box-shadow: 0 0 50px rgba(220,38,38,0.5); }
          50% { transform: scale(1.15); box-shadow: 0 0 120px rgba(220,38,38,1); }
          100% { transform: scale(1); box-shadow: 0 0 50px rgba(220,38,38,0.5); }
        }
        @keyframes jitter {
          0% { transform: translate(0, 0); }
          25% { transform: translate(4px, 4px); }
          50% { transform: translate(-4px, -4px); }
          75% { transform: translate(4px, -4px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255,255,255,0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(255,255,255,0.5); }
        }
      `}</style>
      
      {/* Main Orb Container */}
      <div 
        className={`relative w-56 h-56 rounded-[3.5rem] flex flex-col items-center justify-center transition-all duration-500 border-[3px] border-white/10 overflow-hidden ${containerClass}`}
        style={{ transform: containerTransform }}
      >
          {/* Internal Face Group */}
          <div 
            className="flex flex-col items-center justify-center transition-transform duration-1000 ease-out"
            style={{ transform: faceContentTransform }}
          >
              {/* Eyes */}
              <div className="flex gap-10 items-center justify-center z-10 relative">
                  <div className={`${eyeLeftStyle} ${eyeClass} ${blinkClass} relative overflow-hidden flex items-start justify-end`}>
                      {sentiment !== 'happy' && <div className="w-4 h-4 bg-white/80 rounded-full blur-[1px] absolute top-2 right-2"></div>}
                  </div>
                  <div className={`${eyeRightStyle} ${eyeClass} ${blinkClass} relative overflow-hidden flex items-start justify-end`}>
                       {sentiment !== 'happy' && <div className="w-4 h-4 bg-white/80 rounded-full blur-[1px] absolute top-2 right-2"></div>}
                  </div>
                  {/* Cheeks */}
                  <div className={`absolute -left-4 top-8 w-8 h-4 bg-pink-400/40 blur-md rounded-full transition-opacity duration-500 ${cheekClass}`}></div>
                  <div className={`absolute -right-4 top-8 w-8 h-4 bg-pink-400/40 blur-md rounded-full transition-opacity duration-500 ${cheekClass}`}></div>
              </div>
              
              {/* Mouth */}
              <div className={`z-10 ${mouthStyle} ${mouthClass} transition-all duration-300`}></div>
          </div>

          {/* Thinking Dots */}
          {sentiment === 'thinking' && (
             <div className="absolute bottom-6 flex gap-2 z-20">
                 <div className="w-2 h-2 bg-blue-300 rounded-full animate-[bounce_0.6s_infinite]"></div>
                 <div className="w-2 h-2 bg-blue-300 rounded-full animate-[bounce_0.6s_infinite_0.1s]"></div>
                 <div className="w-2 h-2 bg-blue-300 rounded-full animate-[bounce_0.6s_infinite_0.2s]"></div>
             </div>
          )}

          {/* Glint */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-[4rem] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default AuraOrb;
