import React, { useState, useEffect } from 'react';
import { Repeat, Bell, BellOff, Volume2 } from 'lucide-react';
import { Icons } from '../constants';
import { Medication } from '../types';

interface MedicationCardProps {
  medication: Medication;
  isReminderActive?: boolean;
  onTake: () => void;
  onUpdate: (updates: Partial<Medication>) => void;
  onDelete: () => void;
}

// Format 24h time as AM/PM
const formatTimeAMPM = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

// Map frequency string to repeat label
const getRepeatLabel = (frequency: string) => {
  const lower = frequency.toLowerCase();
  if (lower.includes('once') || lower.includes('daily')) return 'Daily';
  if (lower.includes('twice')) return 'Twice daily';
  if (lower.includes('three')) return 'Three times daily';
  if (lower.includes('every 8') || lower.includes('8 hour')) return 'Every 8 hours';
  return frequency;
};

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  isReminderActive = false,
  onTake,
  onUpdate,
  onDelete
}) => {
  const [showSettingsAndDetails, setShowSettingsAndDetails] = useState(false);
  const [isTaken, setIsTaken] = useState(medication.status === 'completed');
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [alertSound, setAlertSound] = useState<'chime' | 'bell'>('chime');
  const [isMuted, setIsMuted] = useState(false);

  const getNextTime = () => {
    if (!medication.times || medication.times.length === 0) return null;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const sortedTimes = [...medication.times].sort();
    return sortedTimes.find(time => time > currentTime) || sortedTimes[0];
  };

  const nextTime = getNextTime();
  const isActive = medication.status === 'active';

  const getExpiryStatus = () => {
    if (!medication.expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(medication.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { status: 'expired' as const, days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 7) return { status: 'expiring_soon' as const, days: daysUntilExpiry };
    return null;
  };

  const expiryStatus = getExpiryStatus();
  const isExpired = expiryStatus?.status === 'expired';
  const isExpiringSoon = expiryStatus?.status === 'expiring_soon';
  const showReminderBanner = isReminderActive && isActive && !isTaken && !isExpired;
  const showExpiredBanner = isExpired && !isTaken;
  const showExpiringSoonBanner = isExpiringSoon && !isExpired && !isTaken;
  const hasTopBanner = showReminderBanner || showExpiredBanner || showExpiringSoonBanner;
  const expiryProgressPercent = expiryStatus?.status === 'expiring_soon'
    ? Math.max(0, ((expiryStatus?.days ?? 0) / 7) * 100)
    : 100;

  useEffect(() => {
    if (isReminderActive && isActive && !isMuted) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [isReminderActive, isActive, isMuted]);

  const handleTake = () => {
    setIsTaken(true);
    onUpdate({ status: 'active' });
    onTake();
  };

  const displayTime = nextTime && medication.times?.includes(nextTime) ? nextTime : medication.times?.[0];

  return (
    <article
      className={`rounded-xl overflow-hidden shadow-sm transition-all duration-300 relative border ${
        isReminderActive && isActive
          ? 'bg-white border-blue-400 ring-4 ring-blue-50'
          : 'bg-white border-blue-200'
      } hover:shadow-md`}
    >
      {/* Top banners: reminder / expiring soon / expired */}
      {showReminderBanner && (
        <div className="bg-blue-50 border-b border-blue-100 text-blue-700 py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl animate-pulse">⏰</span>
            <span className="font-bold font-heading">Time to take — {displayTime || '—'}</span>
          </div>
        </div>
      )}
      {showExpiredBanner && (
        <div className="bg-blue-50 border-b border-blue-100 text-gray-500 py-3 px-4 opacity-80 mix-blend-multiply">
          <div className="flex items-center justify-center gap-2">
            <Icons.AlertTriangle className="w-5 h-5 shrink-0 text-gray-400" />
            <span className="font-bold font-heading">
              Medication expired {expiryStatus ? `${expiryStatus.days} day${expiryStatus.days > 1 ? 's' : ''} ago` : ''}
            </span>
          </div>
        </div>
      )}
      {showExpiringSoonBanner && (
        <div className="bg-blue-50 border-b border-blue-100 text-blue-800 py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <Icons.AlertTriangle className="w-5 h-5 shrink-0 text-blue-500" />
            <span className="font-bold font-heading">
              Expires in {expiryStatus?.days ?? 0} day{(expiryStatus?.days ?? 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`p-5 ${hasTopBanner ? '' : ''}`}>
        {/* Header: Icon | Time + Frequency + Name (single line) | Close */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 shrink">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isReminderActive && isActive ? 'bg-rose-100' : isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-amber-100' : 'bg-rose-50'
                }`}
            >
              <Icons.Heart
                className={`w-6 h-6 ${isReminderActive && isActive ? 'text-rose-600' : isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-rose-500'
                  }`}
              />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1 flex-nowrap">
              <span
                className={`inline-flex items-center shrink-0 gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isReminderActive && isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : isExpired
                    ? 'bg-red-100 text-red-700'
                    : isExpiringSoon
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {displayTime ? formatTimeAMPM(displayTime) : '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 shrink-0 whitespace-nowrap">
                <Repeat className="w-3 h-3" />
                {getRepeatLabel(medication.frequency)}
              </span>
              <h3 className={`text-base font-bold text-gray-900 truncate min-w-0 ${isTaken ? 'text-gray-500' : ''}`}>
                {medication.name}
              </h3>
            </div>
          </div>
          {!isTaken && (
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors shrink-0"
              aria-label="Delete medication"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>
        {(medication.dosage || medication.instructions) && (
          <p className="text-xs text-gray-500 truncate mb-3 whitespace-nowrap" title={`Take ${medication.dosage}${medication.instructions ? ` — ${medication.instructions}` : ''}`}>
            Take {medication.dosage}
            {medication.instructions ? ` — ${medication.instructions}` : ''}
          </p>
        )}

        {/* Reminder Settings + date/time (collapsible) */}
        {!isTaken && showSettingsAndDetails && (
          <div className="border-t border-gray-100 pt-4 pb-4">
            <div className="space-y-4 pb-4 pt-1">
              {/* Reminder Settings (when not expired) */}
              {!isExpired && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Repeat className="w-4 h-4" />
                      <span className="text-sm font-medium">Repeat</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{getRepeatLabel(medication.frequency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm font-medium">Snooze</span>
                    </div>
                    <button
                      onClick={() => setSnoozeEnabled(!snoozeEnabled)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${snoozeEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${snoozeEnabled ? 'left-6' : 'left-1'}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Alert Sound</span>
                    </div>
                    <select
                      value={alertSound}
                      onChange={(e) => setAlertSound(e.target.value as 'chime' | 'bell')}
                      className="text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 cursor-pointer"
                    >
                      <option value="chime">Chime</option>
                      <option value="bell">Bell</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Expiry status: progress bar or expired label */}
              {expiryStatus && (
                <div>
                  {isExpiringSoon ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-amber-700">Expires in {expiryStatus.days} day{expiryStatus.days > 1 ? 's' : ''}</span>
                        <span className="text-amber-600">{expiryStatus.days}/7 days</span>
                      </div>
                      <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${expiryProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-700 border border-red-200 text-sm font-bold">
                      <Icons.AlertTriangle className="w-4 h-4" />
                      Expired {expiryStatus.days} day{expiryStatus.days > 1 ? 's' : ''} ago
                    </div>
                  )}
                </div>
              )}

              {/* Date / time info */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm space-y-2">
                <div><span className="font-bold text-gray-700">Start: </span><span className="text-gray-600">{medication.startDate}</span></div>
                {medication.endDate && <div><span className="font-bold text-gray-700">End: </span><span className="text-gray-600">{medication.endDate}</span></div>}
                {medication.expiryDate && (
                  <div>
                    <span className="font-bold text-gray-700">Expiry: </span>
                    <span className={isExpired ? 'text-red-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : 'text-gray-600'}>
                      {medication.expiryDate}
                    </span>
                  </div>
                )}
                {nextTime && <div><span className="font-bold text-gray-700">Next: </span><span className="text-gray-600">{nextTime}</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons - Take Now + Mute/Details */}
        {!isTaken ? (
          <div className="flex gap-3">
            <button
              onClick={handleTake}
              disabled={isExpired}
              className={`flex-1 font-bold font-heading uppercase tracking-wide text-base py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform ${isExpired
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                }`}
            >
              <Icons.Check className="w-5 h-5" />
              {isExpired ? 'Expired' : isReminderActive && isActive ? 'Take Now' : 'Mark as Taken'}
            </button>
            <button
              onClick={() => (isExpired ? undefined : setIsMuted(!isMuted))}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isMuted ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 border border-transparent hover:border-blue-100'}`}
              aria-label={isMuted ? 'Unmute' : 'Mute reminder'}
            >
              <BellOff className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettingsAndDetails(!showSettingsAndDetails)}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
              aria-label="Expand settings"
              aria-expanded={showSettingsAndDetails}
            >
              <Icons.ChevronDown className={`w-5 h-5 transition-transform ${showSettingsAndDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>
        ) : (
          <div className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-2xl flex items-center justify-center gap-2">
            <Icons.Check className="w-5 h-5" />
            Taken
          </div>
        )}
      </div>
    </article>
  );
};
