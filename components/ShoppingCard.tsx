
import React from 'react';
import { ShoppingOption } from '../types';
import { Icons } from '../constants';

interface ShoppingCardProps {
  option: ShoppingOption;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const ShoppingCard: React.FC<ShoppingCardProps> = ({ option, isExpanded, onToggle, onSelect }) => {
  return (
    <div
      onClick={onToggle}
      className={`w-full rounded-[2rem] relative overflow-hidden transition-all duration-500 border-2 shadow-sm ${option.theme.bg} ${option.theme.border} ${isExpanded ? 'shadow-lg ring-2 ring-black/5' : ''}`}
    >
      {/* Tag */}
      {option.tag && (
        <div
          className={`absolute top-0 left-0 px-4 py-1.5 rounded-br-2xl text-xs font-bold uppercase tracking-wide shadow-sm z-10`}
          style={{ backgroundColor: option.tagColor || '#111827', color: 'white' }}
        >
          {option.tag}
        </div>
      )}

      <div className="p-5">
        {/* Header: Logo & Delivery */}
        <div className="flex justify-between items-start mt-4 mb-4">
          <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-900`}>
            <option.logo className="w-8 h-8" />
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${option.theme.text}`}>{option.deliveryTime}</p>
            {option.distance && (
              <p className="text-xs text-gray-500 font-medium">Distance: {option.distance}</p>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4 bg-white/60 rounded-xl p-3 backdrop-blur-sm border border-black/5 flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-gray-500 font-medium">Est. Price:</span>
            <span className="text-3xl font-bold text-gray-900">{option.price}</span>
          </div>
          <Icons.ChevronLeft className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-180'}`} />
        </div>

        {/* Expanded Details Content */}
        <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pb-4 pt-2 border-t border-black/5 space-y-4">
            {/* Ingredients */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Ingredients</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Biodegradable Surfactants (Anionic and Nonionic), Enzymes, Baking Soda, Polymer. <span className="text-green-600 font-bold">Phosphate Free.</span>
              </p>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-4 bg-white/40 p-3 rounded-xl">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-lg">★</span>)}
              </div>
              <span className="text-xs font-bold text-gray-600">4.8 (12k Reviews)</span>
            </div>

            {/* Nutrition/Usage (Mock) */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Usage Guide</h4>
              <div className="flex gap-2">
                <div className="bg-white/60 px-3 py-1 rounded-lg text-xs font-bold text-gray-700">Standard: 1 cap</div>
                <div className="bg-white/60 px-3 py-1 rounded-lg text-xs font-bold text-gray-700">HE: 0.5 cap</div>
              </div>
            </div>
          </div>

          {/* Buy Now Deep Link Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`w-full h-16 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-2 mb-2 active:scale-95 transition-transform ${option.theme.button}`}
          >
            Buy Now <span className="text-2xl">›</span>
          </button>
          <p className="text-[10px] text-gray-500 text-center font-medium">
            Opens {option.vendor} App
          </p>
        </div>
      </div>

      {/* Collapsed Buy Button Hint */}
      {!isExpanded && (
        <div className="px-5 pb-5">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`w-full h-14 rounded-full font-bold text-lg shadow-sm flex items-center justify-center gap-2 transition-colors bg-white border border-gray-200 text-gray-900`}
          >
            Go to {option.vendor}
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
            * Final price confirmed at checkout
          </p>
        </div>
      )}
    </div>
  );
};

export default ShoppingCard;
