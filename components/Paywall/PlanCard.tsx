import React from 'react';
import { PlanType, PlanConfig } from './types.ts';

interface PlanCardProps {
  plan: PlanConfig;
  isSelected: boolean;
  onSelect: (id: PlanType) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect }) => {
  return (
    <div 
      role="radio"
      aria-checked={isSelected}
      aria-label={`${plan.title} plan, price ${plan.currency}${plan.amount}`}
      tabIndex={0}
      onClick={() => onSelect(plan.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(plan.id);
        }
      }}
      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2
        ${isSelected 
          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm z-10' 
          : 'border-gray-200 bg-white hover:border-gray-300'}`}
    >
      {/* Best Value Tag */}
      {plan.isBestValue && (
        <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm border-2 border-white">
          BEST VALUE
        </div>
      )}
      
      <div className="flex items-center gap-4">
        {/* Radio Circle */}
        <div aria-hidden="true" className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
          ${isSelected ? 'border-indigo-600 bg-white' : 'border-gray-300 bg-white'}`}>
          {isSelected && <div className="w-4 h-4 bg-indigo-600 rounded-full" />}
        </div>
        
        <div className="text-left">
          <p className="font-bold text-gray-900 text-xl leading-tight">{plan.title}</p>
          {plan.marketingTag ? (
            <p className="text-indigo-700 text-sm font-bold mt-0.5">{plan.marketingTag}</p>
          ) : (
            <p className="text-gray-500 text-sm mt-0.5">{plan.subDescription}</p>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-start justify-end text-gray-900 font-bold" aria-label={`Price: ${plan.currency} ${plan.amount}`}>
            <span className="text-base mt-1.5 mr-1 font-bold text-gray-500">{plan.currency}</span>
            <span className="text-3xl leading-none tracking-tight">{plan.amount}</span>
        </div>
        <p className="text-xs font-medium text-gray-500 mt-1">{plan.footerText}</p>
      </div>
    </div>
  );
};
