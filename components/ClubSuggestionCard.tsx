import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ClubSuggestionCardProps {
    onJoin: () => void;
    onShare?: () => void;
}

const ClubSuggestionCard: React.FC<ClubSuggestionCardProps> = ({ onJoin }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="relative h-96 rounded-[3rem] overflow-hidden shadow-xl w-full shrink-0 group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                <div className="flex items-center justify-center mb-3">
                    <h2 className="text-[2.5rem] font-black text-white leading-tight drop-shadow-lg tracking-tight">
                        You'll love this<br />group!
                    </h2>
                </div>

                <p className="text-xl font-bold text-white/90 mb-10 drop-shadow-md">
                    Because you liked gardening photos
                </p>

                <div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onJoin();
                        }}
                        className="bg-white text-[#1E5840] px-12 py-5 rounded-full text-xl font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95 transition-all hover:bg-gray-50 hover:shadow-[0_5px_10px_rgba(0,0,0,0.2)]"
                    >
                        JOIN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClubSuggestionCard;
