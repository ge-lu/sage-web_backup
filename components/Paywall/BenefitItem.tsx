import React from 'react';
import { Check } from 'lucide-react';

interface BenefitItemProps {
  text: string;
}

export const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => (
  <div className="flex items-start gap-4 py-1">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
      <Check className="w-5 h-5 text-green-700" strokeWidth={3} />
    </div>
    <span className="text-gray-900 font-medium text-lg text-left leading-snug">{text}</span>
  </div>
);
