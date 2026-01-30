import React from 'react';

interface AuraToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const AuraToggle: React.FC<AuraToggleProps> = ({ checked, onChange, className = '' }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 cursor-pointer ${checked ? 'bg-[#5B84B5]' : 'bg-gray-200'} ${className}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );
};

export default AuraToggle;
