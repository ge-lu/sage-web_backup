
import React from 'react';
import { Icons } from '../constants';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  return (
    <div className="w-full h-full bg-[#F5F7F9] px-6 pt-12 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
         <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
             <Icons.ChevronLeft className="w-9 h-9 text-gray-900" />
         </button>
         <span className="text-xl font-bold text-gray-900">My Profile</span>
         <div className="w-9"></div>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-lg mb-4 relative">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" className="w-full h-full rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-9 h-9 bg-[#00E341] rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-5 h-5 text-black"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" /></svg></div>
              </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Martha Jenkins</h2>
          <div className="px-4 py-1.5 bg-[#D1FAE5] text-[#065F46] text-sm font-bold rounded-full mt-2">Aura Premium</div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-8">
          
          <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3 pl-2">App Preferences</h3>
              <div className="aura-card divide-y divide-gray-100 overflow-hidden shadow-sm">
                  <div className="p-5 flex items-center justify-between bg-white active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]"><Icons.Mic className="w-7 h-7" /></div>
                          <div>
                              <p className="text-xl font-bold text-gray-900">Voice & Audio</p>
                              <p className="text-sm font-medium text-gray-600 mt-0.5">Volume, Speed</p>
                          </div>
                      </div>
                      <Icons.ChevronLeft className="w-7 h-7 text-gray-400 rotate-180" />
                  </div>

                  <div className="p-5 flex items-center justify-between bg-white active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]"><Icons.Camera className="w-7 h-7" /></div>
                          <div>
                              <p className="text-xl font-bold text-gray-900">Vision Settings</p>
                              <p className="text-sm font-medium text-gray-600 mt-0.5">Text Size: Large</p>
                          </div>
                      </div>
                      <Icons.ChevronLeft className="w-7 h-7 text-gray-400 rotate-180" />
                  </div>
              </div>
          </div>

          <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3 pl-2">Security</h3>
              <div className="aura-card divide-y divide-gray-100 overflow-hidden shadow-sm">
                  <div className="p-5 flex items-center justify-between bg-white active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]"><Icons.Shield className="w-7 h-7" /></div>
                          <div>
                              <p className="text-xl font-bold text-gray-900">Fraud Protection</p>
                              <p className="text-sm text-[#059669] font-bold mt-0.5">Active & Monitoring</p>
                          </div>
                      </div>
                      <Icons.ChevronLeft className="w-7 h-7 text-gray-400 rotate-180" />
                  </div>
              </div>
          </div>

          <button className="w-full h-16 rounded-2xl border-2 border-[#00E341] text-[#00E341] font-bold text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform bg-white shadow-sm">
              <Icons.Mic className="w-7 h-7" /> Call Aura Support
          </button>
          
          <button className="w-full text-center text-[#EF4444] font-bold text-base py-4 hover:bg-red-50 rounded-xl transition-colors">
              Log Out
          </button>

      </div>
    </div>
  );
};
export default SettingsView;
