
import React from 'react';
import { Users } from 'lucide-react';

export const CircleView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 bg-[#F5F7F9]">
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-gray-200 shadow-sm">
        <Users size={40} className="text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-gray-900">Your Circle</h2>
      <p className="text-center px-8">Manage family members and caregivers here.</p>
    </div>
  );
};
