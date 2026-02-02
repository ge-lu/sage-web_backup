import React, { useEffect, useState } from 'react';
import { Icons, MOCK_CONTACTS } from '../constants';
import { Contact } from '../types';

interface GuardianAlertProps {
  onDismiss: () => void;
}

const GuardianAlert: React.FC<GuardianAlertProps> = ({ onDismiss }) => {
  const [viewMode, setViewMode] = useState<'alert' | 'settings'>('alert');
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<string>('');

  useEffect(() => { 
      // Initial Alert Vibration: Warning Pattern
      if (typeof navigator !== 'undefined' && navigator.vibrate && viewMode === 'alert') {
          navigator.vibrate([500, 200, 500, 200, 800]); 
      }
  }, [viewMode]);

  const handleBlock = () => {
      // Strong, distinct "Heavy Impact" pattern for blocking action
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([80, 50, 80, 50, 600]);
      }
      onDismiss();
  };

  const handleTrust = () => {
      // Very light single tick for ignore/trust (dismissal)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
      }
      onDismiss();
  };

  const toggleEmergencyContact = (contact: Contact) => {
    if (emergencyContacts.find(c => c.id === contact.id)) {
      setEmergencyContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      setEmergencyContacts(prev => [...prev, contact]);
      setShowContactSelector(false);
    }
  };

  if (viewMode === 'settings') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F7F9] flex flex-col pt-12 animate-in slide-in-from-right duration-300">
        
        {/* Settings Header */}
        <div className="px-6 pb-6 flex items-center gap-4">
          <button 
            onClick={() => setViewMode('alert')}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Icons.ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Critical Info</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-8">
          
          {/* Section 1: Emergency Contacts */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Icons.Phone className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Emergency Contacts</h2>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {emergencyContacts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500">
                          {contact.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500 font-bold uppercase">{contact.role}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleEmergencyContact(contact)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Icons.Trash className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm">No contacts set.</p>
                </div>
              )}
              
              {/* Add Button */}
              <div className="border-t border-gray-100 p-2">
                 {showContactSelector ? (
                   <div className="bg-gray-50 rounded-xl p-2 space-y-2 animate-in fade-in duration-200">
                     <p className="text-xs font-bold text-gray-400 px-2 uppercase my-2">Select from Trusted People</p>
                     {MOCK_CONTACTS.filter(c => !emergencyContacts.find(e => e.id === c.id)).map(contact => (
                       <button
                         key={contact.id}
                         onClick={() => toggleEmergencyContact(contact)}
                         className="w-full p-2 flex items-center gap-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                       >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{contact.name[0]}</div>
                          <span className="text-sm font-bold text-gray-700">{contact.name}</span>
                       </button>
                     ))}
                     {MOCK_CONTACTS.filter(c => !emergencyContacts.find(e => e.id === c.id)).length === 0 && (
                       <p className="text-center text-xs text-gray-400 py-2">No more trusted people available.</p>
                     )}
                     <button 
                       onClick={() => setShowContactSelector(false)}
                       className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                     >
                       Cancel
                     </button>
                   </div>
                 ) : (
                   <button 
                     onClick={() => setShowContactSelector(true)}
                     className="w-full py-3 flex items-center justify-center gap-2 text-guardian-blue font-bold text-sm active:bg-gray-50 rounded-xl transition-colors"
                   >
                     <Icons.Plus className="w-4 h-4" /> Add Emergency Contact
                   </button>
                 )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 px-2">Contacts listed here will be auto-dialed during SOS events.</p>
          </section>

          {/* Section 2: Medical Notes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Icons.FileText className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Medical Notes</h2>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <textarea
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Enter critical allergies, conditions, or medications..."
                className="w-full h-32 bg-transparent text-gray-900 font-medium resize-none outline-none placeholder:text-gray-300"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400 px-2">This info is shared with emergency services if you cannot speak.</p>
          </section>

        </div>
      </div>
    );
  }

  return (
    // Background: Light Mode for Danger (Softened)
    <div className="fixed inset-0 z-50 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-red-50 flex items-center justify-center gap-2 border-b border-red-100">
          <Icons.Shield className="w-5 h-5 text-red-500" />
          <span className="text-red-500 font-bold text-sm tracking-widest uppercase">Guardian Mode Active</span>
      </div>

      {/* Settings Gear - Top Right */}
      <button 
        onClick={() => setViewMode('settings')}
        className="absolute top-16 right-6 w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 active:scale-95 transition-transform hover:text-gray-600 z-10"
      >
        <Icons.Settings className="w-5 h-5" />
      </button>

      {/* Main Alert Icon */}
      <div className="w-32 h-32 rounded-full border-4 border-red-200 flex items-center justify-center mb-8 bg-red-50 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]">
        <Icons.AlertTriangle className="w-16 h-16 text-red-400" />
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
        Potential Scam Alert!
      </h1>
      
      <p className="text-lg text-gray-500 mb-8 max-w-sm">
          This caller is using a known fraud pattern.
      </p>

      {/* Context Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 flex items-start gap-4 mb-8 border border-gray-200 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          </div>
          <div className="text-left flex-1">
              <p className="text-gray-900 font-bold text-sm mb-1">Aura Analysis</p>
              <p className="text-gray-600 text-sm italic leading-relaxed">"They just asked for your social security number. Do not share it."</p>
          </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button 
            onClick={handleBlock}
            className="w-full h-16 rounded-2xl bg-red-400 text-white font-bold text-xl font-heading shadow-[0_4px_12px_rgba(248,113,113,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-red-500"
        >
            <Icons.X className="w-6 h-6" /> Hang Up & Block
        </button>

        <button 
            onClick={handleTrust}
            className="w-full h-16 rounded-2xl bg-white text-gray-500 font-bold text-lg font-heading active:scale-95 transition-transform hover:bg-gray-50 border border-gray-200"
        >
            I'm Safe (Ignore)
        </button>
      </div>
      
    </div>
  );
};

export default GuardianAlert;
