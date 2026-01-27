
import React, { useState } from 'react';
import { Icons } from '../constants';

interface ProfileViewProps {
  onBack: () => void;
  onOpenGuide?: () => void;
}

type SubView = 'MAIN' | 'VOICE' | 'VISION' | 'PERSONAL_INFO';

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onOpenGuide }) => {
  const [currentView, setCurrentView] = useState<SubView>('MAIN');
  const [showCacheConfirm, setShowCacheConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Voice Input State
  const [activeField, setActiveField] = useState<string | null>(null);

  // Settings State
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1.0);
  const [textSize, setTextSize] = useState<'Normal' | 'Large' | 'Extra Large'>('Large');
  const [highContrast, setHighContrast] = useState(false);

  // Profile Data State
  const [profileData, setProfileData] = useState({
    name: "Martha Jenkins",
    phone: "(555) 123-4567",
    address: "123 Maple Avenue, Springfield",
    emergencyContact: "Sarah (Daughter) - 555-999-8888",
    medicalNotes: "High Blood Pressure, Penicillin Allergy"
  });

  const handleVoiceInput = (field: keyof typeof profileData) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported on this device.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setActiveField(field);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setProfileData(prev => ({ ...prev, [field]: text }));
      setActiveField(null);
    };

    recognition.onerror = () => {
      setActiveField(null);
    };

    recognition.onend = () => {
      setActiveField(null);
    };
  };

  const handleClearCache = () => {
    setIsClearing(true);
    setTimeout(() => {
      setIsClearing(false);
      setShowCacheConfirm(false);
      // In a real app, this would clear local storage or cache API
    }, 1500);
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to backend/local storage
    setCurrentView('MAIN');
  };

  // --- SUB-VIEWS ---

  const renderPersonalInfo = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('MAIN')} className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform -ml-2">
          <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
        </button>
        <span className="text-xl font-bold text-gray-900">Personal Information</span>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm mb-6 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-md relative mb-4">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" className="w-full h-full rounded-full object-cover" />
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#00E341] rounded-full border-4 border-white flex items-center justify-center shadow-sm">
              <Icons.Camera className="w-5 h-5 text-black" />
            </button>
          </div>
          <p className="text-sm text-gray-500 font-bold">Tap camera to change photo</p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-gray-900 font-bold mb-2 ml-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full h-14 pl-4 pr-14 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium text-lg focus:ring-2 focus:ring-[#00E341] outline-none"
              />
              <button
                onClick={() => handleVoiceInput('name')}
                className={`absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-lg transition-colors ${activeField === 'name' ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <Icons.Mic className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-gray-900 font-bold mb-2 ml-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full h-14 pl-4 pr-14 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium text-lg focus:ring-2 focus:ring-[#00E341] outline-none"
              />
              <button
                onClick={() => handleVoiceInput('phone')}
                className={`absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-lg transition-colors ${activeField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <Icons.Mic className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Address Input */}
          <div>
            <label className="block text-gray-900 font-bold mb-2 ml-1">Home Address</label>
            <div className="relative">
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full h-24 pl-4 pr-14 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium text-lg focus:ring-2 focus:ring-[#00E341] outline-none resize-none"
              />
              <button
                onClick={() => handleVoiceInput('address')}
                className={`absolute right-2 top-2 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${activeField === 'address' ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <Icons.Mic className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-1">Used for Ride Requests & Deliveries</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-[2rem] p-6 shadow-sm mb-6 border border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <Icons.Shield className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-red-900">Critical Info (For Guardian)</h3>
        </div>

        <div className="space-y-6">
          {/* Emergency Contact */}
          <div>
            <label className="block text-gray-900 font-bold mb-2 ml-1">Emergency Contact</label>
            <div className="relative">
              <input
                type="text"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                className="w-full h-14 pl-4 pr-14 rounded-xl bg-white border border-red-200 text-gray-900 font-medium text-lg focus:ring-2 focus:ring-red-400 outline-none"
              />
              <button
                onClick={() => handleVoiceInput('emergencyContact')}
                className={`absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-lg transition-colors ${activeField === 'emergencyContact' ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Icons.Mic className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-gray-900 font-bold mb-2 ml-1">Medical Notes</label>
            <div className="relative">
              <textarea
                value={profileData.medicalNotes}
                onChange={(e) => setProfileData({ ...profileData, medicalNotes: e.target.value })}
                placeholder="Allergies, Conditions..."
                className="w-full h-24 pl-4 pr-14 py-3 rounded-xl bg-white border border-red-200 text-gray-900 font-medium text-lg focus:ring-2 focus:ring-red-400 outline-none resize-none"
              />
              <button
                onClick={() => handleVoiceInput('medicalNotes')}
                className={`absolute right-2 top-2 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${activeField === 'medicalNotes' ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Icons.Mic className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        className="w-full h-16 bg-[#00E341] rounded-2xl text-black font-bold text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mb-6"
      >
        <Icons.Check className="w-6 h-6" /> Save Changes
      </button>
    </div>
  );

  const renderVoiceSettings = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setCurrentView('MAIN')} className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform -ml-2">
          <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
        </button>
        <span className="text-xl font-bold text-gray-900">Voice & Audio</span>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#D1FAE5] rounded-full flex items-center justify-center text-[#10B981]">
            <Icons.Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Aura's Voice</h3>
            <p className="text-sm text-gray-500">Adjust how I sound to you</p>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <label className="font-bold text-gray-700">Volume</label>
            <span className="text-gray-500 font-medium">{volume}%</span>
          </div>
          <input
            type="range" min="0" max="100" value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#00E341]"
          />
        </div>

        {/* Speed Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-bold text-gray-700">Speaking Speed</label>
            <span className="text-gray-500 font-medium">{speed}x</span>
          </div>
          <input
            type="range" min="0.5" max="2" step="0.25" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#00E341]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Listen for "Hey Aura"</h3>
            <p className="text-sm text-gray-500 mt-1">Wake up without tapping</p>
          </div>
          <div className="w-14 h-8 bg-[#00E341] rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 bottom-1 w-6 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisionSettings = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setCurrentView('MAIN')} className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform -ml-2">
          <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
        </button>
        <span className="text-xl font-bold text-gray-900">Vision Settings</span>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#DBEAFE] rounded-full flex items-center justify-center text-[#2563EB]">
            <Icons.Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Display Size</h3>
            <p className="text-sm text-gray-500">Make text easier to read</p>
          </div>
        </div>

        <div className="space-y-3">
          {['Normal', 'Large', 'Extra Large'].map((size) => (
            <div
              key={size}
              onClick={() => setTextSize(size as any)}
              className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${textSize === size ? 'border-[#00E341] bg-green-50' : 'border-gray-100'}`}
            >
              <span className={`font-bold text-gray-900 ${size === 'Large' ? 'text-lg' : size === 'Extra Large' ? 'text-xl' : 'text-base'}`}>
                {size} Text
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${textSize === size ? 'border-[#00E341]' : 'border-gray-300'}`}>
                {textSize === size && <div className="w-3 h-3 bg-[#00E341] rounded-full"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div
          onClick={() => setHighContrast(!highContrast)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div>
            <h3 className="font-bold text-gray-900">High Contrast Mode</h3>
            <p className="text-sm text-gray-500 mt-1">Increase visibility</p>
          </div>
          <div className={`w-14 h-8 rounded-full relative transition-colors ${highContrast ? 'bg-black' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full shadow-sm transition-all ${highContrast ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MAIN MENU RENDERER ---

  const renderMainMenu = () => (
    <div className="animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform -ml-2">
          <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
        </button>
        <span className="text-lg font-bold text-green-600">Done</span>
      </div>

      {/* Profile Card - NOW CLICKABLE */}
      <div
        onClick={() => setCurrentView('PERSONAL_INFO')}
        className="flex items-center gap-4 bg-white p-4 rounded-3xl mb-8 shadow-sm cursor-pointer active:scale-[0.98] transition-all border border-transparent hover:border-gray-200 group"
      >
        <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-white shadow relative shrink-0">
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" className="w-full h-full rounded-full object-cover" />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00E341] rounded-full border-2 border-white flex items-center justify-center">
            <Icons.Wrench className="w-3 h-3 text-black" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
          <div className="inline-block px-2 py-1 bg-[#DCFCE7] text-[#166534] text-xs font-bold rounded mt-1">Aura Premium</div>
          <p className="text-xs text-gray-500 mt-1 font-bold">Tap to edit info</p>
        </div>
        <Icons.ChevronLeft className="w-6 h-6 text-gray-300 rotate-180 group-hover:text-[#00E341] transition-colors" />
      </div>

      {/* App Preferences */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">App Preferences</h3>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">

          {/* Voice & Audio Link */}
          <div
            onClick={() => setCurrentView('VOICE')}
            className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Voice & Audio</p>
                <p className="text-xs text-gray-500">Volume: {volume}%, Speed: {speed}x</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>

          {/* Vision Settings Link */}
          <div
            onClick={() => setCurrentView('VISION')}
            className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Vision Settings</p>
                <p className="text-xs text-gray-500">Size: {textSize}</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>

          {/* Daily Summary Toggle */}
          <div
            onClick={() => setDailySummaryEnabled(!dailySummaryEnabled)}
            className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Daily Summary</p>
                <p className="text-xs text-gray-500">{dailySummaryEnabled ? 'On • 8:00 AM' : 'Off'}</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${dailySummaryEnabled ? 'bg-[#00E341]' : 'bg-gray-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${dailySummaryEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>

        </div>
      </div>

      {/* Help Group */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Help & Support</h3>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div onClick={onOpenGuide} className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.Flash className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Product Tour</p>
                <p className="text-xs text-gray-500">Replay the welcome guide</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>
          <div className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Privacy Policy</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>
        </div>
      </div>

      {/* Security Group */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Security</h3>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Fraud Protection</p>
                <p className="text-xs text-[#10B981] font-bold">Active & Monitoring</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>
          <div className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Blocked Numbers</p>
                <p className="text-xs text-gray-500">Manage blocked callers</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>
        </div>
      </div>

      {/* Data Group */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Data Management</h3>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div onClick={() => setShowCacheConfirm(true)} className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
                <Icons.FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Clear Application Cache</p>
                <p className="text-xs text-gray-500">Free up space, fix issues</p>
              </div>
            </div>
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
          </div>
        </div>
      </div>

      <button className="w-full h-14 rounded-2xl border border-[#00E341] bg-white text-[#00E341] font-bold text-lg flex items-center justify-center gap-2 mb-6 active:scale-95 transition-transform">
        <Icons.Home className="w-5 h-5" /> Call Aura Support
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Version 1.0.0</p>
        <button className="text-[#EF4444] font-bold text-sm">Log Out</button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#F9FAFB] px-6 pt-12 pb-32 overflow-y-auto">
      {currentView === 'MAIN' && renderMainMenu()}
      {currentView === 'PERSONAL_INFO' && renderPersonalInfo()}
      {currentView === 'VOICE' && renderVoiceSettings()}
      {currentView === 'VISION' && renderVisionSettings()}

      {/* Confirmation Modal for Clearing Cache */}
      {showCacheConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cache?</h3>
            <p className="text-gray-500 mb-6">This will clear temporary files and reset app preferences. Your account data and history will NOT be deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCacheConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex-1 py-3 rounded-xl bg-red-500 font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30"
              >
                {isClearing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileView;
