
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface ShieldsViewProps {
  onTriggerAlert: () => void;
  onOpenGuide?: () => void;
}

type ShieldViewState = 'SUMMARY' | 'DETAILS' | 'SCANNING' | 'SUB_GUARDIAN' | 'SUB_VITALS' | 'SUB_DIGITAL';

const ShieldsView: React.FC<ShieldsViewProps> = ({ onTriggerAlert, onOpenGuide }) => {
  const [viewState, setViewState] = useState<ShieldViewState>('SUMMARY');
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Haptic Helper
  const vibrate = (pattern: number | number[] = 10) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  };

  // Dynamic score based on user action
  const currentScore = medicationTaken ? 100 : 75;
  const tasksCompleted = medicationTaken ? 4 : 3;

  const handleTakeMedication = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      vibrate([50, 50, 50]); // Haptic feedback
      setMedicationTaken(true);
  };

  const startSystemScan = () => {
      vibrate(20);
      setViewState('SCANNING');
      setScanProgress(0);
  };

  // Scan Simulation Effect
  useEffect(() => {
      if (viewState === 'SCANNING') {
          const interval = setInterval(() => {
              setScanProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      setTimeout(() => setViewState('DETAILS'), 500);
                      return 100;
                  }
                  return prev + 2;
              });
          }, 30);
          return () => clearInterval(interval);
      }
  }, [viewState]);

  // --- SUB-VIEW: SCANNING ---
  const renderScanning = () => (
      <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in">
          <div className="relative w-64 h-64 mb-8">
               <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
               <div 
                  className="absolute inset-0 rounded-full border-t-4 border-[#00E341] animate-spin"
                  style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
               ></div>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <Icons.Shield className="w-16 h-16 text-[#00E341] animate-pulse mb-2" />
                   <span className="text-3xl font-bold text-gray-900">{scanProgress}%</span>
               </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Running System Diagnostics</h2>
          <p className="text-gray-500">Checking Guardian, Vitals, and Identity...</p>
          <div className="mt-8 space-y-2 w-full max-w-xs">
              <div className={`flex items-center gap-3 ${scanProgress > 30 ? 'opacity-100' : 'opacity-30'}`}>
                  <Icons.Check className="w-5 h-5 text-green-500" /> <span className="font-bold text-gray-700">Database Updated</span>
              </div>
              <div className={`flex items-center gap-3 ${scanProgress > 60 ? 'opacity-100' : 'opacity-30'}`}>
                   <Icons.Check className="w-5 h-5 text-green-500" /> <span className="font-bold text-gray-700">Fraud Patterns Checked</span>
              </div>
              <div className={`flex items-center gap-3 ${scanProgress > 90 ? 'opacity-100' : 'opacity-30'}`}>
                   <Icons.Check className="w-5 h-5 text-green-500" /> <span className="font-bold text-gray-700">Vitals Synced</span>
              </div>
          </div>
      </div>
  );

  // --- SUB-VIEW: SPECIFIC COMPONENT DETAILS ---
  
  const renderComponentDetail = (
      title: string, 
      icon: React.ReactNode, 
      items: { title: string; status: string; statusColor: string }[]
    ) => (
      <div className="animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 mb-6">
             <button onClick={() => { vibrate(); setViewState('DETAILS'); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                 <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
             </button>
             <span className="text-xl font-bold text-gray-900">{title}</span>
          </div>
          
          <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center mb-8 shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  {icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Status: Secure</h2>
              <p className="text-gray-500">Last scanned: Just now</p>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Active Protocols</h3>
          <div className="space-y-4">
              {items.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                      <span className="font-bold text-gray-800">{item.title}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.statusColor}`}>
                          {item.status}
                      </span>
                  </div>
              ))}
          </div>
      </div>
  );

  // --- SPECIALIZED VITALS DETAIL VIEW ---
  const renderVitalsDetail = () => (
      <div className="animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 mb-6">
             <button onClick={() => { vibrate(); setViewState('DETAILS'); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                 <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
             </button>
             <span className="text-xl font-bold text-gray-900">Vitals Monitor</span>
          </div>

          {/* Vitals Hero Card */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center mb-8 shadow-sm border border-gray-100">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${medicationTaken ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <Icons.Heart className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{medicationTaken ? 'All Clear' : 'Attention Needed'}</h2>
              <p className="text-gray-500">Daily Health Check</p>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Medication Schedule</h3>
          
          {/* Interactive Medication Item */}
          <div className={`p-6 rounded-3xl mb-4 border-2 transition-all ${medicationTaken ? 'bg-green-50 border-green-200' : 'bg-white border-yellow-200 shadow-lg'}`}>
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h4 className="font-bold text-xl text-gray-900">Lisinopril (10mg)</h4>
                      <p className="text-gray-500 font-medium">1 tablet with lunch</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${medicationTaken ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {medicationTaken ? 'TAKEN' : 'PENDING'}
                  </div>
              </div>

              {!medicationTaken ? (
                  <button 
                    onClick={() => handleTakeMedication()}
                    className="w-full h-14 bg-[#00E341] rounded-2xl text-black font-bold text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                  >
                      <Icons.Check className="w-6 h-6" /> Mark as Taken
                  </button>
              ) : (
                  <div className="flex items-center gap-2 text-green-700 font-bold">
                      <Icons.Check className="w-5 h-5" /> Completed at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
              )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 px-2 mt-8">Other Metrics</h3>
          <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                  <span className="font-bold text-gray-800">Step Count</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">1,240 steps</span>
              </div>
              <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                  <span className="font-bold text-gray-800">Heart Rate</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">Stable (72 bpm)</span>
              </div>
          </div>
      </div>
  );


  // --- SUB-VIEW: MAIN DETAILS ---
  const renderDetails = () => (
      <div className="animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
             <button onClick={() => { vibrate(); setViewState('SUMMARY'); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                 <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
             </button>
             <span className="text-xl font-bold text-gray-900">Shield Status</span>
          </div>

          {/* Big Score Indicator - Fixed Layout */}
          <div className="flex flex-col items-center justify-center py-10 mb-6 bg-white rounded-[2rem] shadow-sm border border-gray-100">
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                  {/* Circular Background - Optimized ViewBox for Full Visibility */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="70" stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
                      <circle 
                        cx="90" cy="90" r="70" 
                        stroke={currentScore === 100 ? "#00E341" : "#059669"} 
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={440} 
                        strokeDashoffset={440 - (440 * currentScore) / 100} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-bold text-gray-900 tracking-tighter">{currentScore}%</span>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">Secure</span>
                  </div>
              </div>
              <p className="text-gray-500 text-center px-8 text-sm font-medium leading-relaxed max-w-xs">
                  {currentScore === 100 
                    ? "Excellent! All shields are active and systems are nominal." 
                    : "Good condition. Complete pending tasks to reach maximum protection."}
              </p>
          </div>

          {/* Detailed List */}
          <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">System Breakdown</h3>
          <div className="space-y-4 mb-8">
              
              {/* Guardian Shield */}
              <div 
                onClick={() => { vibrate(); setViewState('SUB_GUARDIAN'); }}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Icons.Shield className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Guardian AI</h4>
                      <p className="text-xs text-gray-500">Scam & Fraud Protection</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</div>
                    <Icons.ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                  </div>
              </div>

              {/* Vitals Shield (Health) */}
              <div 
                onClick={() => { vibrate(); setViewState('SUB_VITALS'); }}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${medicationTaken ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      <Icons.Heart className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Vitals Monitor</h4>
                      <p className="text-xs text-gray-500">Medication & Health</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${medicationTaken ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {medicationTaken ? 'Active' : 'Attention'}
                    </div>
                    <Icons.ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                  </div>
              </div>

              {/* Digital Shield */}
              <div 
                onClick={() => { vibrate(); setViewState('SUB_DIGITAL'); }}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Icons.Wrench className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Digital Identity</h4>
                      <p className="text-xs text-gray-500">Account Security</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</div>
                    <Icons.ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                  </div>
              </div>

          </div>

          <button 
            onClick={startSystemScan}
            className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold mb-6 active:scale-95 transition-transform shadow-lg"
          >
              Run Full System Scan
          </button>
      </div>
  );

  // --- SUB-VIEW: SUMMARY (Main Dashboard) ---
  const renderSummary = () => (
      <div className="animate-in slide-in-from-left duration-300">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <p className="text-[#166534] font-bold text-xs uppercase tracking-widest mb-1">Aura Assistant</p>
                  <h1 className="text-3xl font-bold text-[#064E3B]">Health Shields</h1>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => { vibrate(); onOpenGuide && onOpenGuide(); }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#064E3B] shadow-sm">
                     <span className="font-bold text-lg">?</span>
                 </button>
              </div>
          </div>

          <p className="text-gray-500 mb-6">Good morning, Martha.</p>

          {/* Main Health Shield Card (Interactive) */}
          <div 
            onClick={() => { vibrate(); setViewState('DETAILS'); }}
            className="w-full bg-[#1A2E26] rounded-[32px] p-6 mb-6 text-white shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all group"
          >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icons.ArrowRight className="w-6 h-6 text-[#4ADE80] -rotate-45" />
              </div>

              <div className="flex justify-between items-end mb-4">
                  <div>
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-wide mb-1">SHIELD STRENGTH</p>
                      <h2 className="text-5xl font-bold transition-all duration-500">{currentScore}%</h2>
                  </div>
                  <div className="px-3 py-1 bg-[#064E3B] rounded-full text-[#4ADE80] text-xs font-bold mb-2 transition-all">
                      {tasksCompleted} of 4 tasks done
                  </div>
              </div>
              
              <div className="w-full bg-[#2D453B] h-3 rounded-full mb-8 overflow-hidden">
                  <div 
                    className="h-full bg-[#4ADE80] rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)] transition-all duration-700 ease-out"
                    style={{ width: `${currentScore}%` }}
                  ></div>
              </div>

              <p className="text-gray-400 text-sm mb-4 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {currentScore === 100 
                    ? "System is fully secure. Great job!" 
                    : "Tap to see details. Complete pending tasks for full protection."}
              </p>
          </div>

          {/* Task Card - Medication */}
          <div className={`w-full rounded-[32px] p-1 mb-6 relative overflow-hidden transition-all duration-500 ${medicationTaken ? 'bg-[#064E3B]' : 'bg-[#271A0C]'}`}>
              {/* Background Image Effect */}
              {!medicationTaken && (
                  <div className="absolute inset-0 opacity-40 pointer-events-none">
                      <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                  </div>
              )}

              <div className="relative p-6">
                  {!medicationTaken ? (
                      <>
                        <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 mb-4">
                            <div className="w-4 h-4 bg-[#00E341] rounded text-black flex items-center justify-center font-bold text-[10px]">+</div>
                            <span className="text-white font-bold text-xs">HIGH PRIORITY</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1 leading-tight">Take 1 Lisinopril with lunch</h3>
                        <p className="text-gray-300 text-sm mb-6">Your blood pressure shield</p>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleTakeMedication}
                                className="flex-1 h-12 bg-[#00E341] rounded-full text-black font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Icons.Check className="w-5 h-5" /> Mark Done
                            </button>
                            <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform">
                                <Icons.History className="w-5 h-5" />
                            </button>
                        </div>
                      </>
                  ) : (
                      <div className="flex items-center justify-between animate-in fade-in duration-500">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#4ADE80] rounded-full flex items-center justify-center text-[#064E3B]">
                                  <Icons.Check className="w-6 h-6" />
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white">Medication Taken</h3>
                                  <p className="text-[#4ADE80] text-sm">Shield Updated</p>
                              </div>
                          </div>
                          <button 
                             onClick={(e) => { e.stopPropagation(); vibrate(); setMedicationTaken(false); }}
                             className="text-xs text-white/50 font-bold underline"
                          >
                              Undo
                          </button>
                      </div>
                  )}
              </div>
          </div>

          {/* Quick Action - Sun */}
          <div className="bg-[#1F2937] rounded-[32px] p-6 mb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#374151] flex items-center justify-center text-[#60A5FA]">
                  <div className="w-6 h-6">☀️</div>
              </div>
              <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">The sun is out!</h3>
                  <p className="text-gray-400 text-sm leading-snug mt-1">
                      How about a 10-minute walk? It will help boost your mood.
                  </p>
                  <div className="flex gap-3 mt-3">
                      <button className="bg-[#374151] px-4 py-2 rounded-lg text-white font-bold text-sm">Learn More</button>
                      <button className="text-gray-500 font-bold text-sm px-2">Dismiss</button>
                  </div>
              </div>
          </div>

          {/* Manual Trigger for Demo */}
          <div className="mt-8 text-center">
              <button onClick={() => { vibrate(); onTriggerAlert(); }} className="text-[#EF4444] font-bold text-sm underline opacity-50 hover:opacity-100">
                  Simulate Scam Call (Guardian)
              </button>
          </div>
      </div>
  );

  return (
    <div className="w-full h-full bg-[#F9FAFB] px-6 pt-12 pb-32 overflow-y-auto">
        {viewState === 'SUMMARY' && renderSummary()}
        {viewState === 'DETAILS' && renderDetails()}
        {viewState === 'SCANNING' && renderScanning()}
        {viewState === 'SUB_VITALS' && renderVitalsDetail()}
        
        {/* Render Specific Sub Views */}
        {viewState === 'SUB_GUARDIAN' && renderComponentDetail(
            'Guardian AI', 
            <Icons.Shield className="w-8 h-8 text-green-600" />,
            [
                { title: 'Call Blocking', status: 'On', statusColor: 'bg-green-100 text-green-700' },
                { title: 'SMS Filter', status: 'On', statusColor: 'bg-green-100 text-green-700' },
                { title: 'Known Spammers', status: 'Blocked (4)', statusColor: 'bg-gray-100 text-gray-700' },
            ]
        )}
        {viewState === 'SUB_DIGITAL' && renderComponentDetail(
            'Digital Identity', 
            <Icons.Wrench className="w-8 h-8 text-blue-600" />,
            [
                { title: 'Password Strength', status: 'Strong', statusColor: 'bg-green-100 text-green-700' },
                { title: '2FA', status: 'Enabled', statusColor: 'bg-green-100 text-green-700' },
                { title: 'Data Breaches', status: 'None Found', statusColor: 'bg-green-100 text-green-700' },
            ]
        )}
    </div>
  );
};

export default ShieldsView;
