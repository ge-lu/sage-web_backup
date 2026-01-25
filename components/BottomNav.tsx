
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../constants';
import { getPathForMode } from '../routes';
import { AppMode } from '../types';

interface BottomNavProps {
  onMicTap: () => void;
  isListening: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItem = (mode: AppMode, Icon: any, label: string) => {
    const path = getPathForMode(mode);
    const isActive = location.pathname === path;

    return (
      <button
        onClick={() => navigate(path)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-200 active:scale-95`}
      >
        <div className={`relative p-1.5 transition-all duration-300 rounded-2xl ${isActive ? 'bg-[#DCFCE7]' : 'bg-transparent'}`}>
          <Icon
            className={`w-8 h-8 transition-all duration-300 ${isActive ? 'fill-current text-[#15803D]' : 'text-[#4B5563] stroke-[2px]'}`}
            strokeWidth={isActive ? 0 : 2}
          />
        </div>
        <span className={`text-xs font-bold tracking-wide transition-all ${isActive ? 'text-[#15803D]' : 'text-[#4B5563]'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 z-50 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-[96px] px-4 pb-3">
        {navItem(AppMode.DASHBOARD, Icons.Sparkles, 'AI')}
        {navItem(AppMode.PLAN, Icons.ListCheck, 'Care')}
        {navItem(AppMode.FAMILY_CONNECTIONS, Icons.Users, 'Circle')}
        {navItem(AppMode.PROFILE, Icons.User, 'Me')}
      </div>
    </div>
  );
};

export default BottomNav;
