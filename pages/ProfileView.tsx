
import React, { useState } from 'react';
import { Icons } from '../constants';
import AuraSlider from '../components/AuraSlider';
import AuraToggle from '../components/AuraToggle'; // Component 2
import SectionTitle from '../components/SectionTitle'; // Component 2 (Title 1)

interface ProfileViewProps {
  onBack: () => void;
  onOpenGuide?: () => void;
  onSubscriptionClick?: () => void;
}

type SubView = 'MAIN' | 'VOICE' | 'VISION' | 'PERSONAL_INFO';

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onOpenGuide, onSubscriptionClick }) => {
  const [currentView, setCurrentView] = useState<SubView>('MAIN');
  const [showCacheConfirm, setShowCacheConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Voice Input State
  const [activeField, setActiveField] = useState<string | null>(null);

  // Settings State
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);
  const [heyAuraEnabled, setHeyAuraEnabled] = useState(true);
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
        <span className="text-xl font-bold font-heading text-gray-900">Personal Information</span>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
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
                className="w-full h-14 pl-4 pr-14 rounded-xl bg-gray-50 border border-gray-200 text-ink-black font-medium text-lg focus:ring-2 focus:ring-guardian-blue outline-none"
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
                className="w-full h-14 pl-4 pr-14 rounded-xl bg-gray-50 border border-gray-200 text-ink-black font-medium text-lg focus:ring-2 focus:ring-guardian-blue outline-none"
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
                className="w-full h-24 pl-4 pr-14 py-3 rounded-xl bg-gray-50 border border-gray-200 text-ink-black font-medium text-lg focus:ring-2 focus:ring-guardian-blue outline-none resize-none"
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

      <div className="bg-red-50 rounded-xl p-6 mb-6 border border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <Icons.Shield className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold font-heading text-red-900">Critical Info (For Guardian)</h3>
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
        className="w-full h-16 bg-guardian-blue rounded-2xl text-white font-bold font-heading text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mb-6"
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
        <span className="text-xl font-bold font-heading text-gray-900">Voice & Audio</span>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#F5F9FF] rounded-full flex items-center justify-center text-guardian-blue">
            <Icons.Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold font-heading text-lg text-gray-900">Aura's Voice</h3>
            <p className="text-sm text-gray-500">Adjust how I sound to you</p>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="mb-8">
          <AuraSlider
            label="Volume"
            valueLabel={`${volume}%`}
            value={volume}
            min={0}
            max={100}
            onChange={setVolume}
          />
        </div>

        {/* Speed Slider */}
        <div>
          <AuraSlider
            label="Speaking Speed"
            valueLabel={`${speed}x`}
            value={speed}
            min={0.5}
            max={2}
            step={0.25}
            onChange={setSpeed}
            leftLabel="Slow"
            centerLabel="Normal"
            rightLabel="Fast"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-heading text-lg text-gray-900">Listen for "Hey Aura"</h3>
            <p className="text-sm text-gray-500 mt-1">Wake up without tapping</p>
          </div>
          <AuraToggle checked={heyAuraEnabled} onChange={setHeyAuraEnabled} />
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
        <span className="text-xl font-bold font-heading text-gray-900">Vision Settings</span>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#F5F9FF] rounded-full flex items-center justify-center text-guardian-blue">
            <Icons.Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold font-heading text-lg text-gray-900">Display Size</h3>
            <p className="text-sm text-gray-500">Make text easier to read</p>
          </div>
        </div>

        <div className="space-y-3">
          {['Normal', 'Large', 'Extra Large'].map((size) => (
            <div
              key={size}
              onClick={() => setTextSize(size as any)}
              className={`p-5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${textSize === size ? 'border-[#5B84B5] bg-[#F5F9FF]' : 'border-gray-100'}`}
            >
              <span className={`font-bold text-gray-900 ${size === 'Large' ? 'text-lg' : size === 'Extra Large' ? 'text-xl' : 'text-base'}`}>
                {size} Text
              </span>
              {textSize === size && <div className="w-3 h-3 bg-[#5B84B5] rounded-full"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div
          onClick={() => setHighContrast(!highContrast)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div>
            <h3 className="font-bold font-heading text-lg text-gray-900">High Contrast Mode</h3>
            <p className="text-sm text-gray-500 mt-1">Increase visibility</p>
          </div>
          <AuraToggle checked={highContrast} onChange={setHighContrast} />
        </div>
      </div>
    </div >
  );

  // --- MAIN MENU RENDERER ---

  const renderMainMenu = () => (
    <div className="w-full h-full flex flex-col bg-[#F5F7F9] animate-in slide-in-from-left duration-300">

      {/* Sticky Header with Profile Info */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
        <div
          onClick={() => setCurrentView('PERSONAL_INFO')}
          className="w-16 h-16 rounded-full bg-gray-200 border-2 border-white shadow-sm relative shrink-0 cursor-pointer"
        >
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" className="w-full h-full rounded-full object-cover" />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-guardian-blue rounded-full border-2 border-white flex items-center justify-center">
            <Icons.Wrench className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        <div className="flex-1 cursor-pointer pl-4 flex flex-col justify-center" onClick={() => setCurrentView('PERSONAL_INFO')}>
          <h2 className="text-2xl font-bold font-heading text-gray-900 leading-tight mb-1">{profileData.name}</h2>
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <span>Premium Member</span>
            <Icons.ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">

      {/* Upgrade Card - ADDED */}
      <div className="mb-8">
        <div 
           onClick={onSubscriptionClick}
           className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-3xl p-6 shadow-lg shadow-indigo-200 cursor-pointer active:scale-95 transition-transform relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="text-white text-2xl font-bold font-heading mb-1">Upgrade to Plus</h3>
                   <p className="text-indigo-100 text-sm font-medium">Unlock unlimited voice & memories</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <Icons.Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
            </div>
             {/* Decorative circles */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>


        {/* App Preferences */}
        <div className="mb-6">
          <SectionTitle>App Preferences</SectionTitle>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">

            {/* Voice & Audio Link */}
            <div
              onClick={() => setCurrentView('VOICE')}
              className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.Mic className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Voice & Audio</p>
                  <p className="text-xs text-gray-500">Volume: {volume}%, Speed: {speed}x</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>

            {/* Vision Settings Link */}
            <div
              onClick={() => setCurrentView('VISION')}
              className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Vision Settings</p>
                  <p className="text-xs text-gray-500">Size: {textSize}</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>

            {/* Daily Summary Toggle */}
            <div
              onClick={() => setDailySummaryEnabled(!dailySummaryEnabled)}
              className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Daily Summary</p>
                  <p className="text-xs text-gray-500">{dailySummaryEnabled ? 'On • 8:00 AM' : 'Off'}</p>
                </div>
              </div>
              <AuraToggle checked={dailySummaryEnabled} onChange={setDailySummaryEnabled} />
            </div>

          </div>
        </div>

        {/* Help Group */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold font-heading text-gray-900 mb-4 ml-2">Help & Support</h3>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <div onClick={onOpenGuide} className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.Flash className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Product Tour</p>
                  <p className="text-xs text-gray-500">Replay the welcome guide</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>
            <div className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Privacy Policy</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>
          </div>
        </div>

        {/* Security Group */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold font-heading text-gray-900 mb-4 ml-2">Security</h3>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <div className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Fraud Protection</p>
                  <p className="text-xs text-[#3A6F5B] font-bold">Active & Monitoring</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>
            <div className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Blocked Numbers</p>
                  <p className="text-xs text-gray-500">Manage blocked callers</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>
          </div>
        </div>

        {/* Data Group */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold font-heading text-gray-900 mb-4 ml-2">Data Management</h3>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <div onClick={() => setShowCacheConfirm(true)} className="p-5 flex items-center justify-between active:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                  <Icons.FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold font-heading text-xl text-gray-900">Clear Application Cache</p>
                  <p className="text-xs text-gray-500">Free up space, fix issues</p>
                </div>
              </div>
              <Icons.ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </div>
          </div>
        </div>

        <button className="w-full h-16 rounded-2xl border border-guardian-blue bg-white text-guardian-blue font-bold font-heading text-lg flex items-center justify-center gap-2 mb-6 active:scale-95 transition-transform">
          <Icons.Home className="w-5 h-5" /> Call Aura Support
        </button>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 mb-2">Version 1.0.0</p>
          <button className="text-[#EF4444] font-bold text-sm">Log Out</button>
        </div>

      </div> {/* End Scrollable Content */}
    </div>
  );

  return (
    <div className="w-full h-full overflow-hidden bg-[#F5F7F9]">
      {currentView === 'MAIN' ? renderMainMenu() : (
        <div className="w-full h-full px-6 pt-6 pb-32 overflow-y-auto">
          {currentView === 'PERSONAL_INFO' && renderPersonalInfo()}
          {currentView === 'VOICE' && renderVoiceSettings()}
          {currentView === 'VISION' && renderVisionSettings()}
        </div>
      )}

      {/* Confirmation Modal for Clearing Cache */}
      {showCacheConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Clear Cache?</h3>
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
                className="flex-1 py-3 rounded-xl bg-red-500 font-bold font-heading text-white flex items-center justify-center shadow-lg shadow-red-500/30"
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
