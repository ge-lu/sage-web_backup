
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { analyzeVisualContext, ScanResult } from '../services/geminiService';
import PriceComparisonCard from '../components/PriceComparisonCard';
import { createMedication } from '../services/api';
import { Medication } from '../types';
import asr from '../util/ASRindex';
import tts from '../util/TTSindex';

interface OmnibusScanProps {
    onBack?: () => void;
    onNavigateToShopping?: () => void;
    onScanUsed?: () => void;
}

const OmnibusScan: React.FC<OmnibusScanProps> = ({ onBack, onNavigateToShopping, onScanUsed }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFeedPaused, setIsFeedPaused] = useState(false); // New state for manual toggle
  const [processingState, setProcessingState] = useState<'IDLE' | 'CAPTURING' | 'ANALYZING' | 'RESULT'>('IDLE');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [guideText, setGuideText] = useState("Scan Anything");
  const [listeningForCommand, setListeningForCommand] = useState(false);
  const [showScanComplete, setShowScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Camera Controls
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // State for heart icon
  const [brightnessLevel, setBrightnessLevel] = useState(1);
  
  // Helper for TTS
  const speak = (text: string) => {
      // Clear previous if any, though tts.speak probably handles it
      tts.cancel();
      tts.speak(text, { rate: 1.0 });
  };

  // Helper for Haptics
  const vibrate = (pattern: number | number[] = 10) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  };

  // Rotating Guide Text for First-Time Users
  useEffect(() => {
    if (processingState !== 'IDLE') return;

    const prompts = [
        "Scan Bills & Letters",
        "Check Product Prices", 
        "Identify Medications",
        "Scan Anything" 
    ];
    let index = 0;
    
    // Initial set
    setGuideText(prompts[0]);

    const interval = setInterval(() => {
        index = (index + 1) % prompts.length;
        setGuideText(prompts[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [processingState]);

  // Progress Bar Simulation
  useEffect(() => {
      if (processingState === 'ANALYZING') {
          setProgress(0);
          const interval = setInterval(() => {
              setProgress((prev) => {
                  // Simulate progress that slows down as it approaches 95%
                  const remaining = 100 - prev;
                  const jump = Math.max(0.5, Math.random() * (remaining / 10)); 
                  const next = prev + jump;
                  return next > 95 ? 95 : next;
              });
          }, 150);
          return () => clearInterval(interval);
      } else {
          setProgress(0);
      }
  }, [processingState]);

  // Voice Command Listener for Result View
  useEffect(() => {
    if (processingState === 'RESULT') {
        // Start listening when result is shown
        // Use continuous mode if possible, or restart onEnd
        const startListening = () => {
             asr.start({
                continuous: true,
                onResult: (text, isFinal) => {
                    const command = text.trim().toLowerCase();
                    console.log("Omnibus Voice Command:", command);
                    
                    if (!isFinal) return; // Wait for final command to avoid jitter? Or utilize partials? 
                    // Original code used results[last], which implies partials or finals.
                    // Let's use isFinal for now to be safe, or just check text.

                    // --- 1. GLOBAL NAVIGATION COMMANDS ---
                    if (command.includes('okay') || command.includes('thanks') || command.includes('close') || command.includes('stop') || command.includes('done') || command.includes('back')) {
                        handleCloseResult();
                        return;
                    }
                    
                    // --- 2. GLOBAL READ ACTIONS ---
                    if (command.includes('read') || command.includes('speak') || command.includes('what does it say')) {
                        if (result?.summary) speak(result.summary);
                        return;
                    }

                    // --- 3. CONTEXT-AWARE FOLLOW-UP LOGIC ---
                    if (result) {
                        // SCENARIO: SHOPPING / PRODUCT
                        if (result.type === 'PRODUCT') {
                            if (command.includes('buy') || command.includes('purchase') || command.includes('get it')) {
                                // Vendor Selection Logic
                                if (command.includes('amazon')) {
                                    speak("Opening Amazon.");
                                    handleShopSelect('Amazon');
                                } else if (command.includes('walmart')) {
                                    speak("Opening Walmart.");
                                    handleShopSelect('Walmart');
                                } else {
                                    speak("I found it at Walmart and Amazon. Which store do you prefer?");
                                }
                            } else if (command.includes('cheapest') || command.includes('best price') || command.includes('lower price')) {
                                    // Simple logic to find lowest price in mock data
                                    const products = result.products || [];
                                    const cheapest = products.reduce((prev, curr) => {
                                        const p1 = parseFloat(prev.price.replace(/[^0-9.]/g, ''));
                                        const p2 = parseFloat(curr.price.replace(/[^0-9.]/g, ''));
                                        return p1 < p2 ? prev : curr;
                                    });
                                    if (cheapest) speak(`The best price is ${cheapest.price} at ${cheapest.vendor}.`);
                            }
                        }

                        // SCENARIO: DOCUMENT / BILL
                        else if (result.type === 'DOCUMENT') {
                            if (command.includes('pay') || command.includes('paid')) {
                                speak("I can help you pay this. Would you like to use your card ending in 4242?");
                            } else if (command.includes('yes') || command.includes('sure') || command.includes('please')) {
                                speak("Payment scheduled for the due date. I've sent a confirmation to your email.");
                            } else if (command.includes('due') || command.includes('when')) {
                                    speak("It looks like this bill is due on October 28th.");
                            }
                        }
                    }
                },
                onError: (e) => {
                    console.error("Voice recognition start failed", e);
                }
            });
            setListeningForCommand(true);
        };
        
        startListening();
        
    } else {
        setListeningForCommand(false);
        // Stop TTS when leaving result view
        tts.cancel();
        asr.stop();
    }

    return () => {
        asr.stop();
    };
  }, [processingState, result]);

  // Setup Camera with Advanced Constraints (Flash/FacingMode)
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (isCameraOn && !isFeedPaused) {
            const constraints: MediaStreamConstraints = {
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280 }, // Limit input resolution
                    height: { ideal: 720 },
                    // Advanced constraint for torch (flash) if supported
                    advanced: [{ torch: isFlashOn } as any] 
                } 
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Apply torch again on track level if supported (for some browsers)
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            if (capabilities.torch) {
                 track.applyConstraints({
                     advanced: [{ torch: isFlashOn } as any]
                 });
            }

        } else {
            if (videoRef.current) videoRef.current.srcObject = null;
            if (stream) {
                 (stream as MediaStream).getTracks().forEach(track => track.stop());
            }
        }
      } catch (err) { 
          console.error("Camera failed:", err); 
      }
    };
    startCamera();
    return () => { if (stream) (stream as MediaStream).getTracks().forEach(track => track.stop()); };
  }, [isCameraOn, facingMode, isFlashOn, isFeedPaused]);

  const toggleCamera = () => {
      vibrate();
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const toggleFlash = () => {
      vibrate();
      setIsFlashOn(!isFlashOn);
  };

  const handleCloseResult = () => {
      vibrate();
      setProcessingState('IDLE');
      setIsFavorite(false);
      setShowScanComplete(false);
      // Clean up voice synthesis
      tts.cancel();
  };

  const captureAndAnalyze = async () => {
      if (!videoRef.current) return;
      vibrate([50, 20]);

      setProcessingState('CAPTURING');
      if (onScanUsed) onScanUsed();

      // Capture Frame from Video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // OPTIMIZATION: Resize image to max 800px width/height to reduce latency
      const MAX_DIMENSION = 800;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > height) {
          if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
          }
      } else {
          if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
          }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
      }
      
      // OPTIMIZATION: Use JPEG with 0.6 quality (significant size reduction vs PNG)
      const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
      
      // Flash Effect & Transition
      setTimeout(() => setProcessingState('ANALYZING'), 200);

      try {
          // Pass Scan Mode to context? For now we rely on the classifier, 
          // but specifically if we are in QR mode we might want to tell the user we found one.
          const scanResult = await analyzeVisualContext(base64Image);
          setResult(scanResult);
          setProcessingState('RESULT');
          setShowScanComplete(true);
          vibrate([20, 50, 20]); // Success vibration
          
          // Flash scan complete message
          setTimeout(() => {
              setShowScanComplete(false);
          }, 1500);
          
          // Trigger Vibration for High Risk
          if (scanResult.riskLevel === 'DANGER') {
             vibrate([500, 200, 500]);
          }
          
          // Auto-read summary for accessibility
          if(scanResult && scanResult.summary) {
              speak(scanResult.summary);
          }
      } catch (error) {
          console.error("Analysis Failed", error);
          setProcessingState('IDLE');
          vibrate([100, 50, 100]); // Error vibration
          speak("I couldn't identify that. Please try again.");
      }
  };

  const handleShopSelect = (vendor: string) => {
      handleCloseResult();
      if (onNavigateToShopping) {
          onNavigateToShopping();
      }
  };

  const handleSaveMedications = async () => {
      if (!result || !result.medications || result.medications.length === 0) return;
      
      try {
          const today = new Date().toISOString().split('T')[0];
          
          // Save each medication
          for (const med of result.medications) {
              const medication: Omit<Medication, 'id'> = {
                  name: med.name,
                  dosage: med.dosage,
                  frequency: med.frequency,
                  times: med.times || [],
                  instructions: med.instructions,
                  startDate: today,
                  endDate: med.duration ? undefined : undefined, // Can calculate from duration
                  source: result.type === 'PRESCRIPTION' ? 'prescription' : 'discharge_summary',
                  createdAt: new Date().toISOString(),
                  status: 'active'
              };
              
              await createMedication(medication);
          }
          
          speak(`Saved ${result.medications.length} medication${result.medications.length > 1 ? 's' : ''} to medication management`);
          vibrate([50, 50, 50]);
          
          // Close result page and return to Care page
          handleCloseResult();
          if (onBack) {
              onBack();
          }
          // Navigate to Care page (assuming route is /care or similar)
          // Adjust based on actual routing
          setTimeout(() => {
              // Can trigger an event or use global state to refresh Care page
              window.dispatchEvent(new CustomEvent('medications-updated'));
          }, 500);
          
      } catch (error) {
          console.error("Failed to save medications:", error);
          speak("Failed to save. Please try again.");
      }
  };

  // --- RENDER FUNCTIONS FOR DIFFERENT AGENT MODES ---

  const renderResultSheet = () => {
      if (!result) return null;

      // 💊 Prescription/Discharge Summary Handler
      if ((result.type === 'PRESCRIPTION' || result.type === 'DISCHARGE_SUMMARY') && result.medications) {
          return (
             <div className="absolute bottom-0 left-0 right-0 z-40 pb-safe">
                 <div className="bg-white rounded-t-[32px] animate-in slide-in-from-bottom duration-300 p-6 pb-safe-offset shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                     <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0"></div>
                     
                     <div className="flex items-start gap-4 mb-6">
                         <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                             <Icons.Heart className="w-7 h-7" />
                         </div>
                         <div className="pt-1">
                             <h2 className="text-2xl font-bold text-gray-900 leading-tight">{result.title}</h2>
                             <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mt-1">
                                 Medication Recognition
                             </p>
                         </div>
                     </div>
                     
                     <div className="bg-gray-50 p-6 rounded-3xl mb-6 border border-gray-100">
                         <p className="text-gray-900 text-lg leading-relaxed font-medium mb-4">"{result.summary}"</p>
                         <p className="text-sm text-gray-600 font-bold mb-3">Found {result.medications.length} medication{result.medications.length > 1 ? 's' : ''}:</p>
                         <div className="space-y-3 max-h-64 overflow-y-auto">
                             {result.medications.map((med, idx) => (
                                 <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200">
                                     <div className="flex items-start justify-between mb-2">
                                         <h4 className="font-bold text-gray-900">{med.name}</h4>
                                         <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                             {med.dosage}
                                         </span>
                                     </div>
                                     <p className="text-sm text-gray-600 mb-2">{med.frequency}</p>
                                     {med.times && med.times.length > 0 && (
                                         <div className="flex flex-wrap gap-2">
                                             {med.times.map((time, tIdx) => (
                                                 <span key={tIdx} className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                                                     {time}
                                                 </span>
                                             ))}
                                         </div>
                                     )}
                                     {med.instructions && (
                                         <p className="text-xs text-gray-500 italic mt-2">{med.instructions}</p>
                                     )}
                                 </div>
                             ))}
                         </div>
                     </div>

                     <div className="flex gap-3 mt-auto">
                         <button 
                             onClick={handleCloseResult}
                             className="flex-1 h-16 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
                         >
                             Cancel
                         </button>
                         <button 
                             onClick={handleSaveMedications}
                             className="flex-1 h-16 bg-[#00E341] text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
                         >
                             Save to Medications
                         </button>
                     </div>
                 </div>
             </div>
          );
      }

      // 🚚 Logistics Manager (Shopping)
      if (result.type === 'PRODUCT' && result.products) {
          return (
             <div className="absolute bottom-0 left-0 right-0 z-40 pb-safe">
                 {/* Custom Header with Heart for Product */}
                 <div className="absolute top-[-60px] right-6 z-50">
                     <button 
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}
                     >
                         <Icons.Heart className={`w-8 h-8 ${isFavorite ? 'fill-current' : ''}`} />
                     </button>
                 </div>
                 
                 <PriceComparisonCard 
                    products={result.products} 
                    onSelect={handleShopSelect}
                    onCancel={handleCloseResult}
                 />
             </div>
          );
      }

      // Shared "Okay, Thanks" Button Component with Prominent Listening State
      const BigCloseButton = () => (
        <div className="mt-auto pt-4 pb-2 w-full">
            <button 
                onClick={handleCloseResult} 
                className="w-full h-20 bg-[#111827] text-white rounded-full font-bold text-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center border border-gray-800"
            >
                Next Item
            </button>
        </div>
      );

      // 🛠️ Appliance Guide (AR Overlay Mode)
      if (result.type === 'APPLIANCE' && result.overlayIndicators) {
          return (
             <div className="absolute inset-0 z-40">
                 {/* AR Overlays */}
                 {result.overlayIndicators.map((indicator, idx) => (
                     <div 
                        key={idx}
                        className="absolute flex flex-col items-center animate-in zoom-in duration-700"
                        style={{ top: `${indicator.y}%`, left: `${indicator.x}%` }}
                     >
                         {/* Pulsing Outer Ring for Better Visibility */}
                         <div className="absolute inset-0 rounded-full animate-ping bg-[#00E341]/50 w-full h-full z-0"></div>
                         
                         {/* Animated Arrow */}
                         <div className={`relative z-10 text-[#00E341] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce ${indicator.direction === 'UP' ? 'rotate-180' : indicator.direction === 'LEFT' ? 'rotate-90' : indicator.direction === 'RIGHT' ? '-rotate-90' : ''}`}>
                             <Icons.ArrowRight className="w-14 h-14 rotate-90 stroke-[3px]" />
                         </div>
                         {/* Label */}
                         <div className="relative z-10 bg-black/90 backdrop-blur-md px-5 py-3 rounded-xl border-2 border-[#00E341] mt-2 shadow-2xl transform hover:scale-105 transition-transform">
                             <p className="text-white font-bold text-lg whitespace-nowrap">{indicator.label}</p>
                             <p className="text-[#00E341] font-bold text-xs uppercase tracking-wider text-center mt-1">Press Here</p>
                         </div>
                     </div>
                 ))}
                 
                 {/* Bottom Action Sheet */}
                 <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-safe-offset shadow-2xl">
                     <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0"></div>
                     <div className="flex items-center gap-4 mb-4">
                         <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                             <Icons.Wrench className="w-7 h-7" />
                         </div>
                         <div>
                             <h2 className="text-2xl font-bold text-gray-900">{result.title}</h2>
                             <p className="text-sm text-blue-600 font-bold uppercase">Usage Guide</p>
                         </div>
                     </div>
                     <p className="text-gray-800 text-lg mb-6 leading-relaxed font-medium">"{result.summary}"</p>
                     <BigCloseButton />
                 </div>
             </div>
          );
      }

      // 🔮 General / Document / Food / Tool / QR Result Display
      return (
         <div className="absolute inset-0 z-40 flex flex-col justify-end">
             
             {/* Transient Scan Complete Message */}
             {showScanComplete && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-48 z-50">
                     <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 animate-in fade-in zoom-in duration-300 shadow-xl">
                         <span className="text-white font-bold text-lg">Scan Complete!</span>
                     </div>
                 </div>
             )}

             <div className="bg-white rounded-t-[32px] animate-in slide-in-from-bottom duration-300 p-6 pb-safe-offset shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                 <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0"></div>
                 <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
                     <div className="flex items-start gap-4 mb-6">
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border 
                            ${result.type === 'SCAM' ? 'bg-red-100 text-red-600 border-red-200' : 
                              result.type === 'DOCUMENT' ? 'bg-purple-100 text-purple-600 border-purple-200' : 
                              result.type === 'FOOD' ? 'bg-green-100 text-green-600 border-green-200' :
                              result.type === 'TOOL' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                              result.type === 'QR_CODE' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                              'bg-blue-100 text-blue-600 border-blue-200'}`}>
                             {result.type === 'SCAM' ? <Icons.Shield className="w-7 h-7" /> : 
                              result.type === 'DOCUMENT' ? <Icons.FileText className="w-7 h-7" /> :
                              result.type === 'FOOD' ? <Icons.Check className="w-7 h-7" /> : 
                              result.type === 'TOOL' ? <Icons.Wrench className="w-7 h-7" /> :
                              result.type === 'QR_CODE' ? <Icons.Camera className="w-7 h-7" /> :
                              <Icons.Flash className="w-7 h-7" />}
                         </div>
                         <div className="pt-1">
                             <h2 className="text-2xl font-bold text-gray-900 leading-tight">{result.title}</h2>
                             <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mt-1">
                                 {result.type === 'SCAM' ? 'Risk Analysis' : 
                                  result.type === 'DOCUMENT' ? 'Document Explained' : 
                                  result.type === 'FOOD' ? 'Nutrition Facts' :
                                  result.type === 'TOOL' ? 'Tool Guide' :
                                  result.type === 'QR_CODE' ? 'QR Code Scanned' :
                                  'Visual Insight'}
                             </p>
                         </div>
                     </div>
                     
                     <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
                         <p className="text-gray-900 text-xl leading-relaxed font-medium">"{result.summary}"</p>
                         <div className="mt-5 flex flex-wrap items-center gap-3">
                            <button 
                                onClick={() => speak(result.summary)} 
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-gray-700 font-bold text-base shadow-sm border border-gray-200 active:scale-95 transition-transform"
                            >
                                <Icons.Mic className="w-5 h-5" /> Read to me
                            </button>

                            {listeningForCommand && (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-full border border-red-100 animate-pulse">
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                                    <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Listening...</span>
                                </div>
                            )}
                         </div>
                     </div>

                     {/* 🍎 FOOD SPECIFIC UI */}
                     {result.type === 'FOOD' && result.nutrition && (
                         <div className="grid grid-cols-3 gap-3 mb-6">
                             <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                                 <p className="text-green-800 text-xs font-bold uppercase">Calories</p>
                                 <p className="text-green-900 text-2xl font-bold">{result.nutrition.calories}</p>
                             </div>
                             <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                                 <p className="text-orange-800 text-xs font-bold uppercase">Sugar</p>
                                 <p className="text-orange-900 text-2xl font-bold">{result.nutrition.sugar}</p>
                             </div>
                             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                                 <p className="text-blue-800 text-xs font-bold uppercase">Protein</p>
                                 <p className="text-blue-900 text-2xl font-bold">{result.nutrition.protein}</p>
                             </div>
                         </div>
                     )}

                     {/* 🔧 TOOL SPECIFIC UI */}
                     {result.type === 'TOOL' && (
                         <div className="mb-6 bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-center gap-4">
                             <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-800 font-bold text-xl">?</div>
                             <div>
                                 <p className="text-orange-900 font-bold text-lg">How to use</p>
                                 <p className="text-orange-800 text-sm">Grip handle near end for max leverage.</p>
                             </div>
                         </div>
                     )}
                     
                     {result.type === 'SCAM' && result.riskLevel === 'DANGER' && (
                         <div className="mb-6">
                            <button className="w-full h-16 rounded-2xl font-bold text-xl bg-red-600 text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                                <Icons.X className="w-6 h-6" /> Block & Delete
                            </button>
                         </div>
                     )}

                     {/* QR LINK */}
                     {result.type === 'QR_CODE' && result.qrData && (
                         <div className="mb-6">
                            <button 
                                onClick={() => window.open(result.qrData, '_blank')}
                                className="w-full h-16 rounded-2xl font-bold text-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Icons.ArrowRight className="w-6 h-6" /> Open Link
                            </button>
                         </div>
                     )}

                 </div>
                 <BigCloseButton />
             </div>
         </div>
      );
  };

  return (
    <div className="relative w-full h-full bg-black">
      
      {/* Video Feed with Dynamic Filter for Brightness */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ filter: `brightness(${brightnessLevel})` }}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity transform ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${processingState === 'CAPTURING' || isFeedPaused ? 'opacity-0' : 'opacity-100'}`} 
      />
      
      {/* Feed Paused State */}
      {isFeedPaused && (
          <div className="absolute inset-0 z-0 bg-gray-900 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Icons.VideoOff className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400 font-bold text-lg">Camera Off</p>
          </div>
      )}

      {/* Flash Effect */}
      <div className={`absolute inset-0 bg-white z-10 pointer-events-none transition-opacity duration-200 ${processingState === 'CAPTURING' ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0 pointer-events-none"></div>

      {/* Header with Safe Area Padding */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
         <button onClick={() => { vibrate(); onBack && onBack(); }} className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md border border-white/10 active:scale-95 transition-transform">
             <Icons.X className="w-8 h-8 text-white" />
         </button>
         
         <div className="px-6 py-3 bg-black/60 border border-white/20 rounded-full backdrop-blur-md">
             <span className="text-white font-bold text-base tracking-wide">Omnibus Vision</span>
         </div>
         
         <div className="w-14"></div> {/* Spacer for balance */}
      </div>

      {/* Viewfinder UI */}
      {processingState === 'IDLE' && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <div className="relative w-[85%] aspect-[3/4] transition-all duration-300">
                {/* Thin White Frame */}
                <div className="absolute inset-0 border border-white/30 rounded-3xl"></div>
                
                {/* Thick Green Corners with Pulsing Glow */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-8 border-l-8 border-[#00E341] rounded-tl-3xl -mt-[4px] -ml-[4px] shadow-[0_0_15px_rgba(0,227,65,0.4)]"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-8 border-r-8 border-[#00E341] rounded-tr-3xl -mt-[4px] -mr-[4px] shadow-[0_0_15px_rgba(0,227,65,0.4)]"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-8 border-l-8 border-[#00E341] rounded-bl-3xl -mb-[4px] -ml-[4px] shadow-[0_0_15px_rgba(0,227,65,0.4)]"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-8 border-r-8 border-[#00E341] rounded-br-3xl -mb-[4px] -mr-[4px] shadow-[0_0_15px_rgba(0,227,65,0.4)]"></div>
                
                {/* Rotating Guide Text inside Box */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                    <div className="bg-black/70 backdrop-blur-md border border-[#00E341]/50 px-8 py-4 rounded-3xl animate-in fade-in zoom-in duration-300">
                         <p className="text-white font-bold text-2xl tracking-wide text-center min-w-[200px]">
                            {guideText}
                         </p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Analyzing Overlay with Progress & Reassurance - MOVED UP */}
      {processingState === 'ANALYZING' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-[20vh] bg-black/90 backdrop-blur-md px-6 text-center animate-in fade-in duration-500">
              
              <button 
                  onClick={() => { vibrate(); setProcessingState('IDLE'); }}
                  className="absolute top-12 right-6 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform z-50 mt-[calc(env(safe-area-inset-top))]"
              >
                  <Icons.X className="w-8 h-8 text-white" />
              </button>

              {/* Graphic */}
              <div className="relative mb-10">
                  {/* Outer glow */}
                  <div className="absolute inset-0 bg-[#00E341] blur-[60px] opacity-20 rounded-full animate-pulse"></div>
                  
                  {/* Spinner */}
                  <div className="w-32 h-32 rounded-full border-4 border-[#00E341]/30 relative flex items-center justify-center">
                       <div className="absolute inset-0 rounded-full border-t-4 border-[#00E341] animate-spin"></div>
                       <Icons.Search className="w-12 h-12 text-[#00E341]" />
                  </div>
              </div>

              {/* Text */}
              <h2 className="text-white font-bold text-3xl mb-2 tracking-wide">Searching...</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xs font-medium">
                  Please wait a moment while our intelligent agents analyze the image for you.
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-[280px] h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00E341] to-[#4ADE80] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(0,227,65,0.5)]"
                    style={{ width: `${progress}%` }}
                  >
                  </div>
              </div>
              <p className="text-[#00E341] font-bold mt-3 text-sm tracking-widest">{Math.round(progress)}%</p>
          </div>
      )}

      {/* Results */}
      {processingState === 'RESULT' && renderResultSheet()}

      {/* Controls - Positioned with safe area bottom padding */}
      {processingState === 'IDLE' && (
          <div className="absolute bottom-0 left-0 right-0 pb-safe-offset pt-10 flex flex-col justify-end z-30 bg-gradient-to-t from-black/90 to-transparent pointer-events-auto h-64">
             
             <div className="flex justify-center items-center gap-6 mb-4">
                
                {/* Flash Toggle */}
                <button 
                    onClick={toggleFlash}
                    className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border active:scale-95 transition-all ${isFlashOn ? 'bg-[#00E341] border-[#00E341] text-black' : 'bg-black/40 border-white/20 text-white'}`}
                >
                    <Icons.Flash className={`w-6 h-6 ${isFlashOn ? 'fill-current' : ''}`} />
                </button>

                {/* Capture Button */}
                <button 
                    onClick={captureAndAnalyze}
                    className="w-24 h-24 rounded-full bg-[#00E341] flex items-center justify-center shadow-[0_0_50px_rgba(0,227,65,0.5)] active:scale-95 transition-transform hover:scale-105 border-4 border-white/20"
                >
                    <div className="w-20 h-20 rounded-full border-4 border-white/30"></div>
                </button>

                {/* Camera Flip */}
                <button 
                    onClick={toggleCamera}
                    className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md border border-white/20 text-white active:scale-95 transition-transform"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                    </svg>
                </button>
             </div>
          </div>
      )}

    </div>
  );
};

export default OmnibusScan;
