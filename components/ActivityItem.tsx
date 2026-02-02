import React from 'react';
import { Icons } from '../constants';

interface ActivityItemProps {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
  onAction?: (type: string) => void;
  solidBgColor?: string; // If provided, card uses this solid background with white text
  customTheme?: { border: string; icon: string; iconBg: string };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, isExpanded, onToggle, onAction }) => {
  const getIconForType = (type: string) => {
     const iconClass = "w-6 h-6 text-guardian-blue";
     switch (type) {
       case 'scam': return <Icons.Shield className={iconClass} />;
       case 'alert': return <Icons.AlertTriangle className={iconClass} />;
       case 'order': return <Icons.ShoppingBag className={iconClass} />;
       case 'transport': return <Icons.Car className={iconClass} />;
       default: return <Icons.ListCheck className={iconClass} />;
     }
  };

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'mb-4' : 'mb-3'}`}>
      <div 
        onClick={(e) => { e.stopPropagation(); onToggle(); }} 
        className={`group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? 'shadow-md ring-1 ring-guardian-blue/10' : 'shadow-sm hover:border-gray-300'}`}
      >
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F5F9FF] flex items-center justify-center shrink-0">
            {getIconForType(item.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="font-bold text-lg text-gray-900 leading-tight font-heading truncate pr-2">{item.title}</h4>
              <span className="text-xs font-bold font-sans uppercase tracking-wide text-gray-400 shrink-0">{item.time}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium truncate font-sans">{item.subtitle}</p>
          </div>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-gray-100 rotate-90' : 'bg-transparent text-gray-300 group-hover:text-gray-500'}`}>
             <Icons.ChevronRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-5 pb-5 pt-0 pl-[5.25rem]">
              <div className="h-px w-full bg-gray-100 mb-4"></div>
              <p className="text-base text-gray-600 mb-5 font-sans leading-relaxed">{item.detail}</p>
              
              {item.actionLabel && (
                <button 
                  onClick={(e) => { e.stopPropagation(); if (onAction) onAction(item.type); }} 
                  className="w-full h-14 rounded-xl bg-guardian-blue text-white text-base font-bold font-heading uppercase tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                >
                  {item.actionLabel}
                  <Icons.ArrowRight className="w-4 h-4" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
