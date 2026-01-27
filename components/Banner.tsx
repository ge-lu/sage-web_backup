
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BannerProps {
  title: string;
  subtitle?: string;
  tag?: string;
  bgImage: string;
  tagColor?: string;
  icon?: React.ReactNode;
  ctaText?: string;
  stats?: string;
}

const Banner: React.FC<BannerProps> = ({ title, subtitle, tag, bgImage, tagColor, icon, ctaText = "Start Now", stats }) => {
  return (
    <div
      className="h-72 rounded-[2.5rem] relative overflow-hidden shadow-2xl group cursor-pointer border-2 border-white/50"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Status Tag - Top Right Corner */}
      {tag && (
        <div className={`absolute top-6 right-6 ${tagColor || 'bg-blue-600'} text-white px-5 py-2 rounded-full font-black text-xs flex items-center gap-2 shadow-xl z-20`}>
          {icon}
          <span className="tracking-widest uppercase">{tag}</span>
        </div>
      )}

      {/* Content Area - Bottom Left Corner */}
      <div className="absolute bottom-6 left-8 right-8 text-white z-20 flex flex-col gap-2">
        <h4 className="text-4xl font-black uppercase tracking-tight leading-none drop-shadow-lg">
          {title}
        </h4>

        {/* Subtitle - Only show if provided */}
        {subtitle && (
          <p className="text-xl text-white/90 font-bold drop-shadow-md leading-tight">
            {subtitle}
          </p>
        )}

        {/* Stats Section */}
        {stats && (
          <div className="mt-1 text-base font-black text-white/90 tracking-wide bg-black/40 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
            {stats}
          </div>
        )}

        {/* Action Button - White rounded button style */}
        <div className="mt-4 inline-flex items-center gap-3 bg-white text-[#003366] px-6 py-3 rounded-2xl w-fit font-black uppercase text-sm shadow-xl active:scale-95 transition-all">
          {ctaText}
          <ChevronRight size={20} strokeWidth={3} />
        </div>
      </div>

      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
    </div>
  );
};

export default Banner;
