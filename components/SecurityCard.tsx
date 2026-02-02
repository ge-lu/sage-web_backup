
import React, { useState } from 'react';
import { ShieldAlert, PhoneOff, MessageSquareWarning, ChevronRight, X, Check, Users, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { SecurityEvent } from '../types';

interface SecurityCardProps {
  event: SecurityEvent;
  onConfirm?: (id: string, action: 'safe' | 'block') => void;
  onAskForHelp?: (id: string) => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({ event, onConfirm, onAskForHelp }) => {
  const [dismissed, setDismissed] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);

  if (dismissed) return null;

  const isWarning = event.status === 'warning';

  const getIcon = () => {
    switch (event.type) {
      case 'sms_scam': return <MessageSquareWarning size={24} className="text-white" />;
      case 'call_spam': return <PhoneOff size={24} className="text-white" />;
      default: return <ShieldAlert size={24} className="text-white" />;
    }
  };

  const getTitle = () => {
    if (isWarning) {
      switch (event.type) {
        case 'sms_scam': return 'Suspicious Message';
        case 'call_spam': return 'Potential Spam Call';
        default: return 'Security Warning';
      }
    }
    switch (event.type) {
      case 'sms_scam': return 'Scam SMS Blocked';
      case 'call_spam': return 'Spam Call Blocked';
      case 'image_scam': return 'Suspicious Image';
      default: return 'Security Alert';
    }
  };

  const handleHelp = () => {
    setHelpRequested(true);
    if (onAskForHelp) onAskForHelp(event.id);
  };

  const handleConfirm = (action: 'safe' | 'block') => {
    setDismissed(true);
    if (onConfirm) onConfirm(event.id, action);
  };

  return (
    <div className={`${isWarning ? 'bg-white border-orange-500 shadow-orange-100' : 'bg-white border-red-500 shadow-red-100'} border rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all shadow-sm hover:shadow-md`}>
      
      <div className="flex items-start justify-between z-10">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isWarning ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
            {React.cloneElement(getIcon() as React.ReactElement, { className: "w-5 h-5", size: 20 })}
          </div>
          <div>
            <h3 className="font-bold font-heading text-lg text-gray-900 leading-tight">{getTitle()}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">{event.timestamp} • {event.source}</p>
          </div>
        </div>
        {!isWarning && (
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-900 p-1 -mr-2"
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {event.content && (
        <div className={`rounded-xl p-3 border ${isWarning ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-gray-700 text-sm italic font-medium">"{event.content}"</p>
        </div>
      )}

      {/* AI Analysis */}
      {event.aiAnalysis && (
        <div className="flex gap-2 items-start">
          <Sparkles size={16} className={`mt-0.5 shrink-0 ${isWarning ? 'text-orange-500' : 'text-red-500'}`} />
          <p className={`text-sm leading-relaxed ${isWarning ? 'text-orange-700' : 'text-red-700'}`}>{event.aiAnalysis}</p>
        </div>
      )}

      {/* Action Buttons for Warning State */}
      {isWarning ? (
        <div className="mt-1">
          {!helpRequested ? (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleConfirm('block')} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold font-heading uppercase tracking-wide text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                Block
              </button>
              <button onClick={() => handleConfirm('safe')} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-bold font-heading uppercase tracking-wide text-sm active:scale-95 transition-all">
                Allow
              </button>
              <button onClick={handleHelp} className="col-span-2 bg-orange-100 hover:bg-orange-200 text-orange-800 py-3 rounded-xl font-bold font-heading uppercase tracking-wide text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Users size={18} /> Ask Circle for Help
              </button>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center justify-center gap-2">
              <Check size={18} className="text-orange-500" />
              <span className="text-orange-700 font-bold font-heading uppercase tracking-wide text-sm">Sent to Safety Circle</span>
            </div>
          )}
        </div>
      ) : (
        /* Status Badges for Blocked State */
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-1">
          <div className="flex flex-col">
             <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Risk Score</span>
             <span className="text-red-500 font-black font-heading text-lg">{event.riskScore}/100</span>
          </div>
          <div className="ml-auto bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-600" strokeWidth={3} />
            <span className="text-emerald-700 text-xs font-bold font-heading uppercase tracking-wide">Intecepted</span>
          </div>
        </div>
      )}
    </div>
  );
};
