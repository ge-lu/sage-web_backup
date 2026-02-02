import React, { useState } from 'react';
import { Icons, MOCK_ACTIVITIES } from '../constants';
import ActivityItem from '../components/ActivityItem';

interface AllActivityViewProps {
  onBack: () => void;
}

const AllActivityView: React.FC<AllActivityViewProps> = ({ onBack }) => {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // In a real app, this would use router state or context for search filtering
  // For now, we display the full mock list

  return (
    <div className="w-full h-full bg-[#F5F7F9] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center gap-4">
        <button 
            onClick={onBack} 
            className="bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer active:bg-gray-50 transition-all shadow-sm flex items-center justify-center group"
        >
          <Icons.ChevronLeft className="w-6 h-6 text-gray-900 group-active:scale-95 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">All Activity</h1>
      </header>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="space-y-4">
          {MOCK_ACTIVITIES.map((item) => (
            <ActivityItem
              key={item.id}
              item={item}
              isExpanded={expandedActivity === item.id}
              onToggle={() => setExpandedActivity(expandedActivity === item.id ? null : item.id)}
              onAction={() => console.log('Action triggered:', item.type)}
            />
          ))}
        </div>
        
        <div className="py-8 text-center">
            <p className="text-sm text-gray-400 font-medium">End of history</p>
        </div>
      </div>
    </div>
  );
};

export default AllActivityView;
