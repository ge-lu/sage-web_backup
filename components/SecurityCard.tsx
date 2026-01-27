
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
    <div className={`${isWarning ? 'bg-orange-500/10 border-orange-500/50' : 'bg-red-500/10 border-red-500/50'} border rounded-[24px] p-4 flex flex-col gap-3 relative overflow-hidden transition-all`}>
      <div className="absolute top-0 right-0 p-4 opacity-50">
        {isWarning ? <AlertTriangle size={64} className="text-orange-500/20" /> : <ShieldAlert size={64} className="text-red-500/20" />}
      </div>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isWarning ? 'bg-orange-500 shadow-orange-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">{getTitle()}</h3>
            <p className={`${isWarning ? 'text-orange-300' : 'text-red-300'} text-xs font-bold uppercase tracking-wider`}>{event.timestamp} • {event.source}</p>
          </div>
        </div>
        {!isWarning && (
          <button
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-white p-2"
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {event.content && (
        <div className="bg-black/40 rounded-xl p-3 border border-zinc-800 z-10">
          <p className="text-zinc-300 text-sm italic">"{event.content}"</p>
        </div>
      )}

      {/* AI Analysis */}
      {event.aiAnalysis && (
        <div className={`z-10 flex gap-2 p-2 rounded-lg ${isWarning ? 'bg-orange-900/30 border border-orange-500/20' : 'bg-red-900/30 border border-red-500/20'}`}>
          <Sparkles size={16} className={isWarning ? 'text-orange-400' : 'text-red-400'} />
          <p className={`text-xs ${isWarning ? 'text-orange-200' : 'text-red-200'}`}>{event.aiAnalysis}</p>
        </div>
      )}

      {/* Action Buttons for Warning State */}
      {isWarning ? (
        <div className="z-10 mt-2">
          {!helpRequested ? (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleConfirm('block')} className="bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm">
                Block & Delete
              </button>
              <button onClick={() => handleConfirm('safe')} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white py-2.5 rounded-xl font-bold text-sm">
                It's Safe
              </button>
              <button onClick={handleHelp} className="col-span-2 bg-orange-500 hover:bg-orange-600 text-black py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Users size={16} /> Ask Circle for Help
              </button>
            </div>
          ) : (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-3 flex items-center justify-center gap-2">
              <Check size={16} className="text-orange-400" />
              <span className="text-orange-300 font-bold text-sm">Sent to Safety Circle</span>
            </div>
          )}
        </div>
      ) : (
        /* Status Badges for Blocked State */
        <div className="flex items-center gap-2 z-10">
          <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
            <span className="text-red-400 text-xs font-bold">Risk Score: {event.riskScore}/100</span>
          </div>
          <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-1">
            <Check size={12} className="text-green-400" />
            <span className="text-green-400 text-xs font-bold">Intercepted</span>
          </div>
        </div>
      )}
    </div>
  );
};
