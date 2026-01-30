import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import GuardianButton from './GuardianButton';

interface ClubSuggestionCardProps {
  onJoin: () => void;
  onShare?: () => void;
}

const ClubSuggestionCard: React.FC<ClubSuggestionCardProps> = ({ onJoin }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative h-96 rounded-xl overflow-hidden shadow-sm border border-gray-200 w-full shrink-0 group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      onClick={onJoin}
    >
      {/* Background Image - Gardening Theme */}
      {!imgError ? (
        <img
          src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000&auto=format&fit=crop"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt="Gardening"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-[#4A7A68] flex items-center justify-center">
          <ImageIcon size={64} className="text-white/30" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#4A7A68]/85 mix-blend-multiply transition-opacity group-hover:bg-[#4A7A68]/90" />

      <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
        <div className="flex flex-col w-fit max-w-full text-center">
          <div className="flex items-center justify-center mb-1">
            <h2 className="font-bold font-heading text-xl text-white leading-tight drop-shadow-md whitespace-nowrap">
              You'll love this group!
            </h2>
          </div>

          <p className="text-xs text-white/90 mb-6 drop-shadow-sm font-medium">
            Because you liked gardening photos
          </p>

          <div className="w-full">
            <GuardianButton
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className="h-16 w-full !rounded-2xl !bg-white !text-[#1E5840] !shadow-lg active:scale-95 transition-all text-lg font-black uppercase tracking-widest"
            >
              JOIN
            </GuardianButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSuggestionCard;