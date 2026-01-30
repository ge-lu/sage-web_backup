import React from 'react';
import { Icons } from '../constants';
import { AppMode } from '../types';

interface ActivityItemProps {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
  onAction?: (type: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, isExpanded, onToggle, onAction }) => {

  const getColorsForType = (type: string) => {
    switch (type) {
      case 'scam': return { iconBg: 'bg-gray-100', icon: 'text-black', border: 'border-l-black' };
      case 'order': return { iconBg: 'bg-gray-100', icon: 'text-black', border: 'border-l-gray-400' };
      case 'health': return { iconBg: 'bg-gray-100', icon: 'text-black', border: 'border-l-black' };
      default: return { iconBg: 'bg-gray-100', icon: 'text-black', border: 'border-l-gray-400' };
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'scam': return <Icons.Shield className="w-8 h-8" />;
      case 'order': return <Icons.ShoppingBag className="w-8 h-8" />;
      case 'health': return <Icons.Check className="w-8 h-8" />;
      default: return <Icons.Camera className="w-8 h-8" />;
    }
  };

  const styles = getColorsForType(item.type);

  return (
    <div onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`group relative rounded-[2rem] overflow-hidden mb-4 cursor-pointer transition-all duration-300 bg-white border border-gray-100 border-l-[6px] ${styles.border} ${isExpanded ? 'shadow-lg scale-[1.01] z-10' : 'shadow-card z-0'}`}>
      <div className="p-6 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.icon}`}>{getIconForType(item.type)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-lg text-gray-900 leading-tight mb-1">{item.title}</h4>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{item.time}</span>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-gray-100 rotate-90' : 'bg-transparent'}`}><Icons.ChevronLeft className="w-5 h-5 text-gray-400" /></div>
      </div>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-0">
            <div className="pl-[5.25rem]">
              <p className="text-sm font-bold text-gray-500 mb-4">{item.subtitle}</p>
              <div className="h-px w-full bg-gray-100 mb-4"></div>
              <p className="text-base text-gray-600 mb-6 font-medium">{item.detail}</p>
              {item.actionLabel && <button onClick={(e) => { e.stopPropagation(); if (onAction) onAction(item.type); }} className="w-full h-20 rounded-[2rem] text-lg font-black uppercase tracking-tight bg-gray-100 text-black flex items-center justify-center gap-2 shadow-[0_4px_0_#d1d5db] active:translate-y-1 active:shadow-none transition-all">{item.actionLabel}<Icons.ArrowRight className="w-5 h-5" strokeWidth={3} /></button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
