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

// 将 24h 时间转为 AM/PM 显示
const formatTimeAMPM = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

// 将 frequency 转为 Repeat 显示
const getRepeatLabel = (frequency: string) => {
  const lower = frequency.toLowerCase();
  if (lower.includes('once') || lower.includes('daily') || lower.includes('每日1次')) return 'Daily';
  if (lower.includes('twice') || lower.includes('每日2次')) return 'Twice daily';
  if (lower.includes('three') || lower.includes('每日3次')) return 'Three times daily';
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
      className={`rounded-[24px] overflow-hidden shadow-card transition-all duration-300 relative border ${isExpired
        ? 'bg-white border-red-200'
        : isExpiringSoon
          ? 'bg-white border-amber-200'
          : isReminderActive && isActive
            ? 'bg-white border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
            : isTaken
              ? 'bg-gray-50 border-gray-200 opacity-70'
              : 'bg-white border-gray-200'
        }`}
    >
      {/* Left status bar - Expired / Expiring soon */}
      {(isExpired || isExpiringSoon) && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${isExpired ? 'bg-red-500' : 'bg-amber-500'}`}
        />
      )}

      {/* Top banners - 用药提醒 / 临期 / 过期（逻辑不变） */}
      {showReminderBanner && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">⏰</span>
            <span className="font-bold">Time to take — {displayTime || '—'}</span>
          </div>
        </div>
      )}
      {showExpiredBanner && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <Icons.AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-bold">
              Medication expired {expiryStatus ? `${expiryStatus.days} day${expiryStatus.days > 1 ? 's' : ''} ago` : ''}
            </span>
          </div>
        </div>
      )}
      {showExpiringSoonBanner && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <Icons.AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-bold">
              Expires in {expiryStatus?.days ?? 0} day{(expiryStatus?.days ?? 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Main content - 参考图布局 */}
      <div className={`p-5 ${hasTopBanner ? '' : ''}`}>
        {/* Header: Icon | Time + Frequency | Close */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isReminderActive && isActive ? 'bg-rose-100' : isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-amber-100' : 'bg-rose-50'
                }`}
            >
              <Icons.Heart
                className={`w-7 h-7 ${isReminderActive && isActive ? 'text-rose-600' : isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-rose-500'
                  }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${isReminderActive && isActive
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
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                  <Repeat className="w-3.5 h-3.5" />
                  {getRepeatLabel(medication.frequency)}
                </span>
              </div>
              <h3 className={`text-xl font-bold text-gray-900 ${isTaken ? 'text-gray-500' : ''}`}>
                {medication.name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Take {medication.dosage}
                {medication.instructions ? ` — ${medication.instructions}` : ''}
              </p>
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

        {/* Reminder Settings + 时间日期信息 - 由底部 chevron 折叠 */}
        {!isTaken && showSettingsAndDetails && (
          <div className="border-t border-gray-100 pt-4 pb-4">
            <div className="space-y-4 pb-4 pt-1">
              {/* Reminder Settings - 仅未过期时显示 */}
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

              {/* Expiry status - 临期进度条 / 过期标签 */}
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

              {/* 时间日期信息 */}
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
              className={`flex-1 font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform ${isExpired
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isReminderActive && isActive
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                }`}
            >
              <Icons.Check className="w-5 h-5" />
              {isExpired ? 'Expired' : isReminderActive && isActive ? 'Take Now' : 'Mark as Taken'}
            </button>
            <button
              onClick={() => (isExpired ? undefined : setIsMuted(!isMuted))}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isMuted ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              aria-label={isMuted ? 'Unmute' : 'Mute reminder'}
            >
              <BellOff className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowSettingsAndDetails(!showSettingsAndDetails)}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
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
