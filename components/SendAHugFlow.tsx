
import React, { useState } from 'react';
import { Camera, X, Mic, Send, Heart, RefreshCcw, Check, Smile, Users, Facebook, MessageCircle, Mail } from 'lucide-react';

type HugStep = 'capture' | 'message' | 'share_select' | 'sending' | 'success';

interface SendAHugFlowProps {
    onClose: () => void;
}

const SendAHugFlow: React.FC<SendAHugFlowProps> = ({ onClose }) => {
    const [step, setStep] = useState<HugStep>('capture');
    const [photo, setPhoto] = useState<string | null>(null);
    const [voiceText, setVoiceText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const [destination, setDestination] = useState<string | null>(null);

    const handleCapture = () => {
        setPhoto("https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1000&auto=format&fit=crop");
        setStep('message');
    };

    const handleRecord = () => {
        setIsRecording(true);
        setTimeout(() => {
            setVoiceText("Thinking of you and sending a big hug! Love you!");
            setIsRecording(false);
        }, 2000);
    };

    const startSending = (destName: string) => {
        setDestination(destName);
        setStep('sending');
        setTimeout(() => {
            setStep('success');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[250] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none">

            {/* Header - Matching screenshot style */}
            {step !== 'success' && step !== 'sending' && (
                <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-500 p-2 rounded-full">
                            <Heart size={24} fill="white" className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-pink-500 uppercase tracking-tight">
                            {step === 'capture' ? 'SMILE!' : step === 'message' ? 'YOUR HUG' : 'SHARE THE LOVE'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <X size={28} />
                    </button>
                </div>
            )}

            {/* Step 1: Capture - Aligned with screenshot */}
            {step === 'capture' && (
                <div className="flex-1 flex flex-col bg-[#111827] relative overflow-hidden">
                    {/* Simulated Camera Feed */}
                    <div className="absolute inset-0 opacity-40">
                        <img
                            src="https://images.unsplash.com/photo-1544175316-0887113141f2?q=80&w=1000&auto=format&fit=crop"
                            className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                            alt="Camera feed"
                        />
                    </div>

                    {/* Viewfinder - Dashed circle with smiley */}
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="relative w-full aspect-square border-4 border-white/20 border-dashed rounded-full flex items-center justify-center">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Smile size={64} className="text-white/30" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Controls - Bottom Buttons aligned with screenshot */}
                    <div className="h-56 flex items-center justify-center gap-10 px-8 relative z-10">
                        {/* Flip Camera */}
                        <button
                            onClick={() => setIsFrontCamera(!isFrontCamera)}
                            className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                        >
                            <RefreshCcw size={32} />
                        </button>

                        {/* Shutter Button - White with Pink Ring */}
                        <button
                            onClick={handleCapture}
                            className="w-32 h-32 rounded-full bg-white p-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
                        >
                            <div className="w-full h-full rounded-full border-[6px] border-pink-500 flex items-center justify-center bg-white" />
                        </button>

                        {/* Spacer for symmetry */}
                        <div className="w-16 h-16" />
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">Capture Smile</p>
                    </div>
                </div>
            )}

            {/* Step 2: Card Preview & Voice */}
            {step === 'message' && (
                <div className="flex-1 flex flex-col p-8 bg-[#FDFBF7] overflow-y-auto no-scrollbar">
                    <div className="bg-white rounded-[3rem] p-6 shadow-2xl border-2 border-pink-100 flex flex-col gap-6 transform -rotate-1">
                        <div className="w-full aspect-square rounded-[2rem] overflow-hidden">
                            <img src={photo!} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center pb-4">
                            <p className="text-3xl font-medium text-pink-600 leading-tight italic">
                                {voiceText ? `"${voiceText}"` : "Say something sweet..."}
                            </p>
                        </div>
                    </div>
                    <div className="mt-12 space-y-6">
                        <button
                            onClick={handleRecord}
                            disabled={isRecording}
                            className={`w-full py-10 rounded-[3rem] flex items-center justify-center gap-6 shadow-2xl transition-all active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-pink-500 text-white'}`}
                        >
                            <Mic size={56} fill="white" />
                            <span className="text-4xl font-black uppercase tracking-tight">{isRecording ? 'Listening...' : 'Say Hug'}</span>
                        </button>
                        {voiceText && (
                            <button
                                onClick={() => setStep('share_select')}
                                className="w-full bg-[#001A33] text-white py-10 rounded-[3rem] text-4xl font-black shadow-[0_12px_0_#000a14] active:translate-y-2 active:shadow-none transition-all uppercase"
                            >
                                Send Now
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Share Selection */}
            {step === 'share_select' && (
                <div className="flex-1 flex flex-col bg-[#FFF5F8] overflow-y-auto no-scrollbar">
                    {/* Top Preview Card */}
                    <div className="p-8">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-pink-100 flex flex-col gap-4 transform rotate-1">
                            <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-inner">
                                <img src={photo!} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-pink-500 p-2 rounded-full shadow-lg">
                                    <Heart size={20} fill="white" className="text-white" />
                                </div>
                            </div>
                            <div className="px-2 text-center pb-2">
                                <p className="text-2xl font-bold text-pink-600 leading-tight italic">
                                    "{voiceText || "Sending a hug!"}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Sharing Action Buttons */}
                    <div className="flex-1 bg-white rounded-t-[3.5rem] p-8 shadow-[0_-10px_40px_rgba(236,72,153,0.1)] space-y-6">
                        <p className="text-center text-pink-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Send to your family</p>

                        <button
                            onClick={() => startSending('Family')}
                            className="w-full bg-[#1152D4] text-white py-8 px-10 rounded-[2rem] flex items-center justify-between shadow-[0_8px_0_#003380] active:translate-y-1 active:shadow-none transition-all"
                        >
                            <span className="text-4xl font-black uppercase tracking-tight">Family Group</span>
                            <Users size={48} fill="white" />
                        </button>

                        <button
                            onClick={() => startSending('Facebook')}
                            className="w-full bg-[#1877F2] text-white py-8 px-10 rounded-[2rem] flex items-center justify-between shadow-[0_8px_0_#0d52a8] active:translate-y-1 active:shadow-none transition-all"
                        >
                            <span className="text-4xl font-black uppercase tracking-tight">Facebook</span>
                            <Facebook size={48} fill="white" />
                        </button>

                        <button
                            onClick={() => startSending('WhatsApp')}
                            className="w-full bg-[#25D366] text-white py-8 px-10 rounded-[2rem] flex items-center justify-between shadow-[0_8px_0_#18a04d] active:translate-y-1 active:shadow-none transition-all"
                        >
                            <span className="text-4xl font-black uppercase tracking-tight">WhatsApp</span>
                            <MessageCircle size={48} fill="white" />
                        </button>

                        <button
                            onClick={() => startSending('Email')}
                            className="w-full bg-[#EA4335] text-white py-8 px-10 rounded-[2rem] flex items-center justify-between shadow-[0_8px_0_#b32d21] active:translate-y-1 active:shadow-none transition-all"
                        >
                            <span className="text-4xl font-black uppercase tracking-tight">Email</span>
                            <Mail size={48} fill="white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Sending Animation */}
            {step === 'sending' && (
                <div className="absolute inset-0 bg-pink-500 flex flex-col items-center justify-center p-10 z-[300]">
                    <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center relative mb-12 animate-pulse">
                        <div className="absolute inset-0 border-8 border-white border-t-transparent rounded-full animate-spin duration-700" />
                        <Heart size={100} fill="white" className="text-white animate-bounce" />
                    </div>
                    <h2 className="text-6xl font-black text-white text-center leading-tight">
                        Sending to {destination}...
                    </h2>
                </div>
            )}

            {/* Step 5: Success Screen */}
            {step === 'success' && (
                <div className="absolute inset-0 bg-[#FF69B4] flex flex-col items-center justify-center p-10 z-[400] text-center">
                    <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl animate-in zoom-in duration-500">
                        <Heart size={100} strokeWidth={4} fill="#FF69B4" className="text-[#FF69B4]" />
                    </div>
                    <h2 className="text-6xl font-black text-white mb-4">Hug Sent!</h2>
                    <p className="text-2xl text-white font-bold mb-16 px-6">Your family will feel so happy!</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-white text-[#FF69B4] py-8 rounded-[2.5rem] text-4xl font-black shadow-[0_12px_0_#d14d8c] active:translate-y-2 active:shadow-none transition-all uppercase"
                    >
                        Back Home
                    </button>
                </div>
            )}

        </div>
    );
};

export default SendAHugFlow;
