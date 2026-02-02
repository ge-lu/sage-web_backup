import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, Mic, Sparkles, ChevronRight, Square } from 'lucide-react';
import { FamilyMember } from '../types';

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Grandson Leo', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: '2', name: 'Daughter Sarah', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '3', name: 'Michael', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { id: '4', name: 'Emily', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
  { id: '5', name: 'Grandpa Joe', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joe' },
  { id: '6', name: 'Aunt Mary', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary' },
];

interface CreateGroupWizardProps {
  onCancel: () => void;
  onFinish: (name: string, members: string[]) => void;
}

const CreateGroupWizard: React.FC<CreateGroupWizardProps> = ({ onCancel, onFinish }) => {
  const [step, setStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['1', '3']);
  const [roomName, setRoomName] = useState('Nancy & Bob');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setRoomName(""); // Clear existing name or keep it? Clearing is clearer for "Say Name"
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRoomName(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const progress = (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-[110] bg-[#F5F7F9] flex flex-col font-sans select-none">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
            <ArrowLeft size={28} className="text-gray-900" />
          </button>
          <h1 className="text-gray-900 font-heading text-2xl font-bold tracking-tight">Create Group</h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-heading font-black text-gray-900 uppercase tracking-wide">Step {step} of 3</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 pt-8 pb-4 flex flex-col gap-2 flex-shrink-0">
        <div className="flex justify-between text-sm font-sans font-bold">
          <span className="text-gray-900">Creating Group</span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-guardian-blue transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
        {/* STEP 1: NAME THE ROOM (Originally Step 2) */}
        {step === 1 && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-12 mt-4 space-y-8 w-full max-w-xs flex flex-col items-center">
              <h2 className="text-3xl font-heading font-black text-gray-900 leading-tight">
                What's this group's name?
              </h2>

              <div className="relative w-full">
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-6 rounded-2xl text-2xl font-heading font-bold text-gray-900 text-center shadow-sm outline-none focus:ring-2 focus:ring-guardian-blue transition-all"
                />
              </div>

              <button
                onClick={handleVoiceInput}
                className={`w-full h-16 border rounded-2xl flex items-center justify-center gap-3 font-bold shadow-sm active:scale-95 transition-all
                  ${isRecording ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
              >
                {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} className="text-gray-400" />}
                <span className="text-xl font-heading font-bold">{isRecording ? 'Listening...' : 'Say Name'}</span>
              </button>

              <div className="bg-[#E8F5E8] text-[#13EC13] px-6 py-3 rounded-xl inline-flex items-center gap-2 font-black text-sm uppercase shadow-sm">
                <Sparkles size={18} />
                AI SUGGESTED
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PICK FAMILY (Originally Step 1) */}
        {step === 2 && (
          <div className="flex flex-col">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-3xl font-heading font-black text-gray-900">Pick the Family</h2>
              <p className="text-lg font-sans font-medium text-gray-500">Tap the people you want to add.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4">
              {FAMILY_MEMBERS.map(member => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 ring-white group-active:scale-95 transition-all">
                      <img src={member.avatarUrl} className="w-full h-full object-cover bg-gray-100" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-guardian-blue/60 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                          <div className="bg-white rounded-full p-3 shadow-lg">
                            <Check size={32} strokeWidth={4} className="text-guardian-blue" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-heading font-bold text-gray-900">{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="p-6 pb-24 bg-[#F5F7F9] border-t border-gray-200 flex-shrink-0">
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            className="w-full h-16 bg-guardian-blue text-white rounded-2xl text-xl font-heading font-black shadow-lg flex items-center justify-center gap-4 tracking-wide active:scale-95 transition-all uppercase"
          >
            Next
            <ChevronRight size={32} strokeWidth={4} />
          </button>
        )}

        {step === 2 && (
          <button
            onClick={() => onFinish(roomName, selectedMembers)}
            className="w-full h-16 bg-guardian-blue text-white rounded-2xl text-xl font-heading font-black shadow-lg flex items-center justify-center gap-4 tracking-wide active:scale-95 transition-all uppercase"
          >
            Finish
            <Check size={32} strokeWidth={4} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateGroupWizard;