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
      <header className="sticky top-0 z-50 bg-white px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 rounded-b-[40px] shadow-soft flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform">
          <Icons.ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">All Activity</h1>
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
