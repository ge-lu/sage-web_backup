import React from 'react';

interface AuraSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  valueLabel?: string;
  leftLabel?: string;
  centerLabel?: string;
  rightLabel?: string;
  className?: string;
}

const AuraSlider: React.FC<AuraSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  valueLabel,
  leftLabel,
  centerLabel,
  rightLabel,
  className = ''
}) => {
  return (
    <div className={className}>
      {(label || valueLabel) && (
        <div className="flex justify-between mb-2">
          {label && <label className="font-bold text-gray-700">{label}</label>}
          {valueLabel && <span className="text-gray-500 font-medium">{valueLabel}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#5B84B5]"
      />
      {(leftLabel || centerLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
          {leftLabel && <span>{leftLabel}</span>}
          {centerLabel && <span>{centerLabel}</span>}
          {rightLabel && <span>{rightLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default AuraSlider;
