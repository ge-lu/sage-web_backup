
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface JourneyBannerProps {
  title: string;
  tag: string;
  bgImage: string;
  tagColor: string;
  icon: React.ReactNode;
  ctaText: string;
  restoredCount: number;
  smilesCount: number;
}

const JourneyBanner: React.FC<JourneyBannerProps> = ({
  title,
  tag,
  bgImage,
  tagColor,
  icon,
  ctaText,
  restoredCount,
  smilesCount
}) => {
  return (
    <div
      className="h-72 rounded-[2.5rem] relative overflow-hidden shadow-2xl group cursor-pointer border-2 border-white/50"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.7) 100%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Background Scrim for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent pointer-events-none" />

      {/* Status Tag - Top Right Corner */}
      <div className="absolute top-6 right-6 bg-[#FF8C00] text-white px-5 py-2 rounded-full font-black text-xs flex items-center gap-2 shadow-xl z-20 border border-white/20">
        {icon}
        <span className="tracking-widest uppercase">{tag}</span>
      </div>

      {/* Main Content Area - Positioned to clear both top tag and bottom button */}
      <div className="absolute top-16 left-8 z-20 flex flex-col gap-1">
        <h4 className="text-4xl font-black uppercase tracking-tight leading-none text-white drop-shadow-xl mb-2">
          {title}
        </h4>

        {/* Stats List - Optimized spacing to avoid crowding bottom button */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-white drop-shadow-md">
            <span className="text-2xl drop-shadow-sm">📸</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{restoredCount}</span>
              <span className="uppercase text-[9px] font-black tracking-[0.15em] text-white/90">Photos Restored</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white drop-shadow-md">
            <span className="text-2xl drop-shadow-sm">❤️</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{smilesCount}</span>
              <span className="uppercase text-[9px] font-black tracking-[0.15em] text-white/90">Smiles Received</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - Bottom Left Corner */}
      <div className="absolute bottom-6 left-8 z-20">
        <div className="inline-flex items-center gap-3 bg-white text-[#003366] px-6 py-3 rounded-2xl w-fit font-black uppercase text-sm shadow-xl active:scale-95 transition-all group-hover:bg-blue-50 border border-white/50">
          {ctaText}
          <ChevronRight size={20} strokeWidth={4} />
        </div>
      </div>

      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
    </div>
  );
};

export default JourneyBanner;
