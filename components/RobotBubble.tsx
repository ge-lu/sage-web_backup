
import React from 'react';
import { Icons } from '../constants';

interface RobotBubbleProps {
  message: string;
}

export const RobotBubble: React.FC<RobotBubbleProps> = ({ message }) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm mb-4">
      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Icons.Sparkles className="w-6 h-6 text-emerald-600" />
      </div>
      <div className="flex-1">
        <div className="relative bg-slate-100 p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
          <p className="text-slate-800 font-medium leading-tight">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
