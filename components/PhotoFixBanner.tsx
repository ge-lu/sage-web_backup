
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronRight, Loader2, Check } from 'lucide-react';

interface PhotoFixBannerProps {
    status?: 'idle' | 'processing' | 'ready';
}

const PhotoFixBanner: React.FC<PhotoFixBannerProps> = ({ status = 'idle' }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isHovering, setIsHovering] = useState(false);
    const animationRef = useRef<number>(null);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const animate = () => {
            if (!isHovering) {
                const elapsed = Date.now() - startTimeRef.current;
                const newPos = 50 + Math.sin(elapsed / 1000) * 15;
                setSliderPos(newPos);
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isHovering]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.min(Math.max(x, 0), 100));
    };

    const photoUrl = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop";

    // Dynamic Content based on Status
    let title = "Fix Old Photos";
    let subtitle = "Bring back the colors";
    let tagText = "AI MAGIC";
    let tagColor = "bg-[#13EC13]";
    let buttonText = (
        <>
            Restore <ChevronRight size={20} />
        </>
    );

    if (status === 'processing') {
        title = "Fixing Photo...";
        subtitle = "Ready in ~5 mins";
        tagText = "WORKING";
        tagColor = "bg-yellow-500";
        buttonText = (
            <>
                <Loader2 size={20} className="animate-spin" /> Processing
            </>
        );
    } else if (status === 'ready') {
        title = "Photo Ready!";
        subtitle = "Tap to view result";
        tagText = "DONE";
        tagColor = "bg-blue-500";
        buttonText = (
            <>
                View Now <Check size={20} strokeWidth={4} />
            </>
        );
    }

    return (
        <div
            className="h-72 rounded-[2.5rem] relative overflow-hidden shadow-2xl group cursor-col-resize border-2 border-white/50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                startTimeRef.current = Date.now();
            }}
            onMouseMove={handleMouseMove}
        >
            {/* After Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%), url(${photoUrl})` }}
            />

            {/* Before Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-75 ease-out"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%), url(${photoUrl})`,
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                    filter: 'sepia(0.8) contrast(0.8) brightness(1.1) blur(1px) saturate(0.4)',
                }}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
            </div>

            {/* The Yellow Slider Line & Handle */}
            {status === 'idle' && (
                <div
                    className="absolute top-0 bottom-0 w-1.5 bg-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)] z-10"
                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FFD700] border-4 border-white shadow-2xl flex items-center justify-center">
                        <div className="flex gap-1">
                            <div className="w-1 h-4 bg-white/60 rounded-full" />
                            <div className="w-1 h-4 bg-white/60 rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            {/* AI MAGIC Tag */}
            <div className={`absolute top-6 right-6 ${tagColor} text-white px-5 py-2 rounded-full font-black text-xs flex items-center gap-2 shadow-xl z-20`}>
                <Sparkles size={16} fill="white" />
                <span className="tracking-widest uppercase">{tagText}</span>
            </div>

            {/* Text Overlay */}
            <div className="absolute bottom-6 left-8 text-white z-20 pointer-events-none flex flex-col gap-2">
                <h4 className="text-4xl font-black uppercase tracking-tight leading-none drop-shadow-lg">{title}</h4>
                <p className="text-xl text-white/90 font-bold drop-shadow-md">{subtitle}</p>
                <div className="mt-4 inline-flex items-center gap-3 bg-white text-[#003366] px-6 py-3 rounded-2xl w-fit font-black uppercase text-sm shadow-xl">
                    {buttonText}
                </div>
            </div>
        </div>
    );
};

export default PhotoFixBanner;
