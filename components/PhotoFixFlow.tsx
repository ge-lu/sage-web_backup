
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, ArrowRight, Wand2, RefreshCw, Upload, Sparkles, Share2, Facebook, MessageCircle, MessageSquare, Twitter, Music, Send } from 'lucide-react';
import { Post } from '../types';

interface PhotoFixFlowProps {
    onClose: () => void;
    onPostCreated?: (post: Post) => void;
}

type PhotoFixStep = 'scan' | 'processing' | 'result' | 'share';

const PhotoFixFlow: React.FC<PhotoFixFlowProps> = ({ onClose, onPostCreated }) => {
    const [step, setStep] = useState<PhotoFixStep>('scan');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [sliderPos, setSliderPos] = useState(50);
    const [shareDest, setShareDest] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (step === 'scan') {
            startCamera();
        }
        return () => stopCamera();
    }, [step]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            // Fallback for dev without camera
            if (step === 'scan') {
                // handleCapture fallback can trigger directly if needed or UI prompts
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleCapture = () => {
        // Determine image source (Camera vs Fallback)
        // For demo, we use a fixed image if camera isn't actually streaming well or just to simulate "old photo"
        const demoOldPhoto = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop";

        // In real app, capture from videoRef to canvas
        setOriginalImage(demoOldPhoto);
        setProcessedImage(demoOldPhoto); // Initially same, but will switch
        setStep('processing');

        // Simulate AI Processing
        setTimeout(() => {
            // Simulate "restored" version (just the cleaner version of same image or different filter)
            // Here we use the same URL but the UI will apply filters to 'original' to make it look old
            setStep('result');
        }, 4000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setOriginalImage(ev.target?.result as string);
                setProcessedImage(ev.target?.result as string);
                setStep('processing');
                setTimeout(() => setStep('result'), 4000);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const x = ((clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.min(Math.max(x, 0), 100));
    };

    const handleShare = (dest: string) => {
        setShareDest(dest);
        // Directly go to success or some sending state
        // We can reuse a simple 'sending' state inside sharing view or close
        // For now, let's close and optionally trigger onPostCreated

        if (onPostCreated && originalImage) {
            onPostCreated({
                id: Date.now().toString(),
                title: `Restored Photo for ${dest}`,
                author: "You",
                time: "Just now",
                imageUrl: processedImage!,
                likes: 0
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none">

            {/* Heavy Processing View */}
            {step === 'processing' && (
                <div className="absolute inset-0 z-[300] bg-[#003366] flex flex-col items-center justify-center p-8">
                    <div className="relative mb-12">
                        <div className="w-64 h-64 border-8 border-white/20 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles size={80} className="text-[#FFD700] animate-pulse" fill="#FFD700" />
                        </div>
                        {/* Scanning line effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan pointer-events-none" style={{ backgroundSize: '100% 200%' }} />
                    </div>

                    <h2 className="text-5xl font-black text-white text-center mb-4 uppercase tracking-tight">
                        Restoring<br />Memories...
                    </h2>
                    <p className="text-white/60 text-xl font-bold uppercase tracking-widest animate-pulse">
                        Removing scratches & dust
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 bg-white z-10">
                <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-2">
                    {step === 'result' ? <Wand2 className="text-[#13EC13]" /> : <Camera />}
                    {step === 'scan' && 'Scan Photo'}
                    {step === 'result' && 'Magic Result'}
                    {step === 'share' && 'Share Joy'}
                </h2>
                <button
                    onClick={onClose}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 active:scale-90"
                >
                    <X size={28} strokeWidth={3} />
                </button>
            </div>

            {/* STEP 1: SCAN / CAPTURE */}
            {step === 'scan' && (
                <div className="flex-1 flex flex-col bg-black relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="flex-1 w-full h-full object-cover opacity-60"
                    />

                    {/* Overlay Box */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-[80%] aspect-[3/4] border-4 border-white/50 rounded-3xl relative">
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#13EC13] rounded-tl-xl" />
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#13EC13] rounded-tr-xl" />
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#13EC13] rounded-bl-xl" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#13EC13] rounded-br-xl" />
                        </div>
                        <p className="text-white/80 font-bold mt-8 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                            Position photo in frame
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-t-[3rem] p-10 pb-12 flex flex-col gap-8">
                        <div className="flex items-center justify-between px-8">
                            <label className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer active:scale-95 transition-transform">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Upload size={28} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">Upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>

                            <button
                                onClick={handleCapture}
                                className="w-24 h-24 bg-[#1152D4] rounded-full p-1.5 shadow-xl active:scale-90 transition-transform"
                            >
                                <div className="w-full h-full rounded-full border-4 border-white flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-full" />
                                </div>
                            </button>

                            <div className="w-16 opacity-0" /> {/* Spacer for symmetry */}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: RESULT COMPARISON */}
            {step === 'result' && (
                <div className="flex-1 flex flex-col bg-[#F6F6F8]">
                    {/* Comparison Slider */}
                    <div className="flex-1 relative overflow-hidden group">
                        {/* After Image (Background) */}
                        <div
                            className="absolute inset-0 bg-contain bg-center bg-no-repeat bg-black"
                            style={{ backgroundImage: `url(${processedImage})` }}
                        >
                            <div className="absolute top-4 left-4 bg-[#13EC13] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10">
                                Resotred
                            </div>
                        </div>

                        {/* Before Image (Clipped) */}
                        <div
                            className="absolute inset-0 bg-contain bg-center bg-no-repeat bg-black border-r-[3px] border-white/50"
                            style={{
                                backgroundImage: `url(${originalImage})`,
                                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                                filter: 'sepia(0.5) contrast(1.2) brightness(0.9) blur(0.5px) grayscale(0.3)' // Simulated "Old" look
                            }}
                        >
                            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md border border-white/30 z-10">
                                Original
                            </div>
                        </div>

                        {/* Interaction Layer */}
                        <div
                            className="absolute inset-0 cursor-col-resize touch-none z-20"
                            onMouseMove={handleSliderMove}
                            onTouchMove={handleSliderMove}
                        />

                        {/* Slider Handle Visual */}
                        <div
                            className="absolute top-0 bottom-0 pointer-events-none z-30"
                            style={{ left: `${sliderPos}%` }}
                        >
                            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] -translate-x-1/2" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-6 bg-gray-300 rounded-full" />
                                    <div className="w-1.5 h-6 bg-gray-300 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white p-8 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-[#003366] uppercase mb-1">Look at that!</h3>
                            <p className="text-gray-500 font-bold">Slide your finger to compare</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('scan')}
                                className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                            >
                                <RefreshCw size={28} />
                            </button>
                            <button
                                onClick={() => setStep('share')}
                                className="flex-1 bg-[#003366] text-white rounded-[2rem] text-2xl font-black uppercase tracking-tight shadow-[0_10px_0_#002244] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
                            >
                                Share This <ArrowRight size={28} strokeWidth={4} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: SHARE SCAN */}
            {step === 'share' && (
                <div className="flex-1 flex flex-col bg-[#F8F9FA] overflow-y-auto no-scrollbar">
                    <div className="p-8">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100">
                            <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                                <img src={processedImage!} className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 right-4 bg-[#13EC13] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-md">
                                    Restored
                                </div>
                            </div>
                            <p className="text-center font-black text-[#003366] text-xl italic">"Look what I fixed!"</p>
                        </div>
                    </div>

                    <div className="px-8 space-y-4 pb-12">
                        <p className="text-center text-[#CCCCCC] font-black uppercase tracking-[0.25em] text-[10px] mb-2">SEND TO:</p>

                        <button onClick={() => handleShare('Family')} className="w-full h-24 bg-[#1152D4] text-white rounded-[2rem] flex items-center justify-center gap-6 shadow-[0_8px_0_#003380] active:translate-y-1 active:shadow-none transition-all">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageSquare size={32} fill="white" className="text-white" />
                            </div>
                            <span className="text-3xl font-black uppercase tracking-tight">Family Group</span>
                        </button>

                        <button onClick={() => handleShare('WhatsApp')} className="w-full h-24 bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center gap-6 shadow-[0_8px_0_#128c7e] active:translate-y-1 active:shadow-none transition-all">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle size={32} fill="white" className="text-white" />
                            </div>
                            <span className="text-3xl font-black uppercase tracking-tight">WhatsApp</span>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PhotoFixFlow;
