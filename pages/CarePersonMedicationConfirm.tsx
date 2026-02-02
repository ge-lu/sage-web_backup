import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../constants';
import type { MedicationConfirmRequest, MedicationConfirmItem } from '../types';

/** 演示用：无真实请求时展示的示例，方便直接打开 /medication-confirm 看界面和流程 */
const DEMO_REQUEST: MedicationConfirmRequest = {
  contactId: 'demo',
  contactName: 'John',
  senderName: 'Family member',
  summary: 'Review the medication details below. You can edit them, then confirm yourself or have a care person confirm.',
  medications: [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      times: ['08:00'],
      instructions: 'Take in the morning on an empty stomach',
      duration: 'Long-term',
      effectIntro: 'Blood pressure medication; lowers cardiovascular risk.',
      takeWithMeal: 'empty',
    },
  ],
  sentAt: new Date().toISOString(),
};

const takeWithMealLabel = (m: MedicationConfirmItem): string => {
  if (m.takeWithMeal === 'before') return 'Before meal';
  if (m.takeWithMeal === 'after') return 'After meal';
  if (m.takeWithMeal === 'with') return 'With meal';
  return 'On empty stomach';
};

const CarePersonMedicationConfirm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<MedicationConfirmRequest | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [changeNote, setChangeNote] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const state = location.state as { medicationConfirmRequest?: MedicationConfirmRequest } | null;
    if (state?.medicationConfirmRequest) {
      setRequest(state.medicationConfirmRequest);
      setIsDemo(false);
      return;
    }
    const stored = sessionStorage.getItem('medication-confirm-request');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MedicationConfirmRequest;
        setRequest(parsed);
        setIsDemo(false);
        return;
      } catch {
        // ignore
      }
    }
    setRequest(DEMO_REQUEST);
    setIsDemo(true);
  }, [location.state]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{
        contactId: string;
        contactName: string;
        summary: string;
        imageDataUrl?: string | null;
        medications: MedicationConfirmItem[];
      }>;
      const d = ev.detail;
      if (!d?.medications?.length) return;
      const payload: MedicationConfirmRequest = {
        contactId: d.contactId,
        contactName: d.contactName,
        senderName: 'Family member',
        summary: d.summary,
        imageDataUrl: d.imageDataUrl ?? undefined,
        medications: d.medications,
        sentAt: new Date().toISOString(),
      };
      sessionStorage.setItem('medication-confirm-request', JSON.stringify(payload));
      setRequest(payload);
      setIsDemo(false);
    };
    window.addEventListener('medication-confirm-request', handler);
    return () => window.removeEventListener('medication-confirm-request', handler);
  }, []);

  const handleConfirm = async () => {
    if (!request) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setConfirmed(true);
    setIsSubmitting(false);
    sessionStorage.removeItem('medication-confirm-request');
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  const handleRequestChanges = async () => {
    if (!request) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setShowRequestChanges(false);
    setChangeNote('');
    setIsSubmitting(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100);
  };

  const handleDone = () => {
    navigate(-1);
  };

  if (!request) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col p-6 pb-safe-offset">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
        <p className="text-gray-500 text-center">No medication confirmation request found.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-8 w-full h-14 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg active:scale-95">
          Back
        </button>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col p-6 pb-safe-offset">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
        <div className="flex items-center justify-center gap-3 mb-4 flex-1">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 border border-green-200 flex items-center justify-center shrink-0">
            <Icons.Check className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Confirmed</h2>
            <p className="text-sm text-gray-600">You’ve confirmed this medication summary. The sender will be notified.</p>
          </div>
        </div>
        <button onClick={handleDone} className="w-full h-14 bg-guardian-blue text-white rounded-2xl font-bold text-lg font-heading active:scale-95">
          Done
        </button>
      </div>
    );
  }

  if (showRequestChanges) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col p-6 pb-safe-offset">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Request changes</h2>
        <p className="text-sm text-gray-500 mb-4">Tell the sender what to correct. They’ll get your message.</p>
        <textarea
          value={changeNote}
          onChange={(e) => setChangeNote(e.target.value)}
          placeholder="e.g. Please update the dosage for Lisinopril to 20mg."
          className="w-full min-h-[120px] rounded-2xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-guardian-blue focus:outline-none resize-none"
          maxLength={500}
        />
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setShowRequestChanges(false)} className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg active:scale-95">
            Cancel
          </button>
          <button type="button" onClick={handleRequestChanges} disabled={isSubmitting} className="flex-1 h-14 bg-amber-500 text-white rounded-2xl font-bold text-lg active:scale-95 disabled:opacity-60">
            {isSubmitting ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </div>
    );
  }

  const senderLabel = request.senderName || request.contactName || 'Family member';

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 p-4 sm:p-6 pb-safe-offset">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-3 shrink-0" />
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">Medication confirmation</h1>
        <p className="text-sm text-gray-500 mb-1">A family member has asked you to review and confirm this medication summary.</p>
        <p className="text-sm font-bold text-guardian-blue mb-4">From: {senderLabel}</p>
        {isDemo && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">Demo — showing sample data. Real requests come from the sender or a link.</p>
        )}
        {request.summary && (
          <p className="text-sm text-gray-600 mb-4 rounded-xl bg-gray-50 border border-gray-100 p-3">{request.summary}</p>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
          {request.medications.map((med, idx) => (
            <div key={idx} className="bg-blue-50/60 rounded-2xl border-2 border-blue-100 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{med.name}</h3>
                <span className="text-sm font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shrink-0">{med.dosage}</span>
              </div>
              {med.effectIntro && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Purpose</p>
                  <p className="text-base text-gray-800 leading-relaxed">{med.effectIntro}</p>
                </div>
              )}
              <div className="grid gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Duration</p>
                  <p className="text-base text-gray-800">{med.duration || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Times per day</p>
                  <p className="text-base text-gray-800">{med.frequency}{med.times?.length ? ` · ${med.times.join(', ')}` : ''}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Take (with meal)</p>
                  <p className="text-base text-gray-800">{takeWithMealLabel(med)}{med.instructions ? ` · ${med.instructions}` : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {request.imageDataUrl && (
          <details className="mb-3 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <summary className="text-xs font-bold text-gray-500 px-4 py-2 cursor-pointer list-none flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full" /> Scan reference image
            </summary>
            <img src={request.imageDataUrl} alt="Scan reference" className="w-full max-h-44 object-contain bg-white" />
          </details>
        )}

        <div className="flex gap-3 mt-auto">
          <button type="button" onClick={() => setShowRequestChanges(true)} className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg active:scale-95">
            Request changes
          </button>
          <button type="button" onClick={handleConfirm} disabled={isSubmitting} className="flex-1 h-14 bg-guardian-blue text-white rounded-2xl font-bold text-lg font-heading active:scale-95 disabled:opacity-60">
            {isSubmitting ? 'Confirming…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarePersonMedicationConfirm;
